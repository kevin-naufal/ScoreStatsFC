import React from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { loadCsv } from '../utils/csv.js';
import { normalizeText } from '../utils/text.js';

export default function Team(){
  const { id } = useParams();
  const teamName = decodeURIComponent(id||'');
  const normTeam = normalizeText(teamName);
  const [rows, setRows] = React.useState([]);
  const [error, setError] = React.useState('');

  React.useEffect(()=>{
    let cancelled = false;
    (async()=>{
      try{
        let data;
        try { data = await loadCsv('/data/players_top5_2324.csv'); }
        catch { data = []; }
        if(!cancelled) setRows(Array.isArray(data)? data : []);
      }catch(e){ if(!cancelled) setError('Gagal memuat data klub.'); }
    })();
    return ()=>{ cancelled = true; };
  },[]);

  const getTeam = r => r.team || r.Team || r.club || r.Club || r.Squad;
  const getName = r => r.name || r.Player || r.player || r.player_name || r.FullName || r.full_name;
  const teamRows = rows.filter(r => normalizeText(getTeam(r)) === normTeam);

  return (
    <div id="teamPage" className="page">
      <h2>Detail Klub</h2>
      {error && <div className="message error">{error}</div>}
      <div className="club-card" style={{marginBottom:'1rem'}}>
        <h3>{teamName || 'Klub'}</h3>
        <p><strong>Skuad (estimasi dari CSV):</strong> {teamRows.length || 'N/A'} pemain</p>
      </div>
      <div className="players-grid">
        {teamRows.map((r,i)=> {
          const playerName = getName(r);
          return (
            <div className="player-card" key={i}>
              <h3>
                <Link 
                  to={`/player/${encodeURIComponent(playerName)}`} 
                  style={{ 
                    textDecoration:'none', 
                    color:'inherit',
                    cursor:'pointer',
                    display:'block',
                    transition:'color 0.2s'
                  }}
                  onMouseEnter={(e)=> e.currentTarget.style.color='#3b82f6'}
                  onMouseLeave={(e)=> e.currentTarget.style.color='inherit'}
                >
                  {playerName}
                </Link>
              </h3>
            </div>
          );
        })}
        {teamRows.length===0 && <div>Tidak ada data pemain untuk klub ini.</div>}
      </div>
    </div>
  );
}


