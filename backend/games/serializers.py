from rest_framework import serializers
from .models import Game, GameCategory, GameTag, GameAsset, GameVersion, GamePlay, GameLike, GameFavorite, GameRating

class GameCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = GameCategory
        fields = '__all__'

class GameTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameTag
        fields = '__all__'

class GameAssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameAsset
        fields = '__all__'
        read_only_fields = ['created_at']

class GameSerializer(serializers.ModelSerializer):
    creator_username = serializers.ReadOnlyField(source='creator.username')
    category_name = serializers.ReadOnlyField(source='category.name')
    tags = GameTagSerializer(many=True, read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = [
            'id', 'title', 'slug', 'description', 'creator', 'creator_username',
            'category', 'category_name', 'thumbnail', 'tags', 'visibility',
            'published', 'play_count', 'like_count', 'created_at', 'updated_at',
            'is_liked', 'is_favorited', 'average_rating', 'total_reviews'
        ]
        read_only_fields = ['creator', 'slug', 'play_count', 'like_count', 'created_at', 'updated_at']

    def get_average_rating(self, obj):
        from django.db.models import Avg
        rating = obj.ratings.aggregate(Avg('rating'))['rating__avg']
        return round(rating, 1) if rating else 0.0

    def get_total_reviews(self, obj):
        return obj.ratings.count()

    def get_is_liked(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return GameLike.objects.filter(game=obj, user=user).exists()
        return False

    def get_is_favorited(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return GameFavorite.objects.filter(game=obj, user=user).exists()
        return False

class GameRatingSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = GameRating
        fields = ['id', 'username', 'avatar', 'rating', 'review_text', 'created_at']
        read_only_fields = ['id', 'username', 'avatar', 'created_at']

    def get_avatar(self, obj):
        if hasattr(obj.user, 'profile') and obj.user.profile.avatar:
            return obj.user.profile.avatar.url
        return None
