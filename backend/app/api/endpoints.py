from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.services.rawg import search_rawg_games
from app.services.ai import suggest_games
import asyncio
import jwt
import bcrypt
from app.db import get_db

router = APIRouter()
SECRET_KEY = "super_secret_playpace_key"
ALGORITHM = "HS256"

# --- AUTH ---
class AuthRequest(BaseModel):
    username: str
    password: str

def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return int(payload["sub"]) # returns user_id
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/auth/register")
def register(req: AuthRequest):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT id FROM users WHERE username = ?", (req.username,))
    if c.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Username already exists")
    
    hashed = bcrypt.hashpw(req.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    c.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)", (req.username, hashed))
    conn.commit()
    user_id = c.lastrowid
    conn.close()
    
    token = jwt.encode({"sub": str(user_id)}, SECRET_KEY, algorithm=ALGORITHM)
    return {"token": token}

@router.post("/auth/login")
def login(req: AuthRequest):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT id, password_hash FROM users WHERE username = ?", (req.username,))
    user = c.fetchone()
    conn.close()
    
    if not user or not bcrypt.checkpw(req.password.encode('utf-8'), user["password_hash"].encode('utf-8')):
        raise HTTPException(status_code=400, detail="Invalid credentials")
        
    token = jwt.encode({"sub": str(user["id"])}, SECRET_KEY, algorithm=ALGORITHM)
    return {"token": token}

# --- SYNC ---
class SyncRequest(BaseModel):
    games: List[Dict[str, Any]]
    budget: Dict[str, Any]

@router.get("/user/sync")
def get_user_data(user_id: int = Depends(get_current_user)):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT budget_type, budget_hours FROM users WHERE id = ?", (user_id,))
    user = c.fetchone()
    
    c.execute("SELECT appid, name, cover_url, hltb_main_story FROM user_games WHERE user_id = ?", (user_id,))
    rows = c.fetchall()
    conn.close()
    
    games = []
    for r in rows:
        games.append({
            "appid": r["appid"],
            "name": r["name"],
            "cover_url": r["cover_url"],
            "hltb": {"main_story": r["hltb_main_story"], "main_extra": r["hltb_main_story"], "completionist": r["hltb_main_story"]}
        })
        
    return {
        "budget": {"type": user["budget_type"], "hours": user["budget_hours"]},
        "games": games
    }

@router.post("/user/sync")
def sync_user_data(req: SyncRequest, user_id: int = Depends(get_current_user)):
    conn = get_db()
    c = conn.cursor()
    
    # Update budget
    c.execute("UPDATE users SET budget_type = ?, budget_hours = ? WHERE id = ?", 
              (req.budget.get("type", "day"), req.budget.get("hours", 2), user_id))
              
    # Replace games
    c.execute("DELETE FROM user_games WHERE user_id = ?", (user_id,))
    for g in req.games:
        hltb = g.get("hltb", {}).get("main_story", 15)
        c.execute("INSERT INTO user_games (user_id, appid, name, cover_url, hltb_main_story) VALUES (?, ?, ?, ?, ?)",
                  (user_id, g["appid"], g["name"], g["cover_url"], hltb))
                  
    conn.commit()
    conn.close()
    return {"success": True}

# --- EXISTING ENDPOINTS ---

@router.get("/game/autocomplete")
async def autocomplete_game(q: str):
    games = await search_rawg_games(q)
    return {"results": games}

class GameAddRequest(BaseModel):
    appid: int
    name: str
    cover_url: str

@router.post("/game/add")
async def add_game(request: GameAddRequest):
    game_info = {
        "appid": request.appid,
        "name": request.name,
        "playtime_forever": 0,
        "cover_url": request.cover_url,
        "hltb": {"main_story": 15, "main_extra": 20, "completionist": 30}
    }
    return {"game": game_info}

class MoodRequest(BaseModel):
    moods: List[str]
    exclude: List[str] = []

@router.post("/ai/suggest")
async def ai_suggest(request: MoodRequest):
    suggested_games = await suggest_games(request.moods, request.exclude)
    
    async def process_game(ai_game):
        title = ai_game if isinstance(ai_game, str) else ai_game.get("name")
        rawg_results = await search_rawg_games(title)
        if rawg_results:
            game_info = rawg_results[0]
            if isinstance(ai_game, dict) and "main_story" in ai_game:
                est = ai_game["main_story"]
                game_info["hltb"] = {"main_story": est, "main_extra": est * 1.5, "completionist": est * 2}
            else:
                game_info["hltb"] = {"main_story": 15, "main_extra": 20, "completionist": 30}
            return game_info
        return None

    tasks = [process_game(game) for game in suggested_games]
    results = await asyncio.gather(*tasks)
    
    enriched_games = [g for g in results if g is not None]
            
    return {"games": enriched_games}
