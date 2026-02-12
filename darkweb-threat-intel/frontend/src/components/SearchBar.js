import React, { useState } from 'react';
import { Search } from 'lucide-react';

// mode: 'scan' (dark web scan) or 'vt' (VirusTotal lookup)
const SearchBar = ({ orgName, setOrgName, handleSearch, isScanning, scanProgress, onVTLookup }) => {
  const [mode, setMode] = useState('scan');
  const [vtType, setVtType] = useState('domain');
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div style={{
      background: 'rgba(30, 41, 59, 0.5)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      border: '1px solid rgba(168, 85, 247, 0.2)'
    }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={mode === 'scan' ? 'Enter organization name to scan...' : 'Enter domain/ip/hash/url for VT lookup...'}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              background: '#334155',
              color: 'white',
              borderRadius: '8px',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              fontSize: '1rem'
            }}
          />
        </div>

        <select value={mode} onChange={(e) => setMode(e.target.value)} style={{ padding: '0.5rem', borderRadius: '8px', background: '#0f172a', color: 'white', border: '1px solid rgba(168,85,247,0.2)' }}>
          <option value="scan">Scan</option>
          <option value="vt">VT Lookup</option>
        </select>

        {mode === 'vt' && (
          <select value={vtType} onChange={(e) => setVtType(e.target.value)} style={{ padding: '0.5rem', borderRadius: '8px', background: '#0f172a', color: 'white', border: '1px solid rgba(168,85,247,0.2)' }}>
            <option value="domain">Domain</option>
            <option value="ip">IP</option>
            <option value="file">File Hash</option>
            <option value="url">URL (submit)</option>
          </select>
        )}

        <button
          onClick={() => {
            if (mode === 'scan') handleSearch();
            else onVTLookup && onVTLookup(vtType, orgName);
          }}
          disabled={isScanning || (mode === 'vt' && !orgName)}
          style={{
            padding: '0.75rem 1rem',
            background: isScanning ? '#4b5563' : '#9333ea',
            color: 'white',
            borderRadius: '8px',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1rem',
            fontWeight: '500'
          }}
        >
          <Search style={{ width: '20px', height: '20px' }} />
          {isScanning ? 'Scanning...' : mode === 'scan' ? 'Scan Dark Web' : 'VT Lookup'}
        </button>
      </div>

      {isScanning && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.875rem',
            color: '#d1d5db',
            marginBottom: '0.5rem'
          }}>
            <span>Scanning dark web sources...</span>
            <span>{scanProgress}%</span>
          </div>
          <div style={{
            width: '100%',
            background: '#334155',
            borderRadius: '9999px',
            height: '8px',
            overflow: 'hidden'
          }}>
            <div
              style={{
                background: '#a855f7',
                height: '100%',
                borderRadius: '9999px',
                width: scanProgress + '%',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>
      )}

      <div style={{ marginTop: '0.5rem', color: '#9ca3af', fontSize: '0.85rem' }}>Make sure the backend server (port 5000) is running to perform VT lookups.</div>
    </div>
  );
};

export default SearchBar;