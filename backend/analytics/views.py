from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from .models import DailyStats, GameSession
from games.models import Game

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    
    # Get games owned by user
    user_games = Game.objects.filter(creator=user)
    
    # Aggregate stats for the last 7 days
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=6)
    
    stats = DailyStats.objects.filter(game__in=user_games, date__range=[start_date, end_date])
    
    # Format data for Recharts
    chart_data = []
    for i in range(7):
        current_date = start_date + timedelta(days=i)
        day_stats = stats.filter(date=current_date).aggregate(
            total_plays=Sum('plays'),
            total_revenue=Sum('revenue')
        )
        chart_data.append({
            'name': current_date.strftime('%a'),
            'plays': day_stats['total_plays'] or 0,
            'revenue': day_stats['total_revenue'] or 0
        })
        
    total_plays = sum(d['plays'] for d in chart_data)
    total_revenue = sum(d['revenue'] for d in chart_data)
    active_players = GameSession.objects.filter(game__in=user_games, timestamp__gte=timezone.now() - timedelta(days=7)).values('user').distinct().count()

    return Response({
        'chart_data': chart_data,
        'metrics': {
            'total_plays': total_plays,
            'total_revenue': total_revenue,
            'active_players': active_players,
        }
    })
