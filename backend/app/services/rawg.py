import httpx

RAWG_API_KEY = "10b004b6735d4650bf81e63c92383986"

async def search_rawg_games(game_name: str) -> list:
    url = "https://api.rawg.io/api/games"
    params = {
        "key": RAWG_API_KEY,
        "search": game_name,
        "page_size": 5
    }
    
    results = []
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                items = data.get("results", [])
                for item in items:
                    appid = item.get("id")
                    name = item.get("name")
                    cover_url = item.get("background_image")
                    
                    # Fallback to placeholder if RAWG doesn't have an image
                    if not cover_url:
                        cover_url = f"https://via.placeholder.com/600x900/1a1a2e/00d2ff?text={name.replace(' ', '+')}"

                    results.append({
                        "appid": appid,
                        "name": name,
                        "playtime_forever": 0,
                        "cover_url": cover_url
                    })
        except Exception as e:
            print(f"RAWG API search error: {e}")
            
    return results
