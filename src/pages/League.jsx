import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadCsv } from '../utils/csv.js';
import { normalizeText } from '../utils/text.js';
import { mockData } from '../mockData.js';

export default function League(){
  const { id } = useParams();
  const rawId = decodeURIComponent(id||'');
  const mapping = {
    premier: { name: 'Premier League', comp: 'eng Premier League' },
    'serie-a': { name: 'Serie A', comp: 'it Serie A' },
    bundesliga: { name: 'Bundesliga', comp: 'de Bundesliga' },
    laliga: { name: 'La Liga', comp: 'es La Liga' },
    ligue1: { name: 'Ligue 1', comp: 'fr Ligue 1' },
  };
  const resolved = mapping[rawId] || { name: rawId, comp: rawId };
  const leagueName = resolved.name;
  const normLeague = normalizeText(resolved.comp);
  const [rows, setRows] = React.useState([]);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(()=>{
    let cancelled = false;
    (async()=>{
      try{
        let data;
        try { data = await loadCsv('/data/players_top5_2324.csv'); }
        catch { data = []; }
        if(!cancelled){ setRows(Array.isArray(data)? data : []); setLoading(false); }
      }catch(e){ if(!cancelled){ setError('Gagal memuat data liga.'); setLoading(false); } }
    })();
    return ()=>{ cancelled = true; };
  },[]);

  const getLeague = r => r.league || r.League || r.competition || r.Competition || r.Comp;
  const getTeam = r => r.team || r.Team || r.club || r.Club || r.Squad;
  const getName = r => r.name || r.Player || r.player || r.player_name || r.FullName || r.full_name;

  const leagueRows = rows.filter(r => {
    const s = normalizeText(getLeague(r)||'');
    return s === normLeague || s.includes(normLeague) || normLeague.includes(s);
  });
  
  const getGls = r => Number(r.Gls || r.goals || r.G || 0) || 0;
  const getAst = r => Number(r.Ast || r.assists || r.A || 0) || 0;
  const getGA = r => getGls(r) + getAst(r);
  
  const teamStats = React.useMemo(() => {
    const teamsMap = new Map();
    leagueRows.forEach(r => {
      const team = getTeam(r);
      if(!team) return;
      if(!teamsMap.has(team)){
        teamsMap.set(team, { team, gls:0, ast:0, ga:0 });
      }
      const stats = teamsMap.get(team);
      stats.gls += getGls(r);
      stats.ast += getAst(r);
      stats.ga += getGA(r);
    });
    return Array.from(teamsMap.values());
  }, [leagueRows]);
  
  const teamsWithStats = React.useMemo(() => {
    return teamStats.map(ts => {
      const hash = Array.from(ts.team).reduce((acc,ch)=> (acc*31 + ch.charCodeAt(0))>>>0, 7);
      const rand = (min, max)=> min + (hash % (max - min + 1));
      const mp = rand(25, 38);
      const win = Math.floor(mp * 0.35 + rand(-3,3));
      const draw = Math.floor((mp - win) * 0.25);
      const lose = mp - win - draw;
      const points = win * 3 + draw;
      const gf = ts.gls;
      const ga = Math.max(0, gf - rand(5, 25));
      const gd = gf - ga;
      return { ...ts, mp, win, draw, lose, points, gf, ga, gd };
    }).sort((a, b) => {
      if(a.points !== b.points) return b.points - a.points;
      if(a.gd !== b.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });
  }, [teamStats]);

  return (
    <div id="leaguePage" className="page">
      <h2>{leagueName || 'Detail Liga'}</h2>
      {loading && <div className="message">Memuat data liga...</div>}
      {error && <div className="message error">{error}</div>}
      <div className="fixture-group">
        <h3>Tabel Liga</h3>
        {teamsWithStats.length>0 ? (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'separate', borderSpacing:0, fontSize:'0.9rem' }}>
              <thead>
                <tr style={{ background:'#f3f4f6' }}>
                  <th style={{ textAlign:'center', padding:'10px 8px', borderBottom:'1px solid #e5e7eb', minWidth:40 }}>Pos</th>
                  <th style={{ textAlign:'left', padding:'10px 12px', borderBottom:'1px solid #e5e7eb', minWidth:150 }}>Klub</th>
                  <th style={{ textAlign:'center', padding:'10px 8px', borderBottom:'1px solid #e5e7eb', minWidth:50 }}>PTS</th>
                  <th style={{ textAlign:'center', padding:'10px 8px', borderBottom:'1px solid #e5e7eb', minWidth:50 }}>MP</th>
                  <th style={{ textAlign:'center', padding:'10px 8px', borderBottom:'1px solid #e5e7eb', minWidth:50 }}>G</th>
                  <th style={{ textAlign:'center', padding:'10px 8px', borderBottom:'1px solid #e5e7eb', minWidth:50 }}>GC</th>
                  <th style={{ textAlign:'center', padding:'10px 8px', borderBottom:'1px solid #e5e7eb', minWidth:50 }}>GD</th>
                </tr>
              </thead>
              <tbody>
                {teamsWithStats.map((ts, i)=> (
                  <tr key={i} style={{ borderBottom:'1px solid #f1f5f9' }}>
                    <td style={{ padding:'10px 8px', textAlign:'center', fontWeight:600 }}>{i+1}</td>
                    <td style={{ padding:'10px 12px', fontWeight:600 }}>
                      <Link 
                        to={`/team/${encodeURIComponent(ts.team)}`}
                        style={{ textDecoration:'none', color:'inherit', cursor:'pointer', transition:'color 0.2s' }}
                        onMouseEnter={(e)=> e.currentTarget.style.color='#3b82f6'}
                        onMouseLeave={(e)=> e.currentTarget.style.color='inherit'}
                      >
                        {ts.team}
                      </Link>
                    </td>
                    <td style={{ padding:'10px 8px', textAlign:'center' }}>0</td>
                    <td style={{ padding:'10px 8px', textAlign:'center' }}>0</td>
                    <td style={{ padding:'10px 8px', textAlign:'center' }}>0</td>
                    <td style={{ padding:'10px 8px', textAlign:'center' }}>0</td>
                    <td style={{ padding:'10px 8px', textAlign:'center' }}>0</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop:'8px', fontSize:'0.85rem', color:'#6b7280' }}>
              <strong>Keterangan:</strong> MP = Match Played, PTS = Poin, G = Gol, GC = Goal Concede, GD = Goal Difference
            </div>
          </div>
        ) : (!loading && <div>Tidak ada data klub untuk liga ini.</div>)}
      </div>
    </div>
  );
}


