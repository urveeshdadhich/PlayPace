import httpx

async def search_steam_games(game_name: str) -> list:
    url = "https://store.steampowered.com/api/storesearch/"
    params = {
        "term": game_name,
        "l": "english",
        "cc": "US"
    }
    
    results = []
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                items = data.get("items", [])
                for item in items[:5]:  # Top 5 results
                    appid = item.get("id")
                    name = item.get("name")
                    results.append({
                        "appid": appid,
                        "name": name,
                        "playtime_forever": 0,
                        "cover_url": f"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/{appid}/library_600x900.jpg"
                    })
        except Exception as e:
            print(f"Steam API search error: {e}")
            
    return results
            

