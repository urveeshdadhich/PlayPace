import React from 'react';
import type { Game, Budget } from '../types';
import './LibraryView.css';

interface Props {
  games: Game[];
  budget: Budget;
  onRemoveGame: (appid: number) => void;
  onOpenTimeline: () => void;
}

export const LibraryView: React.FC<Props> = ({ games, budget, onRemoveGame, onOpenTimeline }) => {
  const totalHours = games.reduce((sum, g) => sum + (g.hltb?.main_story || 0), 0);
  
  const calculateDays = (hoursNeeded: number) => {
    if (!hoursNeeded) return 'Unknown';
    if (budget.type === 'day') {
      return Math.ceil(hoursNeeded / budget.hours);
    } else {
      return Math.ceil(hoursNeeded / (budget.hours / 7));
    }
  };
  
  const totalDays = calculateDays(totalHours);

  return (
    <div className="library-view-container glass-panel">
      <div className="library-view-header">
        <div>
          <h2 className="text-gradient">My Library Collection</h2>
          <p>You have {games.length} games taking an estimated {totalHours} hours to beat ({totalDays} days at your pace).</p>
        </div>
        <button className="timeline-btn" onClick={onOpenTimeline}>
          View Pacing Timeline ➡️
        </button>
      </div>

      <div className="library-grid-layout">
        {games.length === 0 ? (
          <div className="empty-library-msg">
            Your library is empty. Search for games or use the Mood Matrix to discover!
          </div>
        ) : (
          games.map(game => (
            <div key={game.appid} className="library-grid-card">
              <img src={game.cover_url} alt={game.name} className="grid-cover" loading="lazy" />
              <div className="grid-card-overlay">
                <div className="grid-card-title" title={game.name}>{game.name}</div>
                <div className="grid-card-time">⏱️ {game.hltb?.main_story || '?'} hrs ({calculateDays(game.hltb?.main_story || 0)} days)</div>
                <button 
                  className="grid-remove-btn"
                  onClick={(e) => { e.stopPropagation(); onRemoveGame(game.appid); }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
