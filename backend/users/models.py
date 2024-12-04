from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth import get_user_model


class CustomUser(AbstractUser):
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)


User = get_user_model()

class Address(models.Model):
    user = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL,  # Define o campo como NULL se o usuário for excluído
        null=True,                  # Permite valores NULL no campo user
        blank=True,                 # Permite deixar o campo vazio no formulário
        related_name="addresses"
    )
    street = models.CharField(max_length=255)
    neighborhood = models.CharField(max_length=255)
    city = models.CharField(max_length=255)
    state = models.CharField(max_length=255)
    postal_code = models.CharField(max_length=10)
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.street}, {self.city} - {self.state}"

    class Meta:
        verbose_name = "Address"
        verbose_name_plural = "Addresses"


class Product(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    quantity = models.IntegerField()
    color = models.CharField(max_length=50, null=True, blank=True)
    size = models.CharField(max_length=50, null=True, blank=True)
    wholesale_price = models.DecimalField(max_digits=10, decimal_places=2)
    retail_price = models.DecimalField(max_digits=10, decimal_places=2)
    reference = models.CharField(max_length=100)
    photo = models.ImageField(upload_to='products/', blank=True, null=True)

    def __str__(self):
        return self.name