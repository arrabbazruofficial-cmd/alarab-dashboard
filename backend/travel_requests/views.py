from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
import openpyxl
import zipfile
import io
from .models import BaseRequest, Attachment, Passenger
from .serializers import BaseRequestSerializer, AttachmentSerializer, PassengerSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from core.emails import notify_admins_new_request, notify_user_status_change


class RequestViewSet(viewsets.ModelViewSet):
    serializer_class = BaseRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['request_type', 'status', 'agency']
    search_fields = ['id', 'agency__company_name']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if user.role in ['SUPER_ADMIN', 'ADMIN']:
            return BaseRequest.objects.all()
        elif user.role == 'AGENCY':
            from agencies.models import Agency
            Agency.objects.get_or_create(
                user=user,
                defaults={'company_name': 'Unknown Agency', 'contact_person': 'Owner', 'phone_number': ''}
            )
            return BaseRequest.objects.filter(agency__user=user)
        elif user.role == 'CUSTOMER':
            return BaseRequest.objects.filter(customer=user)
        return BaseRequest.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'AGENCY':
            from agencies.models import Agency
            agency, _ = Agency.objects.get_or_create(
                user=user,
                defaults={'company_name': 'Unknown Agency', 'contact_person': 'Owner', 'phone_number': ''}
            )
            serializer.save(agency=agency)
        elif user.role == 'CUSTOMER':
            serializer.save(customer=user)
        else:
            serializer.save()
            
        # Create notification
        from notifications.models import Notification, NotificationType
        Notification.objects.create(
            user=user,
            title='Request Submitted',
            message=f'Your {serializer.instance.get_request_type_display()} request has been successfully submitted.',
            notification_type=NotificationType.REQUEST_SUBMITTED,
            related_request_id=serializer.instance.id
        )
        
        notify_admins_new_request(serializer.instance.request_type, str(serializer.instance.id))

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        qs = self.get_queryset()
        
        # Calculate stats
        total = qs.count()
        pending = qs.filter(status__in=['SUBMITTED', 'UNDER_REVIEW']).count()
        processing = qs.filter(status='PROCESSING').count()
        completed = qs.filter(status__in=['APPROVED', 'COMPLETED']).count()
        rejected = qs.filter(status='REJECTED').count()
        draft = qs.filter(status='DRAFT').count()
        
        # Distribution
        distribution = {
            'group_visa': qs.filter(request_type='GROUP_VISA').count(),
            'individual_visa': qs.filter(request_type='INDIVIDUAL_VISA').count(),
            'air_ticket': qs.filter(request_type='AIR_TICKET').count(),
        }

        # Recent requests
        recent = qs.order_by('-created_at')[:5]
        recent_data = BaseRequestSerializer(recent, many=True).data

        return Response({
            'total_requests': total,
            'pending_requests': pending,
            'processing_requests': processing,
            'completed_requests': completed,
            'rejected_requests': rejected,
            'draft_requests': draft,
            'distribution': distribution,
            'recent_requests': recent_data
        })

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        if request.user.role not in ['SUPER_ADMIN', 'ADMIN']:
            return Response(status=status.HTTP_403_FORBIDDEN)
        
        obj = self.get_object()
        new_status = request.data.get('status')
        if not new_status:
            return Response({'detail': 'Status is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        obj.status = new_status
        obj.save()

        # Create notification
        from notifications.models import Notification, NotificationType
        user_to_notify = obj.customer if obj.customer else (obj.agency.user if obj.agency else None)
        if user_to_notify:
            Notification.objects.create(
                user=user_to_notify,
                title='Request Status Updated',
                message=f'Your request ({obj.id}) is now {new_status}.',
                notification_type=NotificationType.STATUS_CHANGED,
                related_request_id=obj.id
            )
            notify_user_status_change(user_to_notify.email, str(obj.id), new_status)

        return Response(BaseRequestSerializer(obj).data)

    @action(detail=False, methods=['get'])
    def export_excel(self, request):
        if request.user.role != 'SUPER_ADMIN':
            return Response(status=status.HTTP_403_FORBIDDEN)
        
        # We need to filter exactly like the list view
        queryset = self.filter_queryset(self.get_queryset())
        
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Requests Export"
        
        headers = [
            "Request ID", "Agency", "Customer", "Request Type", "Status",
            "Created Date", "Updated Date", "Assigned Admin", "Passenger Count",
            "Notes"
        ]
        ws.append(headers)
        
        for req in queryset:
            agency_name = req.agency.company_name if hasattr(req, 'agency') and req.agency else ''
            customer_email = req.customer.email if req.customer else ''
            assigned_email = req.assigned_to.email if req.assigned_to else ''
            passenger_count = req.passengers.count() if hasattr(req, 'passengers') else 0
            
            row = [
                str(req.id), agency_name, customer_email, req.get_request_type_display(),
                req.get_status_display(), req.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                req.updated_at.strftime('%Y-%m-%d %H:%M:%S'), assigned_email, passenger_count,
                req.admin_notes
            ]
            ws.append(row)
            
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename=Requests_Export.xlsx'
        wb.save(response)
        
        # Log to audit (simplified placeholder, should use core audit_logger)
        print(f"Audit: SuperAdmin {request.user.email} exported requests to Excel.")
        
        return response

    @action(detail=True, methods=['get'])
    def download_passports(self, request, pk=None):
        if request.user.role not in ['SUPER_ADMIN', 'ADMIN']:
            return Response(status=status.HTTP_403_FORBIDDEN)
            
        obj = self.get_object()
        passengers = obj.passengers.exclude(passport_document='')
        
        if not passengers.exists():
            return Response({'detail': 'No passports found for this request.'}, status=status.HTTP_404_NOT_FOUND)
            
        import requests
        
        if passengers.count() == 1:
            # Single file download
            passenger = passengers.first()
            file_url = passenger.passport_document.url
            if file_url.startswith('http'):
                file_response = requests.get(file_url)
                response = HttpResponse(file_response.content, content_type=file_response.headers.get('content-type', 'application/pdf'))
            else:
                response = HttpResponse(passenger.passport_document.read(), content_type='application/pdf')
                
            response['Content-Disposition'] = f'attachment; filename="Passport_{passenger.full_name}.pdf"'
            return response
            
        # Multiple files - Zip
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED, False) as zip_file:
            for idx, passenger in enumerate(passengers, 1):
                file_url = passenger.passport_document.url
                try:
                    if file_url.startswith('http'):
                        file_data = requests.get(file_url).content
                    else:
                        passenger.passport_document.seek(0)
                        file_data = passenger.passport_document.read()
                        
                    ext = file_url.split('.')[-1]
                    if len(ext) > 4: ext = "pdf"
                    filename = f"{idx:02d}_{passenger.full_name.replace(' ', '_')}.{ext}"
                    zip_file.writestr(filename, file_data)
                except Exception as e:
                    print(f"Failed to fetch passport for {passenger.full_name}: {e}")
                    
        response = HttpResponse(zip_buffer.getvalue(), content_type='application/zip')
        response['Content-Disposition'] = f'attachment; filename="Passports_Request_{str(obj.id)[:8]}.zip"'
        return response



class AttachmentViewSet(viewsets.ModelViewSet):
    serializer_class = AttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['SUPER_ADMIN', 'ADMIN']:
            return Attachment.objects.all()
        return Attachment.objects.filter(request__agency__user=user) | Attachment.objects.filter(request__customer=user)

    def perform_create(self, serializer):
        file_obj = self.request.FILES.get('file')
        if file_obj:
            serializer.save(
                uploaded_by=self.request.user,
                file_name=file_obj.name,
                file_type=file_obj.content_type,
                file_size=file_obj.size
            )
        else:
            serializer.save(uploaded_by=self.request.user)

    def perform_update(self, serializer):
        file_obj = self.request.FILES.get('file')
        if file_obj:
            serializer.save(
                file_name=file_obj.name,
                file_type=file_obj.content_type,
                file_size=file_obj.size
            )
        else:
            serializer.save()

class PassengerViewSet(viewsets.ModelViewSet):
    serializer_class = PassengerSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['SUPER_ADMIN', 'ADMIN']:
            return Passenger.objects.all()
        return Passenger.objects.filter(request__agency__user=user) | Passenger.objects.filter(request__customer=user)

    @action(detail=True, methods=['patch'])
    def upload(self, request, pk=None):
        passenger = self.get_object()
        file_obj = request.FILES.get('passport_document')
        if not file_obj:
            return Response({'detail': 'No document provided.'}, status=status.HTTP_400_BAD_REQUEST)
        
        passenger.passport_document = file_obj
        passenger.save()
        return Response(PassengerSerializer(passenger).data)
