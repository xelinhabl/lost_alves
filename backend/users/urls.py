from django.urls import path
from .views import RegisterUserView, CustomTokenObtainPairView, login_view, ProfileView

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('login/', login_view, name='login'),  # Rota personalizada para login
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),  # Rota de obtenção do token JWT
    path('profile/', ProfileView.as_view(), name='user-profile'),
]
