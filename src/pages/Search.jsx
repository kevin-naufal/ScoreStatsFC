import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { loadCsv } from '../utils/csv.js';
import { normalizeText, nameMatchScore } from '../utils/text.js';

function useQuery(){
  const { search } = useLocation();
  return new URLSearchParams(search);
}

export default function Search(){
  const q = useQuery().get('q') || '';
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(()=>{
    let cancelled=false;
    (async()=>{
      try{
        let data;
        try { data = await loadCsv('/data/players_top5_2324.csv'); }
        catch { data = []; }
        if(!cancelled) setRows(Array.isArray(data)? data : []);
      } finally { if(!cancelled) setLoading(false); }
    })();
    return ()=>{ cancelled=true; };
  },[q]);

  const norm = normalizeText;
  const qn = norm(q);
  const getName = r => r.name || r.Player || r.player || r.player_name || r.FullName || r.full_name;
  const getTeam = r => r.team || r.Team || r.club || r.Club || r.Squad;
  const getLeague = r => r.league || r.League || r.competition || r.Competition || r.Comp;

  const uniqueBy = (arr, keyFn) => {
    const seen = new Set();
    const out = [];
    for (const it of arr) {
      const k = keyFn(it);
      if (!seen.has(k)) { seen.add(k); out.push(it); }
    }
    return out;
  };

  const results = React.useMemo(()=>{
    if(!qn) return [];
    const playerCandidates = rows
      .map(r=>{
        const title = getName(r);
        const score = nameMatchScore(title, q);
        return { type:'player', title, subtitle:getTeam(r)||'—', to:`/player/${encodeURIComponent(title)}`, score };
      })
      .filter(it => it.score > 0);
    const playerHits = uniqueBy(playerCandidates, it => `player:${norm(it.title)}`)
      .sort((a,b)=> b.score - a.score || a.title.localeCompare(b.title))
      .slice(0,5);

    const teamHits = uniqueBy(
      rows.filter(r => norm(getTeam(r)).includes(qn)).map(r=>({
        type:'team', title:getTeam(r), subtitle:'Klub', to:`/team/${encodeURIComponent(getTeam(r))}`
      })),
      it => `team:${norm(it.title)}`
    ).slice(0,5);

    const leagueHits = uniqueBy(
      rows.filter(r => norm(getLeague(r)).includes(qn)).map(r=>({
        type:'league', title:getLeague(r), subtitle:'Liga', to:`/league/${encodeURIComponent(getLeague(r))}`
      })),
      it => `league:${norm(it.title)}`
    ).slice(0,5);

    return { players: playerHits, teams: teamHits, leagues: leagueHits };
  },[rows, qn]);
  return (
    <div id="searchPage" className="page">
      <h2>Hasil Pencarian</h2>
      <div className="mb-4">Menampilkan {(results.players.length+results.teams.length+results.leagues.length)} hasil untuk "{q}"</div>
      {loading && <div className="message">Memuat hasil...</div>}
      <div className="fixtures-container">
        {results.players.length>0 && <h3>Pemain</h3>}
        {results.players.map((r, idx)=> (
          <Link to={r.to} className="transfer-item" key={`player-${idx}`}>
            <div>
              <div className="transfer-player">{r.title}</div>
              <div style={{color:'#6b7280'}}>{r.subtitle}</div>
            </div>
            <div><i className="fas fa-arrow-right"></i></div>
          </Link>
        ))}
        {results.teams.length>0 && <h3 style={{marginTop:'1rem'}}>Klub</h3>}
        {results.teams.map((r, idx)=> (
          <Link to={r.to} className="transfer-item" key={`team-${idx}`}>
            <div>
              <div className="transfer-player">{r.title}</div>
              <div style={{color:'#6b7280'}}>{r.subtitle}</div>
            </div>
            <div><i className="fas fa-arrow-right"></i></div>
          </Link>
        ))}
        {results.leagues.length>0 && <h3 style={{marginTop:'1rem'}}>Liga</h3>}
        {results.leagues.map((r, idx)=> (
          <Link to={r.to} className="transfer-item" key={`league-${idx}`}>
            <div>
              <div className="transfer-player">{r.title}</div>
              <div style={{color:'#6b7280'}}>{r.subtitle}</div>
            </div>
            <div><i className="fas fa-arrow-right"></i></div>
          </Link>
        ))}
      </div>
    </div>
  );
}


