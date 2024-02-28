from django.db import models
from django.contrib.auth.models import User

class QRCode(models.Model):
    name = models.CharField(max_length=255)
    content = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to='qr_codes/', null=True, blank=True)
