from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from .models import Game, GameCategory, GameTag, GameAsset, GameLike, GameFavorite, GameVersion
from .serializers import (
    GameSerializer, GameCategorySerializer, GameTagSerializer, GameAssetSerializer
)

class IsCreatorOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.creator == request.user

class GameCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GameCategory.objects.all()
    serializer_class = GameCategorySerializer
    permission_classes = [permissions.AllowAny]

class GameTagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GameTag.objects.all()
    serializer_class = GameTagSerializer
    permission_classes = [permissions.AllowAny]

class GameViewSet(viewsets.ModelViewSet):
    queryset = Game.objects.filter(visibility='public', published=True)
    serializer_class = GameSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsCreatorOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'tags']
    search_fields = ['title', 'description', 'creator__username']
    ordering_fields = ['created_at', 'play_count', 'like_count']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            from django.db.models import Q
            return Game.objects.filter(Q(visibility='public', published=True) | Q(creator=user))
        return self.queryset

    def perform_create(self, serializer):
        import uuid
        from django.utils.text import slugify
        title = serializer.validated_data.get('title', 'Untitled Game')
        slug = serializer.validated_data.get('slug')
        if not slug:
            slug = slugify(title) + '-' + str(uuid.uuid4())[:8]
            serializer.save(creator=self.request.user, slug=slug)
        else:
            serializer.save(creator=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        game = self.get_object()
        like, created = GameLike.objects.get_or_create(game=game, user=request.user)
        if not created:
            like.delete()
            game.like_count -= 1
            game.save()
            return Response({'status': 'unliked'})
        game.like_count += 1
        game.save()
        return Response({'status': 'liked'})

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_games(self, request):
        games = Game.objects.filter(creator=request.user).order_by('-created_at')
        page = self.paginate_queryset(games)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(games, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def favorites(self, request):
        games = Game.objects.filter(likes__user=request.user).order_by('-created_at')
        page = self.paginate_queryset(games)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(games, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get', 'post'], permission_classes=[permissions.IsAuthenticatedOrReadOnly])
    def ratings(self, request, pk=None):
        game = self.get_object()
        
        if request.method == 'GET':
            from .models import GameRating
            from .serializers import GameRatingSerializer
            ratings = GameRating.objects.filter(game=game).order_by('-created_at')
            page = self.paginate_queryset(ratings)
            if page is not None:
                serializer = GameRatingSerializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = GameRatingSerializer(ratings, many=True)
            return Response(serializer.data)
            
        elif request.method == 'POST':
            from .models import GameRating
            from .serializers import GameRatingSerializer
            
            rating_val = request.data.get('rating')
            review_text = request.data.get('review_text', '')
            
            if not rating_val or not str(rating_val).isdigit() or not (1 <= int(rating_val) <= 5):
                return Response({'error': 'Rating must be an integer between 1 and 5'}, status=status.HTTP_400_BAD_REQUEST)
                
            rating_obj, created = GameRating.objects.update_or_create(
                game=game,
                user=request.user,
                defaults={'rating': int(rating_val), 'review_text': review_text}
            )
            
            serializer = GameRatingSerializer(rating_obj)
            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticatedOrReadOnly])
    def studio(self, request, pk=None):
        game = self.get_object()
        latest_version = game.versions.order_by('-created_at').first()
        game_data = latest_version.game_data if latest_version else []
        return Response({'game_id': game.id, 'game_data': game_data})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsCreatorOrReadOnly])
    def save_version(self, request, pk=None):
        game = self.get_object()
        game_data = request.data.get('game_data', [])
        
        # Check if there's an unpublished version we can just update
        latest_version = game.versions.order_by('-created_at').first()
        if latest_version and not latest_version.is_published:
            latest_version.game_data = game_data
            latest_version.save()
        else:
            version_number = '1.0'
            if latest_version:
                version_number = str(float(latest_version.version_number) + 0.1)
            
            GameVersion.objects.create(
                game=game,
                version_number=version_number,
                game_data=game_data,
                is_published=False
            )
            
        return Response({'status': 'success', 'message': 'Game saved successfully.'})
