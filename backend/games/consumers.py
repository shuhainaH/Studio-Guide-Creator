import json
from channels.generic.websocket import AsyncWebsocketConsumer

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.game_slug = self.scope['url_route']['kwargs']['slug']
        self.room_group_name = f'game_{self.game_slug}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()

        # Let others know a new player joined
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_message',
                'action': 'player_joined',
                'player_id': self.channel_name
            }
        )

    async def disconnect(self, close_code):
        # Let others know a player left
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_message',
                'action': 'player_left',
                'player_id': self.channel_name
            }
        )
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')

        if action == 'player_moved':
            # Send movement data to everyone EXCEPT the sender
            # In a basic setup, we broadcast to the group, and the client filters out its own ID,
            # or the server broadcasts to all.
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_message',
                    'action': 'player_moved',
                    'player_id': self.channel_name,
                    'x': data.get('x'),
                    'y': data.get('y')
                }
            )

    # Receive message from room group
    async def game_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event))
