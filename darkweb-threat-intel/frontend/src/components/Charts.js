import React from 'react';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer
} from 'recharts';

const Charts = ({ threats }) => {
  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

  // ✅ Fix: Handle undefined / missing riskLevel values safely
  const getRiskDistribution = () => {
    const dist = { Critical: 0, High: 0, Medium: 0, Low: 0 };

    threats.forEach(t => {
      const level = t.riskLevel?.trim() || 'Low'; // Default if missing
      if (dist[level] !== undefined) {
        dist[level]++;
      } else {
        dist['Low']++; // fallback to Low if unknown
      }
    });

    // ✅ Fix: Remove zero-value entries so pie chart renders properly
    return Object.entries(dist)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  };

  const getThreatTypeDistribution = () => {
    const dist = {};
    threats.forEach(t => {
      const type = t.type || 'Unknown';
      dist[type] = (dist[type] || 0) + 1;
    });
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  };

 const getTimelineData = () => {
  const timeline = {};

  threats.forEach(t => {
    if (!t.timestamp) return;

    const dateKey = new Date(t.timestamp).toISOString().split("T")[0];
    timeline[dateKey] = (timeline[dateKey] || 0) + 1;
  });

  return Object.entries(timeline)
    .map(([date, count]) => ({
      date,
      count,
      _ts: new Date(date).getTime()
    }))
    .sort((a, b) => a._ts - b._ts) // ✅ ascending
    .map(({ date, count }) => ({ date, count }));
};


  const cardStyle = {
    background: 'rgba(30, 41, 59, 0.5)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    padding: '1.5rem',
    border: '1px solid rgba(168, 85, 247, 0.2)'
  };

  const riskData = getRiskDistribution();

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}
      >
        {/* ✅ Fixed Risk Distribution Chart */}
        <div style={cardStyle}>
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '1rem'
            }}
          >
            Risk Distribution
          </h3>
          {riskData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => {
                    const percentage = (percent * 100).toFixed(1);
                    return `${name}\n${percentage}%`;
                  }}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => {
                    const total = riskData.reduce((sum, item) => sum + item.value, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    return `${value} threats (${percentage}%)`;
                  }}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #6366f1',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ color: '#9ca3af', textAlign: 'center', marginTop: '4rem' }}>
              No risk data available
            </div>
          )}
          {/* Risk breakdown legend */}
          <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#d1d5db' }}>
            {riskData.map((item, idx) => {
              const total = riskData.reduce((sum, i) => sum + i.value, 0);
              const percentage = ((item.value / total) * 100).toFixed(1);
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '2px',
                      marginRight: '0.5rem',
                      backgroundColor: COLORS[idx % COLORS.length]
                    }}
                  />
                  <span>{item.name}: {item.value} ({percentage}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Threat Types */}
        <div style={cardStyle}>
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '1rem'
            }}
          >
            Threat Types
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getThreatTypeDistribution()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="name"
                stroke="#9ca3af"
                angle={-45}
                textAnchor="end"
                height={100}
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #6366f1',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Threat Timeline */}
      <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '1rem'
          }}
        >
          Threat Timeline
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={getTimelineData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #6366f1',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#8b5cf6"
              strokeWidth={2}
              name="Threats Detected"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default Charts;
