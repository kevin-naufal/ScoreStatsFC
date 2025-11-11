import React from 'react';
import { Link } from 'react-router-dom';
import { mockData } from '../mockData.js';

export default function Home() {
  const [selectedLeague, setSelectedLeague] = React.useState('premier');
  const [selectedMatchweek, setSelectedMatchweek] = React.useState(1);
  
  const matchesByLeague = {
    premier: {
      1: [{ home: 'Arsenal', away: 'Chelsea', score: '2 - 1', time: '15:00', matchId: 'Arsenal_vs_Chelsea' }],
    },
    'serie-a': {},
    bundesliga: {},
    laliga: {},
    ligue1: {},
  };
  
  const maxMatchweeks = {
    premier: 38,
    'serie-a': 38,
    bundesliga: 34,
    laliga: 38,
    ligue1: 34,
  };
  
  const currentMatches = matchesByLeague[selectedLeague]?.[selectedMatchweek] || [];
  const availableMatchweeks = Array.from({ length: maxMatchweeks[selectedLeague] || 38 }, (_, i) => i + 1);
  const leagueNames = {
    premier: 'Premier League',
    'serie-a': 'Serie A',
    bundesliga: 'Bundesliga',
    laliga: 'La Liga',
    ligue1: 'Ligue 1',
  };

  return (
    <div id="homePage" className="page active">
      <div className="hero-section">
        <h2>Selamat Datang di ScoreStatsFC</h2>
        <p>Platform terlengkap untuk data sepak bola Eropa dengan analisis real-time</p>
      </div>

      <div id="highlightsWidget" className="fixture-group" aria-label="highlights">
        <div style={{ display:'flex', gap:'16px', marginBottom:'16px', flexWrap:'wrap', alignItems:'center' }}>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', alignItems:'center' }}>
            <span style={{ fontWeight:600, color:'#374151' }}>Liga:</span>
            {Object.keys(mockData.leagues).map((id) => (
              <button
                key={id}
                className={`btn ${selectedLeague===id ? 'btn-primary' : ''}`}
                onClick={()=> { setSelectedLeague(id); setSelectedMatchweek(1); }}
                style={{ 
                  background: selectedLeague===id ? undefined : 'transparent',
                  color: selectedLeague===id ? undefined : '#1e40af',
                  border: selectedLeague===id ? undefined : '2px solid #1e40af'
                }}
              >
                {leagueNames[id] || id}
              </button>
            ))}
          </div>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', alignItems:'center' }}>
            <span style={{ fontWeight:600, color:'#374151' }}>Matchweek:</span>
            <select
              value={selectedMatchweek}
              onChange={(e)=> setSelectedMatchweek(Number(e.target.value))}
              style={{
                padding:'8px 12px',
                border:'2px solid #e5e7eb',
                borderRadius:8,
                fontSize:'0.9rem',
                background:'white',
                color:'#374151',
                cursor:'pointer'
              }}
            >
              {availableMatchweeks.map(mw => (
                <option key={mw} value={mw}>Matchweek {mw}</option>
              ))}
            </select>
          </div>
        </div>
        <div id="highlightsList" className="fixtures-list">
          {currentMatches.map((match, idx) => (
            <Link 
              key={idx}
              to={`/match/${encodeURIComponent(match.matchId)}`} 
              className="fixture-item finished" 
              style={{ textDecoration:'none', color:'inherit', display:'block' }}
            >
              <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
                <span className="fixture-team" style={{ fontWeight:600 }}>{match.home}</span>
                <span className="fixture-score" style={{ fontSize:'1.5rem', fontWeight:700 }}>{match.score}</span>
                <span className="fixture-team" style={{ fontWeight:600 }}>{match.away}</span>
              </div>
              <div style={{ textAlign:'center', marginTop:'8px', color:'#6b7280' }}>{match.time}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}


