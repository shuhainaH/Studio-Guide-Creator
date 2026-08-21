from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/social/(?P<user_id>\w+)/$', consumers.SocialConsumer.as_asgi()),
]
