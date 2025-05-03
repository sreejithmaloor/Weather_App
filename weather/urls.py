from django.urls import path
from . import views

urlpatterns = [
    path('', views.weather_view, name='weather_view'),
    path('api/get-weather/', views.get_weather_data, name='get_weather_data'),
]