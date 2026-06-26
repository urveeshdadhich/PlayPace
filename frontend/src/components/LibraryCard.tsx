import React from 'react';
import type { Game } from '../types';
import './LibraryCard.css';

interface Props {
  games: Game[];
  onClick?: () => void;
}

export const LibraryCard: React.FC<Props> = ({ games, onClick }) => {
  return (
    <div 
      className="glass-panel library-card" 
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', padding: '16px' }}
      title="Click to view full library"
    >
      <div className="library-header" style={{ margin: 0, justifyContent: 'center', gap: '12px' }}>
        <h3 className="text-gradient">My Library</h3>
        <span className="game-count">{games.length} Games</span>
      </div>
    </div>
  );
};
