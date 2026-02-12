import React from 'react';

const ThreatTable = ({ threats }) => {
  const getRiskStyle = (riskLevel) => {
    const styles = {
      Critical: { background: '#ef4444', color: 'white' },
      High: { background: '#f97316', color: 'white' },
      Medium: { background: '#eab308', color: 'black' },
      Low: { background: '#22c55e', color: 'white' }
    };
    return styles[riskLevel] || {};
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{
      background: 'rgba(30, 41, 59, 0.5)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid rgba(168, 85, 247, 0.2)'
    }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>
        Detected Threats
      </h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #374151' }}>
              <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#d1d5db', fontWeight: '600' }}>
                ID
              </th>
              <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#d1d5db', fontWeight: '600' }}>
                Type
              </th>
              <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#d1d5db', fontWeight: '600' }}>
                Description
              </th>
              <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#d1d5db', fontWeight: '600' }}>
                Risk
              </th>
              <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#d1d5db', fontWeight: '600' }}>
                Source
              </th>
              <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#d1d5db', fontWeight: '600' }}>
                Timestamp
              </th>
              <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#d1d5db', fontWeight: '600' }}>
                Confidence
              </th>
            </tr>
          </thead>
          <tbody>
            {threats.map((threat) => (
              <tr 
                key={threat.id} 
                style={{ 
                  borderBottom: '1px solid #374151',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(168, 85, 247, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '0.75rem 1rem', color: '#d1d5db' }}>
                  #{threat.id}
                </td>
                <td style={{ padding: '0.75rem 1rem', color: '#d1d5db' }}>
                  {threat.type}
                </td>
                <td style={{ padding: '0.75rem 1rem', color: '#d1d5db', maxWidth: '300px' }}>
                  {threat.description}
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span style={{
                    ...getRiskStyle(threat.riskLevel),
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    {threat.riskLevel}
                  </span>
                </td>
                <td style={{ padding: '0.75rem 1rem', color: '#d1d5db', fontSize: '0.875rem' }}>
                  {threat.source}
                </td>
                <td style={{ padding: '0.75rem 1rem', color: '#d1d5db', fontSize: '0.875rem' }}>
                  {formatDate(threat.timestamp)}
                </td>
                <td style={{ padding: '0.75rem 1rem', color: '#d1d5db' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      width: '60px',
                      height: '6px',
                      background: '#374151',
                      borderRadius: '9999px',
                      overflow: 'hidden',
                      marginRight: '0.5rem'
                    }}>
                      <div style={{
                        width: `${threat.confidence}%`,
                        height: '100%',
                        background: threat.confidence >= 80 ? '#22c55e' : threat.confidence >= 60 ? '#eab308' : '#ef4444',
                        borderRadius: '9999px'
                      }} />
                    </div>
                    <span style={{ fontSize: '0.875rem' }}>{threat.confidence}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ThreatTable;