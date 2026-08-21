from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(max_length=500, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    boink_coins = models.IntegerField(default=100) # Starting bonus
    experience_points = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    followers = models.ManyToManyField('self', symmetrical=False, related_name='following', blank=True)
    
    # Settings toggles
    is_public = models.BooleanField(default=True)
    theme_preference = models.CharField(max_length=20, default='system')
    notify_game_reviews = models.BooleanField(default=True)
    notify_new_followers = models.BooleanField(default=True)
    notify_direct_messages = models.BooleanField(default=True)
    notify_platform_updates = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.username

class Transaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    amount = models.IntegerField()
    transaction_type = models.CharField(max_length=50) # e.g. 'purchase', 'reward'
    description = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.amount} - {self.transaction_type}"

class CoinPackage(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=255)
    coin_amount = models.IntegerField()
    price_usd = models.DecimalField(max_digits=6, decimal_places=2)
    stripe_price_id = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.name} - {self.coin_amount} Coins for ${self.price_usd}"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
