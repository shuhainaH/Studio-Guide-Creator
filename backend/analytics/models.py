from django.db import models
from django.conf import settings
from games.models import Game

class GameSession(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='sessions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    duration_seconds = models.PositiveIntegerField(default=0)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.game.title} Session at {self.timestamp}"

class DailyStats(models.Model):
    date = models.DateField(auto_now_add=True)
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='daily_stats', null=True, blank=True)
    plays = models.PositiveIntegerField(default=0)
    revenue = models.PositiveIntegerField(default=0)
    active_players = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('date', 'game')

    def __str__(self):
        game_title = self.game.title if self.game else "Global"
        return f"{game_title} Stats - {self.date}"
