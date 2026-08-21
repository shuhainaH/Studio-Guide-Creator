from django.urls import path
from .views import generate_game_objects

urlpatterns = [
    path('generate/', generate_game_objects, name='generate_game_objects'),
]
