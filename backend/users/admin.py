from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Product, Address  # Importando os modelos

# Registro do CustomUser no Django Admin
@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    # Campos que serão exibidos na lista de usuários no Django Admin
    list_display = ('username', 'email', 'is_staff', 'is_active', 'avatar')
    # Filtros disponíveis na barra lateral do Django Admin
    list_filter = ('is_staff', 'is_active', 'is_superuser')
    # Campos que podem ser pesquisados
    search_fields = ('username', 'email', 'avatar')
    # Campos para exibição no formulário de detalhes
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('avatar',)}),  # Adicionando o campo avatar
    )
    # Campos que serão exibidos na seção de detalhes de um usuário
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('avatar',)}),  # Adicionando o campo avatar ao formulário de criação
    )
    # Define a ordenação por padrão, sendo por 'username'
    ordering = ('username',)


# Registro do Product no Django Admin
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    # Campos que serão exibidos na lista de produtos
    list_display = ('name', 'quantity', 'wholesale_price', 'retail_price', 'reference', 'user')
    # Campos que podem ser pesquisados
    search_fields = ('name', 'reference')
    # Filtros disponíveis na barra lateral para facilitar a busca
    list_filter = ('user', 'color', 'size')
    # Ordenação padrão por 'id'
    ordering = ('-id',)
    # Definindo o número de produtos por página
    list_per_page = 20


# Registro do Address no Django Admin
@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    # Campos que serão exibidos na lista de endereços
    list_display = ('user', 'street', 'neighborhood', 'city', 'state', 'is_default')
    # Campos que podem ser pesquisados
    search_fields = ('street', 'neighborhood', 'city', 'state')
    # Filtros disponíveis para facilitar a busca
    list_filter = ('user', 'is_default')
    # Ordenação por 'id'
    ordering = ('-id',)
    # Quantidade de endereços por página
    list_per_page = 20
