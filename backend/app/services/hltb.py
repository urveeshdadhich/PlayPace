from howlongtobeatpy import HowLongToBeat
import asyncio

async def fetch_hltb_data(game_name: str):
    loop = asyncio.get_event_loop()
    try:
        results = await loop.run_in_executor(None, HowLongToBeat().search, game_name)
        if results:
            # Take the best match
            best = max(results, key=lambda element: element.similarity)
            return {
                "main_story": best.main_story,
                "main_extra": best.main_extra,
                "completionist": best.completionist
            }
    except Exception as e:
        print(f"Error fetching HLTB for {game_name}: {e}")
    return {"main_story": 0, "main_extra": 0, "completionist": 0}

async def get_game_lengths(games: list) -> list:
    processed_games = []
    tasks = []
    
    # Cap to top 20 to avoid rate limiting
    target_games = games[:20]
    
    for game in target_games:
        tasks.append(fetch_hltb_data(game["name"]))
        
    hltb_results = await asyncio.gather(*tasks)
    
    for game, lengths in zip(target_games, hltb_results):
        game.update({"hltb": lengths})
        processed_games.append(game)
        
    return processed_games
