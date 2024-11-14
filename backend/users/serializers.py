from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Address

# Obtém o modelo de usuário personalizado
User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True}  # Garante que a senha seja apenas para escrita
        }

    def create(self, validated_data):
        # Cria o usuário com o método create_user para garantir que a senha seja salva corretamente
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    # Campo para incluir os endereços do usuário
    addresses = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('username', 'email', 'avatar', 'addresses')  # Inclui os campos 'addresses'

    def get_addresses(self, obj):
        # Este método será usado para pegar os endereços do usuário
        addresses = Address.objects.filter(user=obj)
        return AddressSerializer(addresses, many=True).data

class AvatarSerializer(serializers.ModelSerializer):
    class Meta:
        model = User  # Alterado para usar get_user_model()
        fields = ['avatar']  # Presume-se que o campo 'avatar' esteja no modelo User

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'street', 'neighborhood', 'city', 'state', 'postal_code', 'is_default']

    def create(self, validated_data):
        # Obtém o usuário do contexto (já é o usuário autenticado no request)
        user = self.context['request'].user

        # Verifica se o campo 'is_default' foi passado, se for o caso, trata a lógica
        if validated_data.get("is_default", False):
            # Define todos os outros endereços como não padrão, caso o novo seja marcado como padrão
            Address.objects.filter(user=user, is_default=True).update(is_default=False)

        # Inclui o 'user' no validated_data
        validated_data['user'] = user

        # Agora cria o endereço com o campo 'user' já incluído no validated_data
        address = Address.objects.create(**validated_data)

        return address
