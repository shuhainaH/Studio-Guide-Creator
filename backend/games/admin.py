from django.contrib import admin
from .models import Game, GameCategory, GameTag, GamePlay, GameAsset, GameVersion, GameLike, GameFavorite, GameRating

admin.site.register(Game)
admin.site.register(GameCategory)
admin.site.register(GameTag)
admin.site.register(GamePlay)
admin.site.register(GameAsset)
admin.site.register(GameVersion)
admin.site.register(GameLike)
admin.site.register(GameFavorite)
admin.site.register(GameRating)

