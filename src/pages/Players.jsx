import React from 'react';
import { Link } from 'react-router-dom';
import { loadCsv } from '../utils/csv.js';
import { normalizeText } from '../utils/text.js';

export default function Players(){
  const [rows, setRows] = React.useState([]);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setError('');
      setLoading(true);
      try {
        let data;
        try { data = await loadCsv('/data/players_top5_2324.csv'); }
        catch { data = []; }
        if (!Array.isArray(data)) data = [];
        if (!cancelled) { setRows(data); setLoading(false); }
      } catch (e) {
        if (!cancelled) {
          setRows([]);
          setError('Gagal memuat data pemain.');
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const getName = r => r.Player || r.name || r.player || r.player_name || r.FullName || r.full_name || '';
  const getPos = r => r.Pos || r.pos || r.position || r.Position || '';
  const getTeam = r => r.Squad || r.team || r.Team || r.club || r.Club || '';
  const getGls = r => Number(r.Gls || r.goals || r.G || 0) || 0;
  const getAst = r => Number(r.Ast || r.assists || r.A || 0) || 0;
  const getGA = r => getGls(r) + getAst(r);
  const getPrgC = r => Number(r.PrgC || r['Prog Carries'] || 0) || 0;
  const getPrgP = r => Number(r.PrgP || r['Prog Passes'] || 0) || 0;
  const getPrgR = r => Number(r.PrgR || r['Prog Runs'] || 0) || 0;
  const getMP = r => Number(r.MP || r.Matches || 0) || 0;
  const getMin = r => Number(r.Min || r.Minutes || 0) || 0;

  const normalizePos = (pos) => {
    const s = String(pos || '').toUpperCase();
    // Untuk posisi gabungan seperti "MF,FW", ambil posisi pertama
    const firstPos = s.split(/[\/,\s]/)[0];
    if (firstPos.includes('GK') || firstPos === 'G') return 'GK';
    if (firstPos.includes('DF') || firstPos.includes('DEF')) return 'DF';
    if (firstPos.includes('MF') || firstPos.includes('MID')) return 'MF';
    if (firstPos.includes('FW') || firstPos.includes('FWD') || firstPos.includes('ST')) return 'FW';
    // Jika tidak ada yang cocok, cek seluruh string
    if (s.includes('GK')) return 'GK';
    if (s.includes('DF') || s.includes('DEF')) return 'DF';
    if (s.includes('MF') || s.includes('MID')) return 'MF';
    if (s.includes('FW') || s.includes('FWD') || s.includes('ST')) return 'FW';
    return '';
  };

  const allPlayers = rows.map(r => ({
    name: getName(r),
    pos: normalizePos(getPos(r)),
    team: getTeam(r),
    gls: getGls(r),
    ast: getAst(r),
    ga: getGA(r),
    prgC: getPrgC(r),
    prgP: getPrgP(r),
    prgR: getPrgR(r),
    mp: getMP(r),
    min: getMin(r),
  })).filter(p => p.name);

  // Top 10 untuk berbagai kategori
  const topGoals = [...allPlayers].sort((a, b) => b.gls - a.gls).slice(0, 10);
  const topAssists = [...allPlayers].sort((a, b) => b.ast - a.ast).slice(0, 10);
  const topGA = [...allPlayers].sort((a, b) => b.ga - a.ga).slice(0, 10);
  const topPrgC = [...allPlayers].sort((a, b) => b.prgC - a.prgC).slice(0, 10);
  const topPrgP = [...allPlayers].sort((a, b) => b.prgP - a.prgP).slice(0, 10);
  
  // Top 10 berdasarkan posisi
  const topFWGoals = allPlayers.filter(p => p.pos === 'FW').sort((a, b) => b.gls - a.gls).slice(0, 10);
  const topFWAssists = allPlayers.filter(p => p.pos === 'FW').sort((a, b) => b.ast - a.ast).slice(0, 10);
  const topFWGA = allPlayers.filter(p => p.pos === 'FW').sort((a, b) => b.ga - a.ga).slice(0, 10);
  
  const topMFAssists = allPlayers.filter(p => p.pos === 'MF').sort((a, b) => b.ast - a.ast).slice(0, 10);
  const topMFPrgP = allPlayers.filter(p => p.pos === 'MF').sort((a, b) => b.prgP - a.prgP).slice(0, 10);
  const topMFGA = allPlayers.filter(p => p.pos === 'MF').sort((a, b) => b.ga - a.ga).slice(0, 10);
  
  const topDFPrgC = allPlayers.filter(p => p.pos === 'DF').sort((a, b) => b.prgC - a.prgC).slice(0, 10);
  const topDFPrgP = allPlayers.filter(p => p.pos === 'DF').sort((a, b) => b.prgP - a.prgP).slice(0, 10);
  const topDFMP = allPlayers.filter(p => p.pos === 'DF').sort((a, b) => b.mp - a.mp).slice(0, 10);
  
  const topGKMP = allPlayers.filter(p => p.pos === 'GK').sort((a, b) => b.mp - a.mp).slice(0, 10);
  const topGKMin = allPlayers.filter(p => p.pos === 'GK').sort((a, b) => b.min - a.min).slice(0, 10);

  const renderTopTable = (title, data, statKey, statLabel) => {
    if (data.length === 0) return null;
    return (
      <div className="fixture-group" style={{ marginBottom:'24px' }}>
        <h3 style={{ marginTop:0, marginBottom:'16px' }}>{title}</h3>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'separate', borderSpacing:0, fontSize:'0.9rem' }}>
            <thead>
              <tr style={{ background:'#f3f4f6' }}>
                <th style={{ textAlign:'center', padding:'10px 8px', borderBottom:'1px solid #e5e7eb', minWidth:40 }}>Rank</th>
                <th style={{ textAlign:'left', padding:'10px 12px', borderBottom:'1px solid #e5e7eb', minWidth:200 }}>Pemain</th>
                <th style={{ textAlign:'left', padding:'10px 12px', borderBottom:'1px solid #e5e7eb', minWidth:150 }}>Klub</th>
                <th style={{ textAlign:'center', padding:'10px 8px', borderBottom:'1px solid #e5e7eb', minWidth:100 }}>{statLabel}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p, i) => (
                <tr key={`${title}-${i}`} style={{ borderBottom:'1px solid #f1f5f9' }}>
                  <td style={{ padding:'10px 8px', textAlign:'center', fontWeight:600 }}>{i + 1}</td>
                  <td style={{ padding:'10px 12px', fontWeight:600 }}>
                    <Link 
                      to={`/player/${encodeURIComponent(p.name)}`}
                      style={{ textDecoration:'none', color:'inherit', cursor:'pointer', transition:'color 0.2s' }}
                      onMouseEnter={(e)=> e.currentTarget.style.color='#3b82f6'}
                      onMouseLeave={(e)=> e.currentTarget.style.color='inherit'}
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td style={{ padding:'10px 12px', color:'#6b7280' }}>{p.team || '-'}</td>
                  <td style={{ padding:'10px 8px', textAlign:'center', fontWeight:600 }}>{p[statKey] || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div id="playersPage" className="page">
      <h2>Player Performance</h2>
      {loading && <div className="message">Memuat data pemain...</div>}
      {error && <div className="message error">{error}</div>}
      
      {!loading && (
        <>
          {/* Top 10 Umum */}
          <div className="fixture-group" style={{ marginBottom:'24px' }}>
            <h3 style={{ marginTop:0 }}>Top 10 Umum</h3>
          </div>
          {renderTopTable('Top 10 Gol', topGoals, 'gls', 'Gol')}
          {renderTopTable('Top 10 Assist', topAssists, 'ast', 'Assist')}
          {renderTopTable('Top 10 G+A', topGA, 'ga', 'G+A')}
          {renderTopTable('Top 10 Progressive Carries', topPrgC, 'prgC', 'Prog. Carries')}
          {renderTopTable('Top 10 Progressive Passes', topPrgP, 'prgP', 'Prog. Passes')}

          {/* Top 10 Penyerang */}
          <div className="fixture-group" style={{ marginBottom:'24px', marginTop:'32px' }}>
            <h3 style={{ marginTop:0 }}>Top 10 Penyerang (FW)</h3>
          </div>
          {renderTopTable('Top 10 Gol - Penyerang', topFWGoals, 'gls', 'Gol')}
          {renderTopTable('Top 10 Assist - Penyerang', topFWAssists, 'ast', 'Assist')}
          {renderTopTable('Top 10 G+A - Penyerang', topFWGA, 'ga', 'G+A')}

          {/* Top 10 Gelandang */}
          <div className="fixture-group" style={{ marginBottom:'24px', marginTop:'32px' }}>
            <h3 style={{ marginTop:0 }}>Top 10 Gelandang (MF)</h3>
          </div>
          {renderTopTable('Top 10 Assist - Gelandang', topMFAssists, 'ast', 'Assist')}
          {renderTopTable('Top 10 Progressive Passes - Gelandang', topMFPrgP, 'prgP', 'Prog. Passes')}
          {renderTopTable('Top 10 G+A - Gelandang', topMFGA, 'ga', 'G+A')}

          {/* Top 10 Defender */}
          <div className="fixture-group" style={{ marginBottom:'24px', marginTop:'32px' }}>
            <h3 style={{ marginTop:0 }}>Top 10 Defender (DF)</h3>
          </div>
          {renderTopTable('Top 10 Progressive Carries - Defender', topDFPrgC, 'prgC', 'Prog. Carries')}
          {renderTopTable('Top 10 Progressive Passes - Defender', topDFPrgP, 'prgP', 'Prog. Passes')}
          {renderTopTable('Top 10 Match Played - Defender', topDFMP, 'mp', 'MP')}

          {/* Top 10 Kiper */}
          <div className="fixture-group" style={{ marginBottom:'24px', marginTop:'32px' }}>
            <h3 style={{ marginTop:0 }}>Top 10 Kiper (GK)</h3>
          </div>
          {renderTopTable('Top 10 Match Played - Kiper', topGKMP, 'mp', 'MP')}
          {renderTopTable('Top 10 Menit Bermain - Kiper', topGKMin, 'min', 'Menit')}
        </>
      )}
    </div>
  );
}


