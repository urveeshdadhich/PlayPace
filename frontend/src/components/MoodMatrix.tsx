import React from 'react';
import './MoodMatrix.css';

interface Props {
  selectedMoods: string[];
  onMoodToggle: (mood: string) => void;
}

const MOODS = [
  { id: 'cozy', name: 'Cozy', emoji: '☕' },
  { id: 'adrenaline', name: 'High Adrenaline', emoji: '⚡' },
  { id: 'mind-bending', name: 'Mind-Bending', emoji: '🧠' },
  { id: 'atmospheric', name: 'Atmospheric', emoji: '🌌' },
  { id: 'story-rich', name: 'Story Rich', emoji: '📖' },
  { id: 'tactical', name: 'Tactical', emoji: '♟️' },
];

export const MoodMatrix: React.FC<Props> = ({ selectedMoods, onMoodToggle }) => {
  return (
    <div className="glass-panel mood-matrix">
      <h2>The Mood Matrix</h2>
      <div className="mood-grid">
        {MOODS.map(mood => (
          <div 
            key={mood.id}
            className={`mood-card ${selectedMoods.includes(mood.id) ? 'selected' : ''}`}
            onClick={() => onMoodToggle(mood.id)}
            role="button"
            tabIndex={0}
          >
            <span className="mood-emoji">{mood.emoji}</span>
            <span className="mood-name">{mood.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
