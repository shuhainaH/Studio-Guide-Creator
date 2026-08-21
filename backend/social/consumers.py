import json
from channels.generic.websocket import AsyncWebsocketConsumer

class SocialConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.group_name = f'social_{self.user_id}'

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def social_event(self, event):
        # Broadcast the event directly to the connected client
        await self.send(text_data=json.dumps({
            'action': event['action'],
            'payload': event.get('payload', {})
        }))
