from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GameViewSet, GameCategoryViewSet, GameTagViewSet

router = DefaultRouter()
router.register(r'games', GameViewSet, basename='game')
router.register(r'categories', GameCategoryViewSet, basename='category')
router.register(r'tags', GameTagViewSet, basename='tag')

urlpatterns = [
    path('', include(router.urls)),
]
