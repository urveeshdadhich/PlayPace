import google.generativeai as genai
from app.core.config import GEMINI_API_KEY
import json

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

async def suggest_games(moods: list, exclude: list = None) -> list:
    if exclude is None:
        exclude = []
    
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        # Mock suggestions
        if "adrenaline" in moods:
            return [{"name": "DOOM Eternal", "main_story": 14}, {"name": "Ghostrunner", "main_story": 7}, {"name": "Hotline Miami", "main_story": 5}]
        elif "cozy" in moods:
            return [{"name": "Stardew Valley", "main_story": 52}, {"name": "Animal Crossing", "main_story": 60}, {"name": "Slime Rancher", "main_story": 14}]
        else:
            return [{"name": "Hades", "main_story": 22}, {"name": "Cyberpunk 2077", "main_story": 25}, {"name": "Celeste", "main_story": 8}]

    model = genai.GenerativeModel('gemini-2.5-flash')
    
    exclude_text = f"DO NOT suggest any of these games: {', '.join(exclude)}." if exclude else ""
    
    prompt = f"""
    Suggest 10 popular video games that perfectly match these moods: {', '.join(moods)}.
    {exclude_text}
    Return ONLY a JSON array of objects, where each object has "name" (string) and "main_story" (number, estimated hours to beat the main story).
    Example: [{{"name": "Game 1", "main_story": 15}}, {{"name": "Game 2", "main_story": 40}}]
    """
    
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:-3].strip()
        elif text.startswith("```"):
            text = text[3:-3].strip()
            
        games_data = json.loads(text)
        return games_data[:10]
    except Exception as e:
        print(f"AI Suggestion Error: {e}")
        import random
        # Dynamic fallback for when Google's API hits the free-tier rate limit
        fallbacks = {
            "adrenaline": [
                {"name": "DOOM Eternal", "main_story": 14}, {"name": "Ghostrunner", "main_story": 7}, 
                {"name": "Hotline Miami", "main_story": 5}, {"name": "ULTRAKILL", "main_story": 10},
                {"name": "Sekiro: Shadows Die Twice", "main_story": 29}, {"name": "Furi", "main_story": 5},
                {"name": "Risk of Rain 2", "main_story": 15}, {"name": "Metal Gear Rising", "main_story": 7},
                {"name": "Returnal", "main_story": 20}, {"name": "Sifu", "main_story": 10}
            ],
            "cozy": [
                {"name": "Stardew Valley", "main_story": 52}, {"name": "Animal Crossing", "main_story": 60}, 
                {"name": "Slime Rancher", "main_story": 14}, {"name": "Unpacking", "main_story": 3},
                {"name": "A Short Hike", "main_story": 1}, {"name": "Spiritfarer", "main_story": 25},
                {"name": "Dave the Diver", "main_story": 23}, {"name": "Ooblets", "main_story": 18},
                {"name": "Cozy Grove", "main_story": 40}, {"name": "Dorfromantik", "main_story": 5}
            ],
            "mind-bending": [
                {"name": "Portal 2", "main_story": 8}, {"name": "The Witness", "main_story": 17}, 
                {"name": "Superliminal", "main_story": 3}, {"name": "The Talos Principle", "main_story": 15},
                {"name": "Antichamber", "main_story": 6}, {"name": "Braid", "main_story": 5},
                {"name": "Outer Wilds", "main_story": 16}, {"name": "Baba Is You", "main_story": 20},
                {"name": "Inscryption", "main_story": 12}, {"name": "Manifold Garden", "main_story": 6}
            ],
            "atmospheric": [
                {"name": "Hollow Knight", "main_story": 27}, {"name": "Subnautica", "main_story": 29}, 
                {"name": "Journey", "main_story": 2}, {"name": "SOMA", "main_story": 9}, 
                {"name": "Firewatch", "main_story": 4}, {"name": "Inside", "main_story": 3},
                {"name": "Ori and the Blind Forest", "main_story": 8}, {"name": "Gris", "main_story": 4},
                {"name": "Abzu", "main_story": 2}, {"name": "Limbo", "main_story": 3}
            ]
        }
        
        all_options = []
        for mood in moods:
            if mood in fallbacks:
                all_options.extend(fallbacks[mood])
                
        if not all_options:
            all_options = fallbacks["adrenaline"] + fallbacks["cozy"] + fallbacks["mind-bending"] + fallbacks["atmospheric"]
            
        # Filter out excluded games
        available = [g for g in all_options if g["name"] not in exclude]
        
        # If we ran out of unique games in the fallback, just return whatever we have
        if not available:
            return all_options[:3]
            
        random.shuffle(available)
        return available[:6]
