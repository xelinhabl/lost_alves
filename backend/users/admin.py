from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser  # Importe o modelo CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    # Você pode personalizar os campos a serem exibidos no admin
    list_display = ('username', 'email', 'is_staff', 'is_active', 'avatar')
    list_filter = ('is_staff', 'is_active', 'is_superuser')
    search_fields = ('username', 'email', 'avatar')

