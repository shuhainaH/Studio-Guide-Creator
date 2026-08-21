from django.db import models
from django.contrib.auth.models import User

class GameCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

class GameTag(models.Model):
    name = models.CharField(max_length=50)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name

class Game(models.Model):
    VISIBILITY_CHOICES = [
        ('public', 'Public'),
        ('private', 'Private'),
        ('unlisted', 'Unlisted'),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='games')
    category = models.ForeignKey(GameCategory, on_delete=models.SET_NULL, null=True, related_name='games')
    thumbnail = models.ImageField(upload_to='thumbnails/', null=True, blank=True)
    tags = models.ManyToManyField(GameTag, blank=True)
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='private')
    published = models.BooleanField(default=False)
    
    # Analytics
    play_count = models.PositiveIntegerField(default=0)
    like_count = models.PositiveIntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class GameAsset(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='assets')
    name = models.CharField(max_length=100)
    file = models.FileField(upload_to='game_assets/')
    asset_type = models.CharField(max_length=50) # e.g., image, audio, script
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.game.title})"

class GameVersion(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='versions')
    version_number = models.CharField(max_length=20)
    game_data = models.JSONField(help_text="The JSON representation of the game's state/code")
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.game.title} - v{self.version_number}"

class GamePlay(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='plays')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    played_at = models.DateTimeField(auto_now_add=True)
    duration_seconds = models.PositiveIntegerField(default=0)

class GameLike(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('game', 'user')

class GameFavorite(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='favorites')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('game', 'user')

class GameRating(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='ratings')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    review_text = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('game', 'user')
