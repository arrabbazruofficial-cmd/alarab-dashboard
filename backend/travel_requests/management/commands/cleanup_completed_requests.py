from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from travel_requests.models import BaseRequest
from audit.models import AuditLog

class Command(BaseCommand):
    help = 'Deletes passenger details and uploaded documents for requests completed more than 5 days ago.'

    def handle(self, *args, **options):
        threshold_date = timezone.now() - timedelta(days=5)
        
        # Find requests that are COMPLETED and updated_at is older than 5 days
        requests_to_cleanup = BaseRequest.objects.filter(
            status='COMPLETED',
            updated_at__lte=threshold_date
        )
        
        count = 0
        for req in requests_to_cleanup:
            # Flag to check if we actually deleted something
            cleaned_something = False
            
            # Delete passenger documents and records
            passengers = req.passengers.all()
            if passengers.exists():
                for passenger in passengers:
                    if passenger.passport_document:
                        try:
                            passenger.passport_document.delete(save=False)
                        except Exception as e:
                            self.stdout.write(self.style.WARNING(f"Could not delete passport file for {passenger.id}: {e}"))
                    passenger.delete()
                cleaned_something = True
                
            # Delete attachments
            attachments = req.attachments.all()
            if attachments.exists():
                for attachment in attachments:
                    if attachment.file:
                        try:
                            attachment.file.delete(save=False)
                        except Exception as e:
                            self.stdout.write(self.style.WARNING(f"Could not delete attachment file for {attachment.id}: {e}"))
                    attachment.delete()
                cleaned_something = True
                
            if cleaned_something:
                AuditLog.objects.create(
                    action="CLEANUP_COMPLETED_REQUEST",
                    target_type="BaseRequest",
                    target_id=str(req.id),
                    details={"message": "Deleted passenger details and attachments for >5 days completed request."}
                )
                count += 1
            
        self.stdout.write(self.style.SUCCESS(f'Successfully cleaned up PII and documents for {count} completed requests.'))
