from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RequestViewSet, AttachmentViewSet, PassengerViewSet

router = DefaultRouter()
router.register(r'attachments', AttachmentViewSet, basename='attachment')
router.register(r'passengers', PassengerViewSet, basename='passenger')
router.register(r'', RequestViewSet, basename='request')

urlpatterns = [
    path('', include(router.urls)),
]
