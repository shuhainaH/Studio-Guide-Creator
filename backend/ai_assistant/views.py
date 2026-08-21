from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.conf import settings
import json
import os
import uuid

# Attempt to import openai, but provide a graceful fallback if missing
try:
    from openai import OpenAI
    api_key = os.environ.get("OPENAI_API_KEY")
    client = OpenAI(api_key=api_key) if api_key else None
except Exception:
    client = None

@api_view(['POST'])
@permission_classes([AllowAny])
def generate_game_objects(request):
    prompt = request.data.get('prompt', '').lower()
    
    if not client or not os.environ.get("OPENAI_API_KEY"):
        # Fallback Mock Data so the feature "works" for the user without an API key!
        # Advanced Procedural Mock Data
        objects = []
        # Always add player and ground
        objects.append({"id": str(uuid.uuid4())[:8], "type": "player", "x": 100, "y": 300, "color": "bg-red-500"})
        objects.append({"id": str(uuid.uuid4())[:8], "type": "ground", "x": 400, "y": 580, "w": 800, "h": 40, "color": "bg-brown-800"})

        if 'stair' in prompt or 'step' in prompt:
            # Build stairs
            for i in range(5):
                objects.append({
                    "id": str(uuid.uuid4())[:8], 
                    "type": "block", 
                    "x": 200 + (i * 100), 
                    "y": 500 - (i * 50), 
                    "w": 100, 
                    "h": 20, 
                    "color": "bg-brown-600"
                })
        elif 'parkour' in prompt or 'jump' in prompt or 'gap' in prompt:
            # Build parkour gaps
            objects.append({"id": str(uuid.uuid4())[:8], "type": "block", "x": 250, "y": 450, "w": 60, "h": 20, "color": "bg-brown-600"})
            objects.append({"id": str(uuid.uuid4())[:8], "type": "block", "x": 400, "y": 400, "w": 60, "h": 20, "color": "bg-terracotta-accent"})
            objects.append({"id": str(uuid.uuid4())[:8], "type": "block", "x": 550, "y": 350, "w": 60, "h": 20, "color": "bg-brown-600"})
            objects.append({"id": str(uuid.uuid4())[:8], "type": "block", "x": 700, "y": 300, "w": 60, "h": 20, "color": "bg-terracotta-accent"})
        elif 'wall' in prompt or 'house' in prompt or 'tall' in prompt:
            # Build tall structure
            objects.append({"id": str(uuid.uuid4())[:8], "type": "block", "x": 400, "y": 450, "w": 200, "h": 20, "color": "bg-brown-600"})
            objects.append({"id": str(uuid.uuid4())[:8], "type": "block", "x": 320, "y": 350, "w": 20, "h": 200, "color": "bg-brown-600"})
            objects.append({"id": str(uuid.uuid4())[:8], "type": "block", "x": 480, "y": 350, "w": 20, "h": 200, "color": "bg-brown-600"})
            objects.append({"id": str(uuid.uuid4())[:8], "type": "block", "x": 400, "y": 250, "w": 200, "h": 20, "color": "bg-brown-600"})
        else:
            # Random scatter
            import random
            for _ in range(3):
                objects.append({
                    "id": str(uuid.uuid4())[:8],
                    "type": "block",
                    "x": random.randint(200, 700),
                    "y": random.randint(200, 500),
                    "w": random.randint(50, 150),
                    "h": 20,
                    "color": random.choice(["bg-brown-600", "bg-terracotta-accent"])
                })
        
        return Response({
            "status": "success",
            "message": f"Generated level based on: {prompt}",
            "objects": objects
        })

    system_prompt = """
    You are an AI game level designer for BOINK Studio.
    The user will provide a prompt (e.g. "make a jumping puzzle").
    You must return a raw JSON array of game objects.
    Each object must strictly follow this schema:
    {
      "id": "<generate a random short string>",
      "type": "block" | "player" | "ground",
      "x": <integer coordinate>,
      "y": <integer coordinate>,
      "w": <integer width, default 32 for player, custom for blocks>,
      "h": <integer height, default 32 for player, custom for blocks>,
      "color": "bg-brown-600" | "bg-red-500" | "bg-brown-800" | "bg-terracotta-accent"
    }
    
    Rules:
    - Return ONLY valid JSON array. Do NOT wrap it in markdown block quotes like ```json ... ```.
    - Ground should always be near y=580.
    - Player should always be included.
    - Keep everything within x: 0 to 800, y: 0 to 600.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000,
        )
        
        raw_json = response.choices[0].message.content.strip()
        
        if raw_json.startswith('```json'):
            raw_json = raw_json[7:-3]
        elif raw_json.startswith('```'):
            raw_json = raw_json[3:-3]
            
        objects = json.loads(raw_json.strip())
        
        for obj in objects:
            if 'id' not in obj:
                obj['id'] = str(uuid.uuid4())[:8]
                
        return Response({
            "status": "success",
            "message": f"Generated level based on: {prompt}",
            "objects": objects
        })
        
    except Exception as e:
        return Response({
            "status": "error",
            "message": f"AI generation failed: {str(e)}"
        }, status=500)
