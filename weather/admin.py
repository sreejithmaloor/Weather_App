from django.contrib import admin
from .models import WeatherSearch

@admin.register(WeatherSearch)
class WeatherSearchAdmin(admin.ModelAdmin):
    list_display = ('city', 'country', 'temperature', 'condition', 'search_date', 'user_ip')
    list_filter = ('condition', 'country')
    search_fields = ('city', 'country')
    date_hierarchy = 'search_date'