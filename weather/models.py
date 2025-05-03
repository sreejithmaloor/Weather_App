# weather/models.py
from django.db import models
from django.utils import timezone

class WeatherSearch(models.Model):
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100, blank=True)
    temperature = models.FloatField(null=True, blank=True)
    condition = models.CharField(max_length=100, blank=True)
    search_date = models.DateTimeField(default=timezone.now)
    user_ip = models.GenericIPAddressField(null=True, blank=True)

    def __str__(self):
        return f"{self.city} - {self.search_date.strftime('%Y-%m-%d %H:%M')}"

    class Meta:
        ordering = ['-search_date']
        verbose_name_plural = 'Weather Searches'