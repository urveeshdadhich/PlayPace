import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'playpace.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            budget_type TEXT DEFAULT 'day',
            budget_hours INTEGER DEFAULT 2
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS user_games (
            user_id INTEGER,
            appid INTEGER,
            name TEXT,
            cover_url TEXT,
            hltb_main_story INTEGER,
            PRIMARY KEY (user_id, appid),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    conn.commit()
    conn.close()

init_db()
