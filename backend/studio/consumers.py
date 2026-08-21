import json
from channels.generic.websocket import AsyncWebsocketConsumer

class StudioConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.room_group_name = f'studio_{self.game_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        
        # Broadcast the object state change to everyone else in the room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'studio_message',
                'action': data.get('action'),
                'sender_id': self.channel_name,
                'payload': data.get('payload')
            }
        )

    async def studio_message(self, event):
        # Prevent echoing back to the sender
        if event['sender_id'] != self.channel_name:
            await self.send(text_data=json.dumps({
                'action': event['action'],
                'payload': event['payload']
            }))
