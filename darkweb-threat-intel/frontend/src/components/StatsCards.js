import React from 'react';
import { Shield, TrendingUp, AlertCircle, Database } from 'lucide-react';

const StatsCards = ({ threats }) => {
  const getRiskScore = () => {
    if (threats.length === 0) return 0;
    const weights = { Critical: 10, High: 7, Medium: 4, Low: 1 };
    const total = threats.reduce((sum, t) => sum + weights[t.riskLevel], 0);
    return Math.min(100, Math.round((total / threats.length) * 10));
  };

  const criticalCount = threats.filter(t => t.riskLevel === 'Critical').length;

  const cards = [
    {
      title: 'Total Threats',
      value: threats.length,
      icon: Shield,
      color: '#ef4444',
      borderColor: 'rgba(239, 68, 68, 0.2)'
    },
    {
      title: 'Risk Score',
      value: getRiskScore() + '/100',
      icon: TrendingUp,
      color: '#f97316',
      borderColor: 'rgba(249, 115, 22, 0.2)'
    },
    {
      title: 'Critical Threats',
      value: criticalCount,
      icon: AlertCircle,
      color: '#eab308',
      borderColor: 'rgba(234, 179, 8, 0.2)'
    },
    {
      title: 'Sources Scanned',
      value: '847',
      icon: Database,
      color: '#a855f7',
      borderColor: 'rgba(168, 85, 247, 0.2)'
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem'
    }}>
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="card-hover"
            style={{
              background: 'rgba(30, 41, 59, 0.5)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid ' + card.borderColor
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  {card.title}
                </p>
                <p style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {card.value}
                </p>
              </div>
              <Icon style={{ width: '40px', height: '40px', color: card.color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;