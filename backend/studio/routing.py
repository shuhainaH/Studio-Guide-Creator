from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/studio/(?P<game_id>\w+)/$', consumers.StudioConsumer.as_asgi()),
]
