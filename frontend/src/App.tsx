import { useState, useEffect, useRef } from 'react';
import './App.css';
import { PacingController } from './components/PacingController';
import { MoodMatrix } from './components/MoodMatrix';
import { TimelineCanvas } from './components/TimelineCanvas';
import { LibraryCard } from './components/LibraryCard';
import { LibraryView } from './components/LibraryView';
import { AuthScreen } from './components/AuthScreen';
import type { Game, Budget } from './types';
import { autocompleteGames, addGame, suggestGamesWithAI, syncDataDown, syncDataUp } from './api';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('playpace_token'));
  const [isSyncing, setIsSyncing] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const [libraryGames, setLibraryGames] = useState<Game[]>([]);
  const [discoveryGames, setDiscoveryGames] = useState<Game[]>([]);
  const [budget, setBudget] = useState<Budget>({ type: 'day', hours: 2 });
  
  const [loading, setLoading] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceTimer = useRef<number | null>(null);

  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [aiHighlightedIndices, setAiHighlightedIndices] = useState<number[]>([]);

  // 'timeline': shows pacing for library
  // 'library': dedicated full-grid view of library
  // 'discovery': shows AI suggestions in timeline
  const [viewMode, setViewMode] = useState<'timeline' | 'library' | 'discovery'>('timeline');

  useEffect(() => {
    if (token) {
      localStorage.setItem('playpace_token', token);
      syncDataDown()
        .then(data => {
          if (data.games) setLibraryGames(data.games);
          if (data.budget) setBudget(data.budget);
          setInitialLoadDone(true);
        })
        .catch(err => {
          console.error('Failed to sync down', err);
          // If token is invalid, clear it
          if (err.message === 'Invalid token' || err.message === 'Token expired' || err.message === 'Unauthorized') {
            handleLogout();
          } else {
            setInitialLoadDone(true);
          }
        });
    } else {
      setInitialLoadDone(false);
    }
  }, [token]);

  // Sync up to server whenever libraryGames or budget changes, but only after initial load
  useEffect(() => {
    if (token && initialLoadDone) {
      setIsSyncing(true);
      const timer = setTimeout(() => {
        syncDataUp(libraryGames, budget)
          .catch(console.error)
          .finally(() => setIsSyncing(false));
      }, 1000); // debounce sync by 1s
      return () => clearTimeout(timer);
    }
  }, [libraryGames, budget, token, initialLoadDone]);

  const handleLogout = () => {
    localStorage.removeItem('playpace_token');
    setToken(null);
    setLibraryGames([]);
    setBudget({ type: 'day', hours: 2 });
    setInitialLoadDone(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    if (val.trim().length > 2) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = window.setTimeout(async () => {
        try {
          const results = await autocompleteGames(val);
          setSuggestions(results);
          setShowDropdown(true);
        } catch (err) {
          console.error(err);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  const handleSelectGame = async (game: any) => {
    setShowDropdown(false);
    setSearchQuery('');
    setSuggestions([]);
    setLoading(true);
    try {
      const added = await addGame(game.appid, game.name, game.cover_url);
      setLibraryGames(prev => {
         if(prev.find(g => g.appid === added.appid)) return prev;
         return [...prev, added];
      });
    } catch (err) {
      console.error(err);
      alert('Failed to add game');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveGame = (appid: number) => {
    setLibraryGames(prev => prev.filter(g => g.appid !== appid));
  };

  const handleAddToLibrary = (game: Game) => {
    setLibraryGames(prev => {
      if(prev.find(g => g.appid === game.appid)) return prev;
      return [...prev, game];
    });
  };

  const handleMoodToggle = async (mood: string) => {
    const newMoods = selectedMoods.includes(mood) ? [] : [mood];
    setSelectedMoods(newMoods);

    if (newMoods.length > 0) {
      setViewMode('discovery');
      setSuggesting(true);
      try {
        const result = await suggestGamesWithAI(newMoods);
        if (result.games) {
          setAiHighlightedIndices(Array.from({length: result.games.length}, (_, i) => i));
          setDiscoveryGames(result.games);
        }
      } catch (error) {
        console.error("AI Suggest failed", error);
      } finally {
        setSuggesting(false);
      }
    } else {
      setViewMode('timeline');
      setAiHighlightedIndices([]);
      setDiscoveryGames([]);
    }
  };

  const handleMoreResults = async () => {
    if (selectedMoods.length === 0) return;
    setSuggesting(true);
    const existingTitles = discoveryGames.map(g => g.name);
    try {
      const result = await suggestGamesWithAI(selectedMoods, existingTitles);
      if (result.games) {
        setAiHighlightedIndices(Array.from({length: result.games.length}, (_, i) => discoveryGames.length + i));
        setDiscoveryGames(prev => {
             const newGames = result.games.filter((g: any) => !prev.find((p: any) => p.appid === g.appid));
             return [...prev, ...newGames];
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSuggesting(false);
    }
  };

  if (!token) {
    return <AuthScreen onAuthSuccess={setToken} />;
  }

  if (!initialLoadDone) {
    return <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><h2 className="text-gradient">Loading Profile...</h2></div>;
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo text-gradient" onClick={() => { setViewMode('timeline'); setSelectedMoods([]); }} style={{ cursor: 'pointer' }}>
          🎮 PlayPace
        </div>
        
        <div className="search-container">
          <form onSubmit={(e) => e.preventDefault()} className="search-form">
            <input 
              type="text" 
              placeholder={loading ? "Adding..." : "Search for a game..."}
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              disabled={loading}
              className="search-input"
            />
          </form>
          {showDropdown && suggestions.length > 0 && (
            <div className="autocomplete-dropdown glass-panel">
              {suggestions.map(s => (
                <div key={s.appid} className="autocomplete-item" onClick={() => handleSelectGame(s)}>
                  <img src={s.cover_url} alt={s.name} loading="lazy" />
                  <span>{s.name}</span>
                  <button 
                    className="add-search-btn" 
                    onClick={(e) => { e.stopPropagation(); handleSelectGame(s); }}
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isSyncing && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Syncing...</span>}
          <button onClick={handleLogout} className="toggle-btn">Logout</button>
        </div>
      </header>

      <main className="dashboard-grid">
        <aside className="sidebar">
          <LibraryCard 
            games={libraryGames} 
            onClick={() => { setViewMode('library'); setSelectedMoods([]); }}
          />
          <PacingController budget={budget} onBudgetChange={setBudget} />
          <MoodMatrix selectedMoods={selectedMoods} onMoodToggle={handleMoodToggle} />
        </aside>

        <section className="main-content">
          {viewMode === 'library' ? (
            <LibraryView 
              games={libraryGames} 
              budget={budget}
              onRemoveGame={handleRemoveGame} 
              onOpenTimeline={() => setViewMode('timeline')}
            />
          ) : viewMode === 'discovery' && suggesting && discoveryGames.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
              We are finding the perfect games for your mood...
            </div>
          ) : (
            <TimelineCanvas 
              games={viewMode === 'discovery' ? discoveryGames : libraryGames} 
              budget={budget} 
              aiHighlightedIndices={viewMode === 'discovery' ? aiHighlightedIndices : []} 
              onLoadMore={viewMode === 'discovery' ? handleMoreResults : undefined}
              loadingMore={suggesting}
              onAddToLibrary={viewMode === 'discovery' ? handleAddToLibrary : undefined}
              libraryAppIds={libraryGames.map(g => g.appid)}
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
