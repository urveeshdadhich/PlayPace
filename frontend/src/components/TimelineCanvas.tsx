import React from 'react';
import './TimelineCanvas.css';
import type { Game, Budget } from '../types';

interface Props {
  games: Game[];
  budget: Budget;
  aiHighlightedIndices: number[];
  onLoadMore?: () => void;
  loadingMore?: boolean;
  onAddToLibrary?: (game: Game) => void;
  libraryAppIds?: number[];
}

export const TimelineCanvas: React.FC<Props> = ({ games, budget, aiHighlightedIndices, onLoadMore, loadingMore, onAddToLibrary, libraryAppIds = [] }) => {
  
  const calculateDays = (hoursNeeded: number) => {
    if (!hoursNeeded) return 'Unknown';
    if (budget.type === 'day') {
      return Math.ceil(hoursNeeded / budget.hours) + ' days';
    } else {
      return Math.ceil(hoursNeeded / (budget.hours / 7)) + ' days';
    }
  };

  return (
    <div className="glass-panel timeline-canvas">
      <div className="timeline-header">
        <h2 className="text-gradient">Timeline Canvas</h2>
        <p>Your projected backlog clearing schedule based on your pacing.</p>
      </div>

      <div className="canvas-area">
        {games.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
            Search or select a mood to see games!
          </div>
        ) : (
          <div className="gantt-track">
            {games.map((game, idx) => {
              const inLibrary = libraryAppIds.includes(game.appid);
              return (
              <div 
                key={game.appid} 
                className={`game-node ${aiHighlightedIndices.includes(idx) ? 'ai-highlight' : ''}`}
              >
                <img src={game.cover_url} alt={game.name} className="game-cover" loading="lazy" />
                <div className="game-details">
                  <div className="game-title" title={game.name}>{game.name}</div>
                  <div className="game-meta">
                    <div className="completion-time">
                      <span>⏱️</span>
                      <span>{game.hltb?.main_story || '?'} hrs</span>
                    </div>
                    <div>{calculateDays(game.hltb?.main_story || 0)}</div>
                  </div>
                </div>
                {onAddToLibrary && !inLibrary && (
                  <button 
                    className="add-to-lib-btn"
                    onClick={() => onAddToLibrary(game)}
                    title="Add to My Library"
                  >
                    + Add
                  </button>
                )}
                {inLibrary && onAddToLibrary && (
                  <span className="in-lib-badge">In Library</span>
                )}
              </div>
            )})}
            
            {onLoadMore && (
              <div 
                className={`game-node load-more-node ${loadingMore ? 'loading' : ''}`} 
                onClick={!loadingMore ? onLoadMore : undefined}
              >
                {loadingMore ? (
                  <div className="load-more-content loading-pulse">
                    <span className="loader-ring"></span>
                    <span>Finding...</span>
                  </div>
                ) : (
                  <div className="load-more-content">
                    <span className="plus-icon">+</span>
                    <span>Load 10 More</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
