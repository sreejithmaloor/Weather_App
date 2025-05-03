from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from .models import WeatherSearch
import requests
import json
from django.conf import settings

def weather_view(request):
    # Get last 5 searches from database
    recent_searches = WeatherSearch.objects.all().order_by('-search_date')[:5]
    return render(request, 'weather/weather_list.html', {'recent_searches': recent_searches})

@csrf_exempt
def get_weather_data(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            city = data.get('city')
            
            if not city:
                return JsonResponse({'error': 'City name is required'}, status=400)
            
            # Call OpenWeather API
            api_key = settings.OPENWEATHER_API_KEY
            url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"
            response = requests.get(url)
            
            if response.status_code != 200:
                return JsonResponse({'error': 'City not found'}, status=404)
                
            weather_data = response.json()
            
            # Save search to database
            WeatherSearch.objects.create(
                city=weather_data['name'],
                country=weather_data['sys']['country'],
                temperature=weather_data['main']['temp'],
                condition=weather_data['weather'][0]['main'],
                user_ip=get_client_ip(request)
            )
            
            return JsonResponse({
                'city': weather_data['name'],
                'country': weather_data['sys']['country'],
                'temp': weather_data['main']['temp'],
                'feels_like': weather_data['main']['feels_like'],
                'condition': weather_data['weather'][0]['description'],
                'humidity': weather_data['main']['humidity'],
                'wind_speed': weather_data['wind']['speed'],
                'icon': weather_data['weather'][0]['icon']
            })
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Invalid request method'}, status=405)

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip