import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from users.models import UserProfile
from games.models import Game

def seed_data():
    print("Seeding database...")
    
    # Create some users
    users_data = [
        ("boink_creator", "password123", "boink_creator@example.com"),
        ("gamer_girl", "password123", "gamer_girl@example.com"),
        ("pro_builder", "password123", "builder@example.com"),
    ]
    
    created_users = []
    for username, password, email in users_data:
        if not User.objects.filter(username=username).exists():
            user = User.objects.create_user(username=username, email=email, password=password)
            profile, _ = UserProfile.objects.get_or_create(user=user)
            profile.boink_coins = 1000
            profile.level = 5
            profile.save()
            created_users.append(user)
            print(f"Created user: {username}")
        else:
            created_users.append(User.objects.get(username=username))

    # Create some games
    if len(created_users) > 0:
        creator = created_users[0]
        games_data = [
            ("Super Jump Adventure", "A fun platformer where you jump over obstacles.", '{"type": "platformer"}'),
            ("Maze Runner", "Can you escape the labyrinth?", '{"type": "maze"}'),
            ("Boink Battle", "A multiplayer battle arena.", '{"type": "arena"}'),
        ]
        
        for i, (title, desc, config) in enumerate(games_data):
            if not Game.objects.filter(title=title).exists():
                from django.utils.text import slugify
                game = Game.objects.create(
                    creator=creator,
                    title=title,
                    slug=slugify(title) + f"-{i}",
                    description=desc,
                    published=True
                )
                from games.models import GameVersion
                GameVersion.objects.create(
                    game=game,
                    version_number="1.0",
                    game_data=config,
                    is_published=True
                )
                print(f"Created game: {title}")

    print("Seeding complete!")

if __name__ == '__main__':
    seed_data()
