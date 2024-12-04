from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view
from .models import Address
from .serializers import UserProfileSerializer, AvatarSerializer, AddressSerializer, ProductSerializer, Product
from rest_framework import generics

User = get_user_model()  # Sempre use essa abordagem para garantir que o modelo correto seja referenciado.

# Registro do Usuário
class RegisterUserView(APIView):
    def post(self, request):
        try:
            username = request.data.get('username')
            email = request.data.get('email')
            password = request.data.get('password')

            # Validações de campos obrigatórios
            if not username or not email or not password:
                return Response({"error": "Todos os campos são obrigatórios."}, status=status.HTTP_400_BAD_REQUEST)

            # Verifica se o nome de usuário já existe
            if User.objects.filter(username=username).exists():
                return Response({"error": "Este nome de usuário já existe."}, status=status.HTTP_400_BAD_REQUEST)

            # Cria o usuário
            user = User.objects.create_user(username=username, email=email, password=password)
            user.save()

            return Response({"message": "Usuário criado com sucesso!"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Customização da view de obtenção de token JWT
class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if 'access' in response.data:
            user = authenticate(request, username=request.data['username'], password=request.data['password'])
            if user:
                response.data['user'] = {
                    'username': user.username,
                    'email': user.email
                }
        return response

@api_view(['POST'])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({"error": "Por favor, forneça o email e a senha."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = get_user_model().objects.get(email=email)
        user = authenticate(request, username=user.username, password=password)
    except get_user_model().DoesNotExist:
        user = None

    if user is not None:
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        return Response({
            'refresh': str(refresh),
            'access': str(access_token),
            'user': {
                'username': user.username,
                'email': user.email,
                'name': user.get_full_name(),
                'is_superuser': user.is_superuser  # Inclui o status de superusuário
            }
        }, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Credenciais inválidas."}, status=status.HTTP_401_UNAUTHORIZED)

# Perfil do Usuário
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)

    def patch(self, request):
        user = request.user
        address_data = request.data.get("address")

        if address_data:
            address, created = Address.objects.get_or_create(user=user, is_default=True)
            serializer = AddressSerializer(address, data=address_data, partial=True)

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response({"error": "Endereço não fornecido"}, status=status.HTTP_400_BAD_REQUEST)

# Atualização de Avatar
class UpdateAvatarView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AvatarSerializer(data=request.data, instance=request.user, partial=True)
        if serializer.is_valid():
            serializer.save()
            avatar_url = request.user.avatar.url if request.user.avatar else None
            return Response({
                "message": "Avatar atualizado com sucesso!",
                "avatar_url": avatar_url
            }, status=status.HTTP_200_OK)
        return Response({"message": "Erro ao atualizar o avatar", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        avatar_url = request.user.avatar.url if request.user.avatar else None
        return Response({"avatar_url": avatar_url}, status=status.HTTP_200_OK)

# Endereços do Usuário
class AddressView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AddressSerializer

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        if serializer.validated_data.get("is_default", False):
            Address.objects.filter(user=self.request.user, is_default=True).update(is_default=False)
        
        serializer.save(user=self.request.user)

class AddressDetailView(APIView):
    permission_classes = [IsAuthenticated]  # Apenas usuários autenticados podem excluir um endereço

    def get_object(self, id):
        try:
            return Address.objects.get(id=id, user=self.request.user)  # Garante que o endereço pertence ao usuário autenticado
        except Address.DoesNotExist:
            return None

    def delete(self, request, id):
        address = self.get_object(id)
        if address is None:
            return Response({"error": "Endereço não encontrado ou não pertence ao usuário"}, status=status.HTTP_404_NOT_FOUND)
        
        address.delete()  # Deleta o endereço
        return Response({"message": "Endereço excluído com sucesso."}, status=status.HTTP_204_NO_CONTENT)
    
class AddProductView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Adiciona um novo produto ao sistema. O usuário autenticado será atribuído automaticamente como o proprietário.
        """
        # Passa o contexto de request para o serializador
        serializer = ProductSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            # Salva o produto e o associa ao usuário autenticado
            product = serializer.save()
            return Response({
                "message": "Produto adicionado com sucesso!",
                "product": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProductListCreateView(APIView):
    def get(self, request):
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)