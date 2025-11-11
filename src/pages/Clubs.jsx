import React from 'react';
import { loadCsv } from '../utils/csv.js';

export default function Clubs(){
  const [rows, setRows] = React.useState([]);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let data;
        try { data = await loadCsv('/data/players_top5_2324.csv'); }
        catch {
          try { data = await loadCsv('/data/chelsea_players_understat_latest.csv'); }
          catch { data = await loadCsv('/data/chelsea_players_fbref_latest.csv'); }
        }
        if (!cancelled) setRows(data);
      } catch (e) {
        if (!cancelled) setError('Gagal memuat data klub.');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const fromKaggle = rows.length > 0 && !('player_name' in rows[0]) && !('Player' in rows[0]);
  const fromUnderstat = rows.length > 0 && 'player_name' in rows[0];
  const fromFbref = rows.length > 0 && 'Player' in rows[0];

  const chelseaRows = fromKaggle
    ? rows.filter(r => String(r.team || r.Team || r.club || r.Club || r.Squad || '').toLowerCase().includes('chelsea'))
    : rows;

  return (
    <div id="clubsPage" className="page">
      <h2>Klub — Chelsea</h2>
      {error && <div className="message error">{error}</div>}
      <div className="club-card" style={{marginBottom:'1rem'}}>
        <h3>Chelsea</h3>
        <p><strong>Negara:</strong> Inggris</p>
        <p><strong>Skuad (estimasi dari CSV):</strong> {chelseaRows.length || 'N/A'} pemain</p>
      </div>
      <div className="players-grid">
        {fromKaggle && chelseaRows.map((r, i) => (
          <div className="player-card" key={i}>
            <h3>{r.name || r.Player || r.player || r.player_name || r.FullName || r.full_name || `Pemain ${i+1}`}</h3>
            {(r.pos || r.position || r.Position || r.Pos) && <p><strong>Posisi:</strong> {r.pos || r.position || r.Position || r.Pos}</p>}
          </div>
        ))}
        {fromUnderstat && rows.map((r, i) => (
          <div className="player-card" key={i}>
            <h3>{r.player_name}</h3>
            {r.position && <p><strong>Posisi:</strong> {r.position}</p>}
            {r.time && <p><strong>Menit:</strong> {r.time}</p>}
            {(r.goals||r.assists) && <p><strong>G/A:</strong> {r.goals||0}/{r.assists||0}</p>}
          </div>
        ))}
        {fromFbref && rows.map((r, i) => (
          <div className="player-card" key={i}>
            <h3>{r.Player}</h3>
            {r.Pos && <p><strong>Posisi:</strong> {r.Pos}</p>}
            {r.Min && <p><strong>Menit:</strong> {r.Min}</p>}
          </div>
        ))}
        {rows.length===0 && <div>Tidak ada data roster tersedia. Letakkan CSV di folder public/data.</div>}
      </div>
    </div>
  );
}

