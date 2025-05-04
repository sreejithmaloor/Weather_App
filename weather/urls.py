from django.urls import path  
from .views import weather_view, get_weather_data, clear_searches

urlpatterns = [
    path('', weather_view, name='weather_view'),
    path('api/get-weather/', get_weather_data, name='get_weather_data'),
    path('clear/', clear_searches, name='clear_searches'),
]
