import React from 'react';
import './PacingController.css';
import type { Budget } from '../types';

interface Props {
  budget: Budget;
  onBudgetChange: (budget: Budget) => void;
}

export const PacingController: React.FC<Props> = ({ budget, onBudgetChange }) => {
  const maxHours = budget.type === 'day' ? 12 : 84;
  
  return (
    <div className="glass-panel pacing-controller">
      <h2>Pacing Controller</h2>
      <p className="text-secondary" style={{ marginBottom: '16px' }}>
        Set your available gaming time.
      </p>
      
      <div className="toggle-group">
        <button 
          className={`toggle-btn ${budget.type === 'day' ? 'active' : ''}`}
          onClick={() => onBudgetChange({ type: 'day', hours: Math.min(budget.hours, 12) })}
        >
          Per Day
        </button>
        <button 
          className={`toggle-btn ${budget.type === 'week' ? 'active' : ''}`}
          onClick={() => onBudgetChange({ type: 'week', hours: budget.hours * 7 })}
        >
          Per Week
        </button>
      </div>

      <div className="slider-container">
        <div className="slider-info">
          <span>Budget</span>
          <span className="slider-value">{budget.hours} hrs</span>
        </div>
        <input 
          type="range" 
          min="1" 
          max={maxHours} 
          value={budget.hours}
          onChange={(e) => onBudgetChange({ ...budget, hours: parseInt(e.target.value) })}
        />
      </div>
    </div>
  );
};
