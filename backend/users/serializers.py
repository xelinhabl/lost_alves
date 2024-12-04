from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Address, Product

# Obtém o modelo de usuário personalizado
User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'is_superuser']  # Adicionando o campo is_superuser
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
        fields = ('username', 'email', 'avatar', 'addresses', 'is_superuser')  # Incluindo 'is_superuser'

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

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['name', 'quantity', 'color', 'size', 'wholesale_price', 'retail_price', 'reference', 'photo']

    def validate(self, data):
        """
        Valida se os preços e quantidades são positivos e evita duplicação de produtos com o mesmo nome e referência.
        """
        # Validação para evitar duplicação de produto
        if Product.objects.filter(name=data['name'], reference=data['reference']).exists():
            raise serializers.ValidationError("Produto com esse nome e referência já existe.")

        # Valida a quantidade (deve ser maior que 0)
        if data.get('quantity', 0) <= 0:
            raise serializers.ValidationError("A quantidade deve ser maior que zero.")

        # Valida os preços (devem ser maiores que 0)
        if data.get('wholesale_price', 0) <= 0:
            raise serializers.ValidationError("O preço de atacado deve ser maior que zero.")
        
        if data.get('retail_price', 0) <= 0:
            raise serializers.ValidationError("O preço de varejo deve ser maior que zero.")

        return data

    def create(self, validated_data):
        # Obtém o usuário do contexto (request) e adiciona ao validated_data
        user = self.context['request'].user
        validated_data['user'] = user

        # Cria o produto
        product = Product.objects.create(**validated_data)
        return product
