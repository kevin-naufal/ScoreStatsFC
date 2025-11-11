import React from 'react';
import { useParams } from 'react-router-dom';
import { loadCsv } from '../utils/csv.js';
import { normalizeText } from '../utils/text.js';

export default function Player(){
  const { id } = useParams();
  const playerName = decodeURIComponent(id||'');
  const normName = normalizeText(playerName);
  const [row, setRow] = React.useState(null);
  const [error, setError] = React.useState('');
  const [showDetails, setShowDetails] = React.useState(false);

  React.useEffect(()=>{
    let cancelled = false;
    (async()=>{
      try{
        let data;
        try { data = await loadCsv('/data/players_top5_2324.csv'); }
        catch { data = []; }
        if (!Array.isArray(data)) data = [];
        const getName = r => r.name || r.Player || r.player || r.player_name || r.FullName || r.full_name;
        const found = data.find(r => normalizeText(getName(r)) === normName);
        if(!cancelled) setRow(found || null);
      }catch(e){ if(!cancelled) setError('Gagal memuat data pemain.'); }
    })();
    return ()=>{ cancelled = true; };
  },[playerName]);

  const getTeam = r => r.team || r.Team || r.club || r.Club || r.Squad;
  const getPos = r => r.pos || r.position || r.Position || r.Pos;
  const getAge = r => r.age || r.Age;
  const getNation = r => r.Nation || r.nation;
  const getComp = r => r.Comp || r.league || r.League || r.competition || r.Competition;
  const getGls = r => Number(r.Gls || r.goals || r.G || 0) || 0;
  const getAst = r => Number(r.Ast || r.assists || r.A || 0) || 0;
  const getYellow = r => Number(r.CrdY || r.yellow || r.Yellow || 0) || 0;
  const getRed = r => Number(r.CrdR || r.red || r.Red || 0) || 0;
  const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  
  const calcRating = (r) => {
    const gls = getGls(r);
    const ast = getAst(r);
    const mp = Number(r.MP || 0) || 0;
    const base = 60;
    const glsBonus = Math.min(gls * 2, 20);
    const astBonus = Math.min(ast * 1.5, 15);
    const mpBonus = Math.min(mp * 0.5, 5);
    return Math.round(base + glsBonus + astBonus + mpBonus);
  };

  return (
    <div id="playerPage" className="page">
      <h2>Detail Pemain</h2>
      {error && <div className="message error">{error}</div>}
      {row ? (
        <div className="club-card">
          <h3>{playerName}</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'12px', marginBottom:'16px' }}>
            {getTeam(row) && <p><strong>Klub:</strong> {getTeam(row)}</p>}
            {getPos(row) && <p><strong>Posisi:</strong> {getPos(row)}</p>}
            {getAge(row) && <p><strong>Usia:</strong> {getAge(row)}</p>}
            {getNation(row) && <p><strong>Negara:</strong> {getNation(row)}</p>}
            {getComp(row) && <p><strong>Kompetisi:</strong> {getComp(row)}</p>}
          </div>

          <hr style={{ margin:'16px 0' }} />

          <div className="fixture-group" style={{ marginBottom:'24px' }}>
            <h4 style={{ marginTop:0 }}>Statistik Utama</h4>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'16px' }}>
              <div style={{ textAlign:'center', padding:'16px', background:'#f9fafb', borderRadius:12 }}>
                <div style={{ fontSize:'0.85rem', color:'#6b7280', marginBottom:'4px' }}>Rating Overall Musim</div>
                <div style={{ fontSize:'2rem', fontWeight:700, color:'#111827' }}>0</div>
              </div>
              <div style={{ textAlign:'center', padding:'16px', background:'#f9fafb', borderRadius:12 }}>
                <div style={{ fontSize:'0.85rem', color:'#6b7280', marginBottom:'4px' }}>Gol</div>
                <div style={{ fontSize:'2rem', fontWeight:700, color:'#111827' }}>0</div>
              </div>
              <div style={{ textAlign:'center', padding:'16px', background:'#f9fafb', borderRadius:12 }}>
                <div style={{ fontSize:'0.85rem', color:'#6b7280', marginBottom:'4px' }}>Assist</div>
                <div style={{ fontSize:'2rem', fontWeight:700, color:'#111827' }}>0</div>
              </div>
              <div style={{ textAlign:'center', padding:'16px', background:'#f9fafb', borderRadius:12 }}>
                <div style={{ fontSize:'0.85rem', color:'#6b7280', marginBottom:'4px' }}>Yellow Card</div>
                <div style={{ fontSize:'2rem', fontWeight:700, color:'#111827' }}>0</div>
              </div>
              <div style={{ textAlign:'center', padding:'16px', background:'#f9fafb', borderRadius:12 }}>
                <div style={{ fontSize:'0.85rem', color:'#6b7280', marginBottom:'4px' }}>Red Card</div>
                <div style={{ fontSize:'2rem', fontWeight:700, color:'#111827' }}>0</div>
              </div>
            </div>
            <div style={{ marginTop:'16px', textAlign:'center' }}>
              <button className="btn btn-primary" onClick={()=> setShowDetails(!showDetails)}>
                {showDetails ? 'Sembunyikan Detail' : 'Lebih Lanjut'}
              </button>
            </div>
          </div>

          {showDetails && (
            <>
              <div className="fixture-group" style={{ marginTop:'24px' }}>
                <h4 style={{ marginTop:0 }}>Ringkasan Musim</h4>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'10px' }}>
                  <div><strong>MP:</strong> 0</div>
                  <div><strong>Starter:</strong> 0</div>
                  <div><strong>Menit:</strong> 0</div>
                  <div><strong>Gol:</strong> 0</div>
                  <div><strong>Asis:</strong> 0</div>
                  <div><strong>G+A:</strong> 0</div>
                  <div><strong>xG:</strong> 0.00</div>
                  <div><strong>xAG:</strong> 0.00</div>
                  <div><strong>npxG+xAG:</strong> 0.00</div>
                </div>
              </div>

              <div className="fixture-group" style={{ marginTop:'24px' }}>
                <h4 style={{ marginTop:0 }}>Per 90 Menit</h4>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'10px' }}>
                  <div><strong>Gol/90:</strong> 0.00</div>
                  <div><strong>Asis/90:</strong> 0.00</div>
                  <div><strong>G+A/90:</strong> 0.00</div>
                  <div><strong>xG/90:</strong> 0.00</div>
                  <div><strong>xAG/90:</strong> 0.00</div>
                  <div><strong>xG+xAG/90:</strong> 0.00</div>
                </div>
              </div>

              <div className="fixture-group" style={{ marginTop:'24px' }}>
                <h4 style={{ marginTop:0 }}>Progressif</h4>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'10px' }}>
                  <div><strong>Carry Prog.:</strong> 0</div>
                  <div><strong>Umpan Prog.:</strong> 0</div>
                  <div><strong>Dribble Prog.:</strong> 0</div>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="fixture-group">Data pemain tidak ditemukan.</div>
      )}
    </div>
  );
}


