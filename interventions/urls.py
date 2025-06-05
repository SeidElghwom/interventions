from django.urls import path
from .views import *

urlpatterns = [
    path('', index, name='index'),
    path('auth/', auth_view, name='auth'), 
    path('dashboard/', admin_dashboard, name='admin_dashboard'),
    path('home/', client_home, name='client_home'),
    path('user-info/', user_info, name='user_info'),
    path("auth/logout/", logout_view, name="logout"),
    path('interventions/', interventions_view, name='interventions'),
    path('interventions/<int:pk>/', interventions_view, name='intervention_detail'),
    path('intervenants/', intervenants_view, name='intervenants'),
    path('intervenants/<int:pk>/', intervenants_view, name='intervenant_detail'),
    path('clients/', clients_view, name='clients'),
    path('clients/<str:phonenumber>/', clients_view, name='client_detail'),
    path('stats/', stats_page, name='stats_page'),
    path('api/stats/', stats_view, name='stats_api'),   
    
]
