import React from 'react';
import { Filter, Download } from 'lucide-react';

const FilterBar = ({ selectedFilter, handleFilter, riskLevels, exportData }) => {
  return (
    <div style={{
      background: 'rgba(30, 41, 59, 0.5)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      padding: '1rem',
      marginBottom: '1.5rem',
      border: '1px solid rgba(168, 85, 247, 0.2)'
    }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Filter style={{ width: '20px', height: '20px', color: '#9ca3af' }} />
          <span style={{ color: '#d1d5db' }}>Filter by risk:</span>
          {['all', ...riskLevels].map(level => (
            <button
              key={level}
              onClick={() => handleFilter(level)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: selectedFilter === level ? '#9333ea' : '#334155',
                color: selectedFilter === level ? 'white' : '#d1d5db',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={exportData}
          style={{
            padding: '0.5rem 1rem',
            background: '#16a34a',
            color: 'white',
            borderRadius: '8px',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          <Download style={{ width: '16px', height: '16px' }} />
          Export CSV
        </button>
      </div>
    </div>
  );
};

export default FilterBar;