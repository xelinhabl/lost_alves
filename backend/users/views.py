from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from rest_framework.exceptions import ValidationError
from django.contrib.auth import authenticate
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view
from django.contrib.auth import get_user_model


# Register view para criação de usuário
class RegisterUserView(APIView):
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        
        # Validações de campos obrigatórios
        if not username or not email or not password:
            raise ValidationError("Todos os campos são obrigatórios.")
        
        # Verifica se o nome de usuário já existe
        if User.objects.filter(username=username).exists():
            raise ValidationError("Este nome de usuário já existe.")
        
        # Cria o usuário
        user = User.objects.create_user(username=username, email=email, password=password)
        user.save()
        
        return Response({"message": "Usuário criado com sucesso!"}, status=status.HTTP_201_CREATED)

# Customização da view de obtenção de token JWT
class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]  # Permite acesso público para login

    # Aqui você pode adicionar campos personalizados ou modificar a resposta
    def post(self, request, *args, **kwargs):
        # Chama o método original para obter os tokens
        response = super().post(request, *args, **kwargs)

        # Você pode adicionar mais dados à resposta, se necessário
        # Exemplo: Adicionar o nome de usuário
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

    # Buscar o usuário pelo email e autenticar com a senha
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
                'email': user.email
            }
        }, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Credenciais inválidas."}, status=status.HTTP_401_UNAUTHORIZED)