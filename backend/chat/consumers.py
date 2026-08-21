import json
import os
from channels.generic.websocket import AsyncWebsocketConsumer

# Attempt to import openai for moderation
try:
    from openai import AsyncOpenAI
    api_key = os.environ.get("OPENAI_API_KEY")
    if api_key:
        client = AsyncOpenAI(api_key=api_key)
    else:
        client = None
except ImportError:
    client = None

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

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
        text_data_json = json.loads(text_data)
        raw_message = text_data_json['message']
        username = text_data_json.get('username', 'Anonymous')

        # AI Moderation
        is_safe = True
        if client and os.environ.get("OPENAI_API_KEY"):
            try:
                response = await client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "You are a strict chat moderator for a children's game. Respond with only 'SAFE' or 'VIOLATION' to evaluate the following message."},
                        {"role": "user", "content": raw_message}
                    ],
                    max_tokens=10,
                    temperature=0
                )
                result = response.choices[0].message.content.strip()
                if result == "VIOLATION":
                    is_safe = False
            except Exception as e:
                # If OpenAI fails, fallback to allowing it or dropping it. We'll allow it for now.
                print("OpenAI moderation failed:", e)
        else:
            # Fallback hardcoded filter if no API key
            bad_words = ['hate', 'spam', 'badword']
            for word in bad_words:
                if word in raw_message.lower():
                    is_safe = False

        if not is_safe:
            # Send warning only to the sender
            await self.send(text_data=json.dumps({
                'message': 'Your message was flagged by our AI moderator and has been blocked.',
                'username': 'SYSTEM',
                'system': True
            }))
            return

        # Send safe message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': raw_message,
                'username': username
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'username': event.get('username', 'Anonymous')
        }))
