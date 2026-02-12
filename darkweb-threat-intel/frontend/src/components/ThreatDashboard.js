import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import SearchBar from './SearchBar';
import StatsCards from './StatsCards';
import FilterBar from './FilterBar';
import Charts from './Charts';
import ThreatTable from './ThreatTable';

const ThreatDashboard = ({ auth }) => {
  const [orgName, setOrgName] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [threats, setThreats] = useState([]);
  const [filteredThreats, setFilteredThreats] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showResults, setShowResults] = useState(false);

  // const threatTypes = [
  //   'Data Breach',
  //   'Credential Leak',
  //   'Malware Distribution',
  //   'Phishing Campaign',
  //   'Ransomware',
  //   'DDoS Threat',
  //   'Insider Threat',
  //   'API Exposure'
  // ];

  const riskLevels = ['Critical', 'High', 'Medium', 'Low'];

  // const generateThreatDescription = (org) => {
  //   const descriptions = [
  //     'Leaked employee credentials for ' + org + ' found on marketplace',
  //     'Database dump mentioning ' + org + ' infrastructure details',
  //     org + ' API keys exposed in paste site',
  //     'Phishing kit targeting ' + org + ' employees detected',
  //     org + ' customer data being sold on forum',
  //     'Ransomware group discussing ' + org + ' as potential target',
  //     'Compromised VPN credentials for ' + org + ' network',
  //     org + ' source code fragments discovered',
  //     'Dark web forum mentions ' + org + ' vulnerability',
  //     org + ' payment card data for sale',
  //     'Stolen ' + org + ' intellectual property detected',
  //     org + ' admin credentials compromised'
  //   ];
  //   return descriptions[Math.floor(Math.random() * descriptions.length)];
  // };

 const scanDarkWeb = async (organization) => {
  setIsScanning(true);
  setScanProgress(10);
  setShowResults(false);

  try {
    const resp = await fetch("http://127.0.0.1:8000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: organization,
        time_range: "all"
      })
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(text || "Backend error");
    }

    const data = await resp.json();

    // 🔁 ADAPTER: backend → UI threat format (REQUIRED)
    const threatArray = (data.threats || []).map((t, index) => ({
      id: index + 1,
      type: t.threat_type || "Unknown",
      description: t.title || "Threat intelligence event",
      riskLevel: t.severity || "Low",
      source: t.source || "CTI",
      timestamp: t.date || new Date().toISOString(),
      affectedSystems: 1,
      confidence: Math.round((t.confidence || 0.5) * 100)
    }));

    setThreats(threatArray);
    setFilteredThreats(threatArray);
    setShowResults(true);

  } catch (err) {
    console.error("Scan failed:", err);
    alert("Scan failed: backend not reachable or returned error");
  } finally {
    setIsScanning(false);
    setScanProgress(100);
  }
};

  const handleSearch = () => {
    if (orgName.trim()) {
      scanDarkWeb(orgName);
    }
  };

  const vtLookup = async (type, resource) => {
    if (!resource || !type) return alert('Please provide a resource and type');
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (typeof auth !== 'undefined' && auth?.token) headers['Authorization'] = 'Bearer ' + auth.token;

      const resp = await fetch('http://localhost:5000/api/vt/lookup', {
        method: 'POST',
        headers,
        body: JSON.stringify({ type, resource })
      });

      const ct = resp.headers.get('content-type') || '';
      let json;
      if (ct.includes('application/json')) {
        json = await resp.json();
      } else {
        const text = await resp.text();
        console.error('VT lookup returned non-JSON response:', text);
        return alert('VT lookup failed: server returned non-JSON response (see console)');
      }
      if (json.error) return alert('VT error: ' + json.error);

      // create a summary threat entry
      const vtThreat = {
        id: threats.length + 1,
        type: 'VirusTotal',
        description: `VirusTotal ${type} lookup for ${resource}`,
        riskLevel: 'Medium',
        source: resource,
        timestamp: new Date().toISOString(),
        affectedSystems: 0,
        confidence: 85,
        vt: json.data || json
      };

      setThreats(prev => [vtThreat, ...prev]);
      setFilteredThreats(prev => [vtThreat, ...prev]);
      setShowResults(true);
    } catch (err) {
      console.error('VT lookup failed', err);
      alert('VT lookup failed: ' + err.message);
    }
  };

  const handleFilter = (filter) => {
    setSelectedFilter(filter);
    if (filter === 'all') {
      setFilteredThreats(threats);
    } else {
      setFilteredThreats(threats.filter(t => t.riskLevel === filter));
    }
  };

  const exportData = () => {
    const csv = [
      ['ID', 'Type', 'Description', 'Risk Level', 'Source', 'Timestamp', 'Affected Systems', 'Confidence'],
      ...filteredThreats.map(t => [
        t.id,
        t.type,
        t.description,
        t.riskLevel,
        t.source,
        t.timestamp,
        t.affectedSystems,
        t.confidence
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'threat-intel-' + orgName + '-' + new Date().toISOString() + '.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
          <Shield style={{ width: '48px', height: '48px', color: '#c084fc', marginRight: '1rem' }} />
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
            Dark Web Threat Intelligence
          </h1>
        </div>
        
      </div>

      <SearchBar
        orgName={orgName}
        setOrgName={setOrgName}
        handleSearch={handleSearch}
        isScanning={isScanning}
        scanProgress={scanProgress}
        onVTLookup={vtLookup}
      />

      {showResults && (
        <div className="fade-in">
          <StatsCards threats={filteredThreats} />
          
          <FilterBar
            selectedFilter={selectedFilter}
            handleFilter={handleFilter}
            riskLevels={riskLevels}
            exportData={exportData}
          />

          <Charts threats={filteredThreats} />

          <ThreatTable threats={filteredThreats} />
        </div>
      )}
    </div>
  );
};

export default ThreatDashboard;