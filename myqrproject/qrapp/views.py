import logging
from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import QRCode
from .serializers import QRCodeSerializer
import qrcode
from io import BytesIO
from django.core.files import File
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from rest_framework.permissions import IsAuthenticated
from django.db import IntegrityError
from django.core.exceptions import ValidationError
from django.http import Http404
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404

# Configure logging
logger = logging.getLogger(__name__)

class QRCodeViewSet(viewsets.ModelViewSet):
    queryset = QRCode.objects.all()
    serializer_class = QRCodeSerializer
    permission_classes = [IsAuthenticated]  # Ensure that the user is authenticated

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                qr_code = serializer.save()  # Save the QR code instance to the database

                # Generate QR Code
                qr = qrcode.QRCode(
                    version=1,
                    error_correction=qrcode.constants.ERROR_CORRECT_L,
                    box_size=10,
                    border=4,
                )
                qr.add_data(qr_code.content)
                qr.make(fit=True)
                img = qr.make_image(fill_color="black", back_color="white")

                # Save QR Code image
                buffer = BytesIO()
                img.save(buffer, format="PNG")
                buffer.seek(0)
                qr_code.image.save(f"qr_code_{qr_code.id}.png", File(buffer), save=True)
                qr_code.save()

                # Notify via Channels
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    "qr_code_notifications",  # This should match with your consumer group name
                    {
                        "type": "qr_code.notification",  # This should match with your consumer method
                        "event": "New QR Code",
                        "qr_code_id": qr_code.id
                    }
                )

                return Response(serializer.data, status=status.HTTP_201_CREATED)

            except IntegrityError as e:
                logger.error(f"Integrity error while saving QR code: {e}")
                return Response({"detail": "QR code with this content already exists."}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f"Unexpected error: {e}")
                return Response({"detail": "Failed to generate QR code."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request, *args, **kwargs):
        # List all QR codes, you may want to paginate this if there are many QR codes
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, pk=None, *args, **kwargs):
        # Retrieve a specific QR code by id
        try:
            qr_code = self.get_object()
            serializer = self.get_serializer(qr_code)
            return Response(serializer.data)
        except Http404:
            return Response({"detail": "QR code not found."}, status=status.HTTP_404_NOT_FOUND)

    def update(self, request, pk=None, *args, **kwargs):
        qr_code = get_object_or_404(QRCode, pk=pk)
        serializer = self.get_serializer(qr_code, data=request.data)
        if serializer.is_valid():
            try:
                old_content = qr_code.content
                qr_code = serializer.save()
                new_content = qr_code.content

                # Check if the content has changed and regenerate the QR code image
                if old_content != new_content:
                    qr = qrcode.QRCode(
                        version=1,
                        error_correction=qrcode.constants.ERROR_CORRECT_L,
                        box_size=10,
                        border=4,
                    )
                    qr.add_data(new_content)
                    qr.make(fit=True)
                    img = qr.make_image(fill_color="black", back_color="white")

                    # Save the new QR Code image
                    buffer = BytesIO()
                    img.save(buffer, format="PNG")
                    buffer.seek(0)
                    qr_code.image.save(f"qr_code_{qr_code.id}.png", File(buffer), save=True)

                    # If you want to notify via channels that a QR code was updated,
                    # you can do that here as you did in the create method.

                return Response(serializer.data)

            except IntegrityError as e:
                logger.error(f"Integrity error while updating QR code: {e}")
                return Response({"detail": "Error occurred during the update."}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f"Unexpected error: {e}")
                return Response({"detail": "Failed to update QR code."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None, *args, **kwargs):
        try:
            qr_code = self.get_object()
            qr_code.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Http404:
            return Response({"detail": "QR code not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return Response({"detail": "Failed to delete QR code."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)