from django.urls import path
from .views import RegisterUserView, CustomTokenObtainPairView, ProfileView, UpdateAvatarView, AddressView, AddressDetailView, login_view, AddProductView, ProductListCreateView

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('login/', login_view, name='login'),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'), 
    path('profile/', ProfileView.as_view(), name='user-profile'),
    path('profile/avatar/', UpdateAvatarView.as_view(), name='update_avatar'),
    path('profile/addresses/', AddressView.as_view(), name='address-list-create'),  # Rota para listar/adicionar
    path('profile/addresses/<int:id>/', AddressDetailView.as_view(), name='address-detail'),  # Excluir endereço
    path('products/add/', AddProductView.as_view(), name='add-product'),
    path('products/', ProductListCreateView.as_view(), name='product-list-create'),

]
