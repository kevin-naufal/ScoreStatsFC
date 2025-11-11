import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadCsv } from '../utils/csv.js';
import { normalizeText } from '../utils/text.js';
import { SoccerBall, Rectangle, XCircle, ArrowsClockwise, Target, X } from '@phosphor-icons/react';

export default function Match(){
  const { id } = useParams();
  const decoded = decodeURIComponent(id||'');
  // Expecting optional pattern: Home_vs_Away_YYYY-MM-DD (flexibel)
  const parts = decoded.split('_');
  const home = parts[0] || '';
  const away = parts[2] ? parts[2] : (parts[1] || '');
  const date = parts.find(p => /\d{4}-\d{2}-\d{2}/.test(p)) || '';
  const toSlug = (s)=> (s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  const homeLogo = `/assets/club-logos/${toSlug(home)||'placeholder'}.png`;
  const awayLogo = `/assets/club-logos/${toSlug(away)||'placeholder'}.png`;
  const [homeLineup, setHomeLineup] = React.useState([]);
  const [awayLineup, setAwayLineup] = React.useState([]);
  const [homeSubs, setHomeSubs] = React.useState([]);
  const [awaySubs, setAwaySubs] = React.useState([]);
  const [homeFormation, setHomeFormation] = React.useState('');
  const [awayFormation, setAwayFormation] = React.useState('');
  const [events, setEvents] = React.useState([]);
  const [stats, setStats] = React.useState({ home:{}, away:{} });
  const [tab, setTab] = React.useState('lineup'); // 'lineup' | 'events' | 'stats'
  const [score, setScore] = React.useState({ home: 0, away: 0 });
  const [error, setError] = React.useState('');
  const [selectedPlayer, setSelectedPlayer] = React.useState(null);
  const [playerStats, setPlayerStats] = React.useState({});
  const [playerAnnotations, setPlayerAnnotations] = React.useState({});
  const statsRef = React.useRef(null);

  React.useEffect(() => {
    if (selectedPlayer && statsRef.current) {
      setTimeout(() => {
        statsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [selectedPlayer]);

  React.useEffect(()=>{
    let cancelled = false;
    (async()=>{
      setError('');
      try{
        let data;
        try { data = await loadCsv('/data/players_top5_2324.csv'); }
        catch { data = []; }
        if(!Array.isArray(data)) data = [];

        const getName = r => r.name || r.Player || r.player || r.player_name || r.FullName || r.full_name;
        const getTeam = r => r.team || r.Team || r.club || r.Club || r.Squad;
        const nHome = normalizeText(home);
        const nAway = normalizeText(away);
        const homePlayers = data.filter(r => normalizeText(getTeam(r)||'') === nHome);
        const awayPlayers = data.filter(r => normalizeText(getTeam(r)||'') === nAway);

        const pickN = (arr, n)=>{
          const a = [...arr];
          for(let i=a.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
          return a.slice(0, Math.min(n, a.length));
        };

        const extractPos = (r)=> r.pos || r.position || r.Position || r.Pos || '';
        const normalizePos = (p)=>{
          const s = String(p||'').toUpperCase();
          const head = s.split(/[\/,\s]/)[0];
          return head;
        };
        const isGK = (r)=>{
          const s = normalizePos(extractPos(r));
          return s.includes('GK') || s === 'G';
        };
        const shuffle = (arr)=>{ const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
        const chooseStarting = (players)=>{
          const gks = shuffle(players.filter(isGK));
          const others = shuffle(players.filter(r=> !isGK(r)));
          const starters = [];
          if(gks.length>0) starters.push(gks[0]);
          for(const p of others){ if(starters.length>=11) break; starters.push(p); }
          for(const p of gks.slice(1)){ if(starters.length>=11) break; starters.push(p); }
          return starters.slice(0, Math.min(11, players.length));
        };

        const h11 = chooseStarting(homePlayers);
        const a11 = chooseStarting(awayPlayers);
        const hSubs = pickN(homePlayers.filter(r=> !h11.includes(r)), 7);
        const aSubs = pickN(awayPlayers.filter(r=> !a11.includes(r)), 7);

        const formations = ['4-3-3','4-2-3-1','3-5-2','4-4-2','3-4-3','5-3-2'];
        const hashBase = Array.from(decoded).reduce((acc,ch)=> (acc*31 + ch.charCodeAt(0))>>>0, 7);
        const hForm = formations[hashBase % formations.length];
        const aForm = formations[(hashBase>>4) % formations.length];

        const rankPos = (p)=>{
          const s = normalizePos(p);
          if(s.includes('GK') || s === 'G') return 0;
          if(s.includes('DF') || s.includes('CB') || s.includes('FB') || s.includes('LB') || s.includes('RB') || s==='D') return 1;
          if(s.includes('MF') || s.includes('CM') || s.includes('DM') || s.includes('AM') || s==='M') return 2;
          if(s.includes('FW') || s.includes('ST') || s.includes('CF') || s.includes('WF') || s==='F') return 3;
          return 4;
        };
        const sortByLine = (arr)=> [...arr].sort((a,b)=> rankPos(extractPos(a)) - rankPos(extractPos(b)));

        const h11Sorted = sortByLine(h11);
        const a11Sorted = sortByLine(a11);

        if(!cancelled){
          setHomeLineup(h11Sorted.map(r=>({ name: getName(r), pos: extractPos(r) })));
          setAwayLineup(a11Sorted.map(r=>({ name: getName(r), pos: extractPos(r) })));
          setHomeSubs(hSubs.map(r=>({ name: getName(r), pos: r.pos || r.position || r.Position || r.Pos })));
          setAwaySubs(aSubs.map(r=>({ name: getName(r), pos: r.pos || r.position || r.Position || r.Pos })));
          setHomeFormation(hForm);
          setAwayFormation(aForm);
        }

        // Buat skor deterministik ringan dari string decoded agar konsisten
        const hash = hashBase;
        const hGoals = (hash % 5); // 0..4
        const aGoals = ((hash>>3) % 5);
        if(!cancelled){ setScore({ home: hGoals, away: aGoals }); }

        // PRNG deterministik kecil
        let seed = hash ^ 0x9e3779b9;
        const next = ()=>{ seed = (seed*1664525 + 1013904223)>>>0; return seed; };
        const rand = (min, max)=> min + (next() % (max - min + 1));

        // Generate menit unik
        const minuteSet = new Set();
        const genMinute = ()=>{
          let m = rand(1, 90);
          let guard = 0;
          while(minuteSet.has(m) && guard < 200){ m = (m % 90) + 1; guard++; }
          minuteSet.add(m);
          return m;
        };

        // Pastikan jumlah event gol sesuai skor
        const evts = [];
        for(let i=0;i<hGoals;i++){
          const roster = h11.length? h11 : hSubs;
          const p = roster.length? roster[rand(0, roster.length-1)] : null;
          evts.push({ minute: genMinute(), team:'home', type:'goal', player: p? getName(p) : 'Pemain' });
        }
        for(let i=0;i<aGoals;i++){
          const roster = a11.length? a11 : aSubs;
          const p = roster.length? roster[rand(0, roster.length-1)] : null;
          evts.push({ minute: genMinute(), team:'away', type:'goal', player: p? getName(p) : 'Pemain' });
        }

        // Tambahkan event lain (yellow/sub/red) secara deterministik
        const extraCount = 6 + (hash % 5); // 6..10 tambahan total (termasuk goals sudah diisi)
        const types = ['yellow','sub','red'];
        for(let i=0;i<extraCount;i++){
          const team = (next() % 2) === 0 ? 'home' : 'away';
          const t = types[rand(0, types.length-1)];
          if(t==='sub'){
            // Untuk substitusi: playerOut harus dari starting lineup, playerIn harus dari subs (tim yang sama)
            const startingLineup = team==='home' ? h11 : a11;
            const subsPool = team==='home' ? hSubs : aSubs;
            // Pastikan ada pemain di starting lineup dan subs untuk substitusi
            if(startingLineup.length > 0 && subsPool.length > 0){
              const pOut = startingLineup[rand(0, startingLineup.length-1)];
              const pIn = subsPool[rand(0, subsPool.length-1)];
              evts.push({ minute: genMinute(), team, type: t, playerOut: getName(pOut), playerIn: getName(pIn) });
            }
          }else{
            // Untuk yellow/red: bisa dari starting lineup atau subs
            const roster = team==='home' ? (h11.length? h11 : hSubs) : (a11.length? a11 : aSubs);
            const fallback = team==='home' ? hSubs : aSubs;
            const arr = (roster.length? roster : fallback);
            const p = arr.length? arr[rand(0, arr.length-1)] : null;
            evts.push({ minute: genMinute(), team, type: t, player: p? getName(p) : 'Pemain' });
          }
        }
        evts.sort((a,b)=> a.minute - b.minute);

        // Hitung statistik dan anotasi per pemain dari events
        const pStats = {};
        const pAnnots = {};
        const allPlayers = [...h11Sorted, ...a11Sorted, ...hSubs, ...aSubs].map(r => getName(r));
        
        allPlayers.forEach(pName => {
          pStats[pName] = { goals: 0, assists: 0, yellows: 0, reds: 0, subOut: null, subIn: null };
          pAnnots[pName] = [];
        });

        // Generate assist untuk setiap gol SEBELUM dimasukkan ke withHalf
        evts.filter(e => e.type === 'goal').forEach((gEv) => {
          const goalScorer = gEv.player;
          // Pastikan assister berasal dari tim yang sama dengan pencetak gol
          const teamPlayers = gEv.team === 'home' 
            ? [...h11Sorted, ...hSubs].map(r => getName(r))
            : [...a11Sorted, ...aSubs].map(r => getName(r));
          const availableAssisters = teamPlayers.filter(p => p !== goalScorer);
          if(availableAssisters.length > 0) {
            const assister = availableAssisters[Math.floor(Math.random() * availableAssisters.length)];
            // Simpan assister ke event goal
            gEv.assister = assister;
            // Update stats (tapi tidak akan ditampilkan di lineup)
            pStats[assister] = pStats[assister] || { goals: 0, assists: 0, yellows: 0, reds: 0, subOut: null, subIn: null };
            pStats[assister].assists++;
            // Tidak menambahkan annotasi assist ke lineup
          }
        });

        // Sisipkan penanda Half-Time dengan skor sementara
        const htHome = evts.filter(e=> e.type==='goal' && e.team==='home' && e.minute <= 45).length + hGoals*0;
        const htAway = evts.filter(e=> e.type==='goal' && e.team==='away' && e.minute <= 45).length + aGoals*0;
        const withHalf = [];
        let insertedHalf = false;
        for(const e of evts){
          if(!insertedHalf && e.minute > 45){
            withHalf.push({ marker:'half', minute:45, htHome, htAway });
            insertedHalf = true;
          }
          withHalf.push(e);
        }
        if(!insertedHalf){
          // semua event di babak kedua tidak ada, tetap sisipkan penanda
          withHalf.push({ marker:'half', minute:45, htHome, htAway });
        }
        if(!cancelled){ setEvents(withHalf); }

        evts.forEach(ev => {
          if(ev.type === 'goal' && ev.player) {
            pStats[ev.player] = pStats[ev.player] || { goals: 0, assists: 0, yellows: 0, reds: 0, subOut: null, subIn: null };
            pStats[ev.player].goals++;
            if(!pAnnots[ev.player]) pAnnots[ev.player] = [];
            pAnnots[ev.player].push({ type: 'goal', minute: ev.minute });
          }
          if(ev.type === 'yellow' && ev.player) {
            pStats[ev.player] = pStats[ev.player] || { goals: 0, assists: 0, yellows: 0, reds: 0, subOut: null, subIn: null };
            pStats[ev.player].yellows++;
            if(!pAnnots[ev.player]) pAnnots[ev.player] = [];
            pAnnots[ev.player].push({ type: 'yellow', minute: ev.minute });
          }
          if(ev.type === 'red' && ev.player) {
            pStats[ev.player] = pStats[ev.player] || { goals: 0, assists: 0, yellows: 0, reds: 0, subOut: null, subIn: null };
            pStats[ev.player].reds++;
            if(!pAnnots[ev.player]) pAnnots[ev.player] = [];
            pAnnots[ev.player].push({ type: 'red', minute: ev.minute });
          }
          if(ev.type === 'sub') {
            if(ev.playerOut) {
              pStats[ev.playerOut] = pStats[ev.playerOut] || { goals: 0, assists: 0, yellows: 0, reds: 0, subOut: null, subIn: null };
              pStats[ev.playerOut].subOut = ev.minute;
              if(!pAnnots[ev.playerOut]) pAnnots[ev.playerOut] = [];
              pAnnots[ev.playerOut].push({ type: 'subOut', minute: ev.minute });
            }
            if(ev.playerIn) {
              pStats[ev.playerIn] = pStats[ev.playerIn] || { goals: 0, assists: 0, yellows: 0, reds: 0, subOut: null, subIn: null };
              pStats[ev.playerIn].subIn = ev.minute;
              if(!pAnnots[ev.playerIn]) pAnnots[ev.playerIn] = [];
              pAnnots[ev.playerIn].push({ type: 'subIn', minute: ev.minute });
            }
          }
        });

        if(!cancelled) {
          setPlayerStats(pStats);
          setPlayerAnnotations(pAnnots);
        }

        // Statistik pertandingan (sinkron dengan skor & kartu dari events)
        const yellowHome = evts.filter(e=> e.type==='yellow' && e.team==='home').length;
        const yellowAway = evts.filter(e=> e.type==='yellow' && e.team==='away').length;
        const redHome = evts.filter(e=> e.type==='red' && e.team==='home').length;
        const redAway = evts.filter(e=> e.type==='red' && e.team==='away').length;
        const shotsHome = Math.max(hGoals + rand(5,12), hGoals);
        const shotsAway = Math.max(aGoals + rand(5,12), aGoals);
        const sotHome = Math.max(hGoals, Math.min(shotsHome, hGoals + rand(1,4)));
        const sotAway = Math.max(aGoals, Math.min(shotsAway, aGoals + rand(1,4)));
        const cornersHome = rand(1,10);
        const cornersAway = rand(1,10);
        const foulsHome = rand(6,18);
        const foulsAway = rand(6,18);
        const offsidesHome = rand(0,4);
        const offsidesAway = rand(0,4);
        if(!cancelled){
          setStats({
            home:{ shots:shotsHome, shotsOnTarget:sotHome, corners:cornersHome, fouls:foulsHome, offsides:offsidesHome, yellows:yellowHome, reds:redHome, goals:hGoals },
            away:{ shots:shotsAway, shotsOnTarget:sotAway, corners:cornersAway, fouls:foulsAway, offsides:offsidesAway, yellows:yellowAway, reds:redAway, goals:aGoals },
          });
        }
      }catch(e){ if(!cancelled) setError('Gagal memuat data pertandingan.'); }
    })();
    return ()=>{ cancelled = true; };
  },[decoded, home, away]);
  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div id="matchPage" className="page" style={{ display:'grid', gap:'16px' }}>
      <h2>Detail Pertandingan</h2>
      {error && <div className="message error">{error}</div>}

      <div className="fixture-group" style={{ textAlign:'center', paddingTop: 0, paddingBottom: 0, display:'grid', placeContent:'center', minHeight: 140 }}>
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:'12px', flexWrap:'wrap', marginBottom: 0, minHeight: 56 }}>
          <img src={homeLogo} alt={`${home} logo`} width={28} height={28} style={{ objectFit:'contain' }} onError={(e)=>{ e.currentTarget.style.visibility='hidden'; }} />
          <h3 style={{ margin:'0', fontWeight:700, borderBottom:'none', paddingBottom:0 }}>{home}</h3>
          <div style={{ fontSize:'2rem', fontWeight:700, display:'inline-flex', alignItems:'center', justifyContent:'center', textAlign:'center', lineHeight: 1, minWidth: 120, minHeight: 40 }}>
            {score.home} - {score.away}
          </div>
          <h3 style={{ margin:'0', fontWeight:700, borderBottom:'none', paddingBottom:0 }}>{away}</h3>
          <img src={awayLogo} alt={`${away} logo`} width={28} height={28} style={{ objectFit:'contain' }} onError={(e)=>{ e.currentTarget.style.visibility='hidden'; }} />
        </div>
        {date && <div style={{ color:'#6b7280', marginTop:'6px' }}>{date}</div>}
      </div>

      

      <div className="fixture-group">
        <div style={{ display:'flex', gap:'8px', marginBottom:'12px', flexWrap:'wrap' }}>
          <button className={`btn ${tab==='lineup'? 'btn-primary':''}`} onClick={()=> setTab('lineup')}>Lineup & Formasi</button>
          <button className={`btn ${tab==='events'? 'btn-primary':''}`} onClick={()=> setTab('events')}>Event Pertandingan</button>
          <button className={`btn ${tab==='stats'? 'btn-primary':''}`} onClick={()=> setTab('stats')}>Statistik Pertandingan</button>
        </div>
        {tab==='events' ? (
          <div>
            <h4 style={{ marginTop: 0 }}>Event Pertandingan</h4>
            {events.length>0 ? (
              <div style={{ background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:12 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 70px 1fr', alignItems:'stretch' }}>
                  {events.flatMap((ev, idx)=> {
                    if(ev.marker==='half'){
                      return [(
                        <React.Fragment key={`ev-${idx}`}>
                          <div style={{ padding:'8px 12px', borderBottom:'1px solid #e5e7eb' }}></div>
                          <div style={{ padding:'8px 0', borderBottom:'1px solid #e5e7eb', textAlign:'center', color:'#374151', fontWeight:700, background:'#fff' }}>
                            HT {ev.htHome} - {ev.htAway}
                          </div>
                          <div style={{ padding:'8px 12px', borderBottom:'1px solid #e5e7eb' }}></div>
                        </React.Fragment>
                      )];
                    }
                    if(ev.type==='sub'){
                      return (
                        <React.Fragment key={`ev-${idx}`}>
                          <div style={{ padding:'8px 12px', borderBottom:'1px solid #eee', textAlign:'right' }}>
                            {ev.team==='home' ? (
                              <div style={{ display:'flex', flexDirection:'column', gap:'4px', alignItems:'flex-end' }}>
                                <span style={{ display:'inline-flex', alignItems:'center', gap:'4px' }}><strong>{ev.playerOut}</strong>{' '}<span style={{ color:'#dc2626', fontWeight:600 }}>OUT</span></span>
                                <span style={{ fontSize:'0.85rem', color:'#6b7280' }}><span style={{ color:'#059669', fontWeight:600 }}>IN</span>{' '}{ev.playerIn}</span>
                              </div>
                            ) : null}
                          </div>
                          <div style={{ padding:'8px 0', borderBottom:'1px solid #eee', textAlign:'center', color:'#111827', fontWeight:700 }}>{ev.minute}'</div>
                          <div style={{ padding:'8px 12px', borderBottom:'1px solid #eee' }}>
                            {ev.team==='away' ? (
                              <div style={{ display:'flex', flexDirection:'column', gap:'4px', alignItems:'flex-start' }}>
                                <span style={{ display:'inline-flex', alignItems:'center', gap:'4px' }}><span style={{ color:'#dc2626', fontWeight:600 }}>OUT</span>{' '}<strong>{ev.playerOut}</strong></span>
                                <span style={{ fontSize:'0.85rem', color:'#6b7280' }}>{ev.playerIn}{' '}<span style={{ color:'#059669', fontWeight:600 }}>IN</span></span>
                              </div>
                            ) : null}
                          </div>
                        </React.Fragment>
                      );
                    }
                    const getIcon = (type) => {
                      if(type === 'goal') return <SoccerBall size={16} weight="fill" color="#059669" />;
                      if(type === 'yellow') return <Rectangle size={16} weight="fill" color="#f59e0b" />;
                      if(type === 'red') return <Rectangle size={16} weight="fill" color="#dc2626" />;
                      return <ArrowsClockwise size={16} weight="fill" color="#6b7280" />;
                    };
                    if(ev.type === 'goal') {
                      return (
                        <React.Fragment key={`ev-${idx}`}>
                          <div style={{ padding:'8px 12px', borderBottom:'1px solid #eee', textAlign:'right' }}>
                            {ev.team==='home' ? (
                              <div style={{ display:'flex', flexDirection:'column', gap:'4px', alignItems:'flex-end' }}>
                                <span style={{ display:'inline-flex', alignItems:'center', gap:'4px' }}><strong>{ev.player}</strong>{' '}{getIcon(ev.type)}</span>
                                {ev.assister && <span style={{ fontSize:'0.85rem', color:'#6b7280', display:'inline-flex', alignItems:'center', gap:'4px' }}><Target size={16} weight="bold" color="#6b7280" /> {ev.assister}</span>}
                              </div>
                            ) : null}
                          </div>
                          <div style={{ padding:'8px 0', borderBottom:'1px solid #eee', textAlign:'center', color:'#111827', fontWeight:700 }}>{ev.minute}'</div>
                          <div style={{ padding:'8px 12px', borderBottom:'1px solid #eee' }}>
                            {ev.team==='away' ? (
                              <div style={{ display:'flex', flexDirection:'column', gap:'4px', alignItems:'flex-start' }}>
                                <span style={{ display:'inline-flex', alignItems:'center', gap:'4px' }}>{getIcon(ev.type)}{' '}<strong>{ev.player}</strong></span>
                                {ev.assister && <span style={{ fontSize:'0.85rem', color:'#6b7280', display:'inline-flex', alignItems:'center', gap:'4px' }}><Target size={16} weight="bold" color="#6b7280" /> {ev.assister}</span>}
                              </div>
                            ) : null}
                          </div>
                        </React.Fragment>
                      );
                    }
                    return (
                      <React.Fragment key={`ev-${idx}`}>
                        <div style={{ padding:'8px 12px', borderBottom:'1px solid #eee', textAlign:'right' }}>
                          {ev.team==='home' ? (<span style={{ display:'inline-flex', alignItems:'center', gap:'4px' }}><strong>{ev.player}</strong>{' '}{getIcon(ev.type)}</span>) : null}
                        </div>
                        <div style={{ padding:'8px 0', borderBottom:'1px solid #eee', textAlign:'center', color:'#111827', fontWeight:700 }}>{ev.minute}'</div>
                        <div style={{ padding:'8px 12px', borderBottom:'1px solid #eee' }}>
                          {ev.team==='away' ? (<span style={{ display:'inline-flex', alignItems:'center', gap:'4px' }}>{getIcon(ev.type)}{' '}<strong>{ev.player}</strong></span>) : null}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 12px', color:'#6b7280' }}>
                  <div>{home}</div>
                  <div>{away}</div>
                </div>
              </div>
            ) : (
              <div style={{ color:'#6b7280' }}>Belum ada event.</div>
            )}
          </div>
        ) : tab==='stats' ? (
          <div>
            <h4 style={{ marginTop: 0 }}>Statistik Pertandingan</h4>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 120px 1fr', gap:'8px', alignItems:'center', background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:12 }}>
              {[{k:'shots', l:'Tembakan'},{k:'shotsOnTarget', l:'Tepat Sasaran'},{k:'corners', l:'Sepak Pojok'},{k:'offsides', l:'Offside'},{k:'fouls', l:'Pelanggaran'},{k:'yellows', l:'Kartu Kuning'},{k:'reds', l:'Kartu Merah'}].map((row, idx)=> (
                <React.Fragment key={`st-${idx}`}>
                  <div style={{ padding:'10px 12px', textAlign:'right' }}>{stats.home[row.k]}</div>
                  <div style={{ padding:'10px 12px', textAlign:'center', color:'#6b7280' }}>{row.l}</div>
                  <div style={{ padding:'10px 12px' }}>{stats.away[row.k]}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h4 style={{ marginTop: 0 }}>Lineup & Formasi</h4>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(340px, 1fr))', gap:'24px', alignItems:'start' }}>
              <div style={{ background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:12, padding:'12px 16px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px', gap:'8px', borderBottom:'1px solid #e5e7eb', paddingBottom:'8px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <img src={homeLogo} alt={`${home} logo`} width={20} height={20} style={{ objectFit:'contain' }} onError={(e)=>{ e.currentTarget.style.visibility='hidden'; }} />
                    <div style={{ fontWeight:700 }}>{home}</div>
                  </div>
                  {homeFormation && <div style={{ color:'#6b7280' }}>Formasi: {homeFormation}</div>}
                </div>
                <ol style={{ paddingLeft:'20px', margin:0 }}>
                  {homeLineup.length>0 ? homeLineup.map((p, idx)=> {
                    const annots = playerAnnotations[p.name] || [];
                    const subOut = playerStats[p.name]?.subOut;
                    return (
                      <li key={`h-${idx}`} style={{ marginBottom:'6px', lineHeight:1.5 }}>
                        <span 
                          style={{ 
                            display:'inline-flex', 
                            alignItems:'center', 
                            gap:'4px'
                          }} 
                        >
                          <span 
                            style={{ 
                              cursor:'pointer',
                              color:'#111827',
                              padding:'2px 4px',
                              borderRadius:'4px',
                              transition:'background-color 0.2s'
                            }}
                            onClick={(e)=> {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Klik pemain:', p.name, 'selectedPlayer:', selectedPlayer);
                              setSelectedPlayer(selectedPlayer===p.name ? null : p.name);
                            }}
                            onMouseEnter={(e)=> e.currentTarget.style.background='#e0e7ff'}
                            onMouseLeave={(e)=> e.currentTarget.style.background='transparent'}
                            title="Klik untuk melihat statistik pemain"
                          >
                            {p.name}
                          </span>
                          {p.pos ? ` (${p.pos})` : ''}
                          {annots.length > 0 && (
                            <span style={{ marginLeft:'6px', fontSize:'0.85rem' }}>
                              {annots.map((annot, aIdx) => {
                                if(typeof annot === 'object') {
                                  if(annot.type === 'goal') return <span key={aIdx} style={{ marginLeft:'4px', display:'inline-flex', alignItems:'center', gap:'2px' }}><SoccerBall size={14} weight="fill" color="#059669" /> {annot.minute}'</span>;
                                  if(annot.type === 'yellow') return <span key={aIdx} style={{ marginLeft:'4px', display:'inline-flex', alignItems:'center', gap:'2px' }}><Rectangle size={14} weight="fill" color="#f59e0b" /> {annot.minute}'</span>;
                                  if(annot.type === 'red') return <span key={aIdx} style={{ marginLeft:'4px', display:'inline-flex', alignItems:'center', gap:'2px' }}><Rectangle size={14} weight="fill" color="#dc2626" /> {annot.minute}'</span>;
                                  if(annot.type === 'subOut') return <span key={aIdx} style={{ color:'#dc2626', marginLeft:'4px', fontWeight:600 }}>OUT {annot.minute}'</span>;
                                  if(annot.type === 'subIn') return <span key={aIdx} style={{ color:'#059669', marginLeft:'4px', fontWeight:600 }}>IN {annot.minute}'</span>;
                                }
                                return null;
                              })}
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  }) : <li>Lineup tidak tersedia.</li>}
                </ol>
                {homeSubs.length>0 && (
                  <div style={{ marginTop:'10px', borderTop:'1px dashed #d1d5db', paddingTop:'8px' }}>
                    <div style={{ fontWeight:600, marginBottom:'6px' }}>Subs</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                      {homeSubs.map((p, idx)=> {
                        const annots = playerAnnotations[p.name] || [];
                        return (
                          <span 
                            key={`hs-${idx}`} 
                            style={{ 
                              display:'inline-flex', 
                              alignItems:'center', 
                              gap:'4px'
                            }}
                          >
                            <span style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:999, padding:'4px 10px', fontSize:'0.9rem', display:'inline-block' }}>
                              <span 
                                style={{ 
                                  cursor:'pointer',
                                  color:'#1e40af',
                                  padding:'2px 4px',
                                  borderRadius:'4px',
                                  transition:'background-color 0.2s'
                                }}
                                onClick={(e)=> {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('Klik pemain:', p.name, 'selectedPlayer:', selectedPlayer);
                                  setSelectedPlayer(selectedPlayer===p.name ? null : p.name);
                                }}
                                onMouseEnter={(e)=> e.currentTarget.style.background='#e0e7ff'}
                                onMouseLeave={(e)=> e.currentTarget.style.background='transparent'}
                                title="Klik untuk melihat statistik pemain"
                              >
                                {p.name}
                              </span>{p.pos ? ` (${p.pos})` : ''}
                              {annots.length > 0 && (
                                <span style={{ marginLeft:'4px', fontSize:'0.85rem' }}>
                                  {annots.map((annot, aIdx) => {
                                    if(typeof annot === 'object') {
                                      if(annot.type === 'goal') return <span key={aIdx} style={{ marginLeft:'4px' }}>⚽ {annot.minute}'</span>;
                                      if(annot.type === 'assist') return <span key={aIdx} style={{ marginLeft:'4px' }}>🎯 {annot.minute}'</span>;
                                      if(annot.type === 'yellow') return <span key={aIdx} style={{ marginLeft:'4px' }}>🟨 {annot.minute}'</span>;
                                      if(annot.type === 'red') return <span key={aIdx} style={{ marginLeft:'4px' }}>🟥 {annot.minute}'</span>;
                                      if(annot.type === 'subOut') return <span key={aIdx} style={{ color:'#dc2626', marginLeft:'4px', fontWeight:600 }}>OUT {annot.minute}'</span>;
                                      if(annot.type === 'subIn') return <span key={aIdx} style={{ color:'#059669', marginLeft:'4px', fontWeight:600 }}>IN {annot.minute}'</span>;
                                    }
                                    return null;
                                  })}
                                </span>
                              )}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:12, padding:'12px 16px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px', gap:'8px', borderBottom:'1px solid #e5e7eb', paddingBottom:'8px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <img src={awayLogo} alt={`${away} logo`} width={20} height={20} style={{ objectFit:'contain' }} onError={(e)=>{ e.currentTarget.style.visibility='hidden'; }} />
                    <div style={{ fontWeight:700 }}>{away}</div>
                  </div>
                  {awayFormation && <div style={{ color:'#6b7280' }}>Formasi: {awayFormation}</div>}
                </div>
                <ol style={{ paddingLeft:'20px', margin:0 }}>
                  {awayLineup.length>0 ? awayLineup.map((p, idx)=> {
                    const annots = playerAnnotations[p.name] || [];
                    const subOut = playerStats[p.name]?.subOut;
                    return (
                      <li key={`a-${idx}`} style={{ marginBottom:'6px', lineHeight:1.5 }}>
                        <span 
                          style={{ 
                            display:'inline-flex', 
                            alignItems:'center', 
                            gap:'4px'
                          }} 
                        >
                          <span 
                            style={{ 
                              cursor:'pointer',
                              color:'#111827',
                              padding:'2px 4px',
                              borderRadius:'4px',
                              transition:'background-color 0.2s'
                            }}
                            onClick={(e)=> {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Klik pemain:', p.name, 'selectedPlayer:', selectedPlayer);
                              setSelectedPlayer(selectedPlayer===p.name ? null : p.name);
                            }}
                            onMouseEnter={(e)=> e.currentTarget.style.background='#e0e7ff'}
                            onMouseLeave={(e)=> e.currentTarget.style.background='transparent'}
                            title="Klik untuk melihat statistik pemain"
                          >
                            {p.name}
                          </span>
                          {p.pos ? ` (${p.pos})` : ''}
                          {annots.length > 0 && (
                            <span style={{ marginLeft:'6px', fontSize:'0.85rem' }}>
                              {annots.map((annot, aIdx) => {
                                if(typeof annot === 'object') {
                                  if(annot.type === 'goal') return <span key={aIdx} style={{ marginLeft:'4px', display:'inline-flex', alignItems:'center', gap:'2px' }}><SoccerBall size={14} weight="fill" color="#059669" /> {annot.minute}'</span>;
                                  if(annot.type === 'yellow') return <span key={aIdx} style={{ marginLeft:'4px', display:'inline-flex', alignItems:'center', gap:'2px' }}><Rectangle size={14} weight="fill" color="#f59e0b" /> {annot.minute}'</span>;
                                  if(annot.type === 'red') return <span key={aIdx} style={{ marginLeft:'4px', display:'inline-flex', alignItems:'center', gap:'2px' }}><Rectangle size={14} weight="fill" color="#dc2626" /> {annot.minute}'</span>;
                                  if(annot.type === 'subOut') return <span key={aIdx} style={{ color:'#dc2626', marginLeft:'4px', fontWeight:600 }}>OUT {annot.minute}'</span>;
                                  if(annot.type === 'subIn') return <span key={aIdx} style={{ color:'#059669', marginLeft:'4px', fontWeight:600 }}>IN {annot.minute}'</span>;
                                }
                                return null;
                              })}
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  }) : <li>Lineup tidak tersedia.</li>}
                </ol>
                {awaySubs.length>0 && (
                  <div style={{ marginTop:'10px', borderTop:'1px dashed #d1d5db', paddingTop:'8px' }}>
                    <div style={{ fontWeight:600, marginBottom:'6px' }}>Subs</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                      {awaySubs.map((p, idx)=> {
                        const annots = playerAnnotations[p.name] || [];
                        return (
                          <span 
                            key={`as-${idx}`} 
                            style={{ 
                              display:'inline-flex', 
                              alignItems:'center', 
                              gap:'4px'
                            }}
                          >
                            <span style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:999, padding:'4px 10px', fontSize:'0.9rem', display:'inline-block' }}>
                              <span 
                                style={{ 
                                  cursor:'pointer',
                                  color:'#1e40af',
                                  padding:'2px 4px',
                                  borderRadius:'4px',
                                  transition:'background-color 0.2s'
                                }}
                                onClick={(e)=> {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('Klik pemain:', p.name, 'selectedPlayer:', selectedPlayer);
                                  setSelectedPlayer(selectedPlayer===p.name ? null : p.name);
                                }}
                                onMouseEnter={(e)=> e.currentTarget.style.background='#e0e7ff'}
                                onMouseLeave={(e)=> e.currentTarget.style.background='transparent'}
                                title="Klik untuk melihat statistik pemain"
                              >
                                {p.name}
                              </span>{p.pos ? ` (${p.pos})` : ''}
                              {annots.length > 0 && (
                                <span style={{ marginLeft:'4px', fontSize:'0.85rem' }}>
                                  {annots.map((annot, aIdx) => {
                                    if(typeof annot === 'object') {
                                      if(annot.type === 'goal') return <span key={aIdx} style={{ marginLeft:'4px' }}>⚽ {annot.minute}'</span>;
                                      if(annot.type === 'assist') return <span key={aIdx} style={{ marginLeft:'4px' }}>🎯 {annot.minute}'</span>;
                                      if(annot.type === 'yellow') return <span key={aIdx} style={{ marginLeft:'4px' }}>🟨 {annot.minute}'</span>;
                                      if(annot.type === 'red') return <span key={aIdx} style={{ marginLeft:'4px' }}>🟥 {annot.minute}'</span>;
                                      if(annot.type === 'subOut') return <span key={aIdx} style={{ color:'#dc2626', marginLeft:'4px', fontWeight:600 }}>OUT {annot.minute}'</span>;
                                      if(annot.type === 'subIn') return <span key={aIdx} style={{ color:'#059669', marginLeft:'4px', fontWeight:600 }}>IN {annot.minute}'</span>;
                                    }
                                    return null;
                                  })}
                                </span>
                              )}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedPlayer && (
        <div 
          style={{
            position:'fixed',
            top:0,
            left:0,
            right:0,
            bottom:0,
            zIndex:9999,
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            padding:'20px',
            background:'rgba(0, 0, 0, 0.5)',
            backdropFilter:'blur(8px)',
            WebkitBackdropFilter:'blur(8px)',
            animation:'fadeIn 0.2s ease-out'
          }}
          onClick={(e)=> {
            if(e.target === e.currentTarget) setSelectedPlayer(null);
          }}
        >
          <div 
            ref={statsRef}
            className="fixture-group" 
            style={{ 
              maxWidth:'600px',
              width:'100%',
              background:'#fff', 
              padding:'24px',
              borderRadius:16,
              boxShadow:'0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              animation:'slideUp 0.3s ease-out',
              maxHeight:'90vh',
              overflowY:'auto'
            }}
            onClick={(e)=> e.stopPropagation()}
          >
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <Link 
                to={`/player/${encodeURIComponent(selectedPlayer)}`}
                style={{ textDecoration:'none', color:'inherit' }}
                onClick={(e)=> {
                  e.stopPropagation();
                  setSelectedPlayer(null);
                }}
              >
                <h3 style={{ margin:0, fontSize:'1.5rem', fontWeight:700, cursor:'pointer', transition:'color 0.2s' }} onMouseEnter={(e)=> e.currentTarget.style.color='#3b82f6'} onMouseLeave={(e)=> e.currentTarget.style.color='inherit'}>{selectedPlayer}</h3>
              </Link>
              <button 
                className="btn" 
                onClick={()=> setSelectedPlayer(null)} 
                style={{ 
                  padding:0,
                  background:'transparent',
                  border:'none',
                  cursor:'pointer',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  width:'24px',
                  height:'24px'
                }}
              >
                <X size={20} weight="bold" color="#111827" />
              </button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:'16px' }}>
              <div style={{ textAlign:'center', padding:'16px', background:'#f9fafb', borderRadius:12, border:'1px solid #e5e7eb' }}>
                <div style={{ fontSize:'0.9rem', color:'#6b7280', marginBottom:'8px', fontWeight:600 }}>Gol</div>
                <div style={{ fontSize:'2rem', fontWeight:700, color:'#111827' }}>{playerStats[selectedPlayer]?.goals || 0}</div>
              </div>
              <div style={{ textAlign:'center', padding:'16px', background:'#f9fafb', borderRadius:12, border:'1px solid #e5e7eb' }}>
                <div style={{ fontSize:'0.9rem', color:'#6b7280', marginBottom:'8px', fontWeight:600 }}>Assist</div>
                <div style={{ fontSize:'2rem', fontWeight:700, color:'#111827' }}>{playerStats[selectedPlayer]?.assists || 0}</div>
              </div>
              <div style={{ textAlign:'center', padding:'16px', background:'#f9fafb', borderRadius:12, border:'1px solid #e5e7eb' }}>
                <div style={{ fontSize:'0.9rem', color:'#6b7280', marginBottom:'8px', fontWeight:600 }}>Kartu Kuning</div>
                <div style={{ fontSize:'2rem', fontWeight:700, color:'#111827' }}>{playerStats[selectedPlayer]?.yellows || 0}</div>
              </div>
              <div style={{ textAlign:'center', padding:'16px', background:'#f9fafb', borderRadius:12, border:'1px solid #e5e7eb' }}>
                <div style={{ fontSize:'0.9rem', color:'#6b7280', marginBottom:'8px', fontWeight:600 }}>Kartu Merah</div>
                <div style={{ fontSize:'2rem', fontWeight:700, color:'#111827' }}>{playerStats[selectedPlayer]?.reds || 0}</div>
              </div>
              {playerStats[selectedPlayer]?.subOut && (
                <div style={{ textAlign:'center', padding:'16px', background:'#f9fafb', borderRadius:12, border:'1px solid #e5e7eb' }}>
                  <div style={{ fontSize:'0.9rem', color:'#6b7280', marginBottom:'8px', fontWeight:600 }}>Substitusi Out</div>
                  <div style={{ fontSize:'2rem', fontWeight:700, color:'#dc2626' }}>{playerStats[selectedPlayer].subOut}'</div>
                </div>
              )}
              {playerStats[selectedPlayer]?.subIn && (
                <div style={{ textAlign:'center', padding:'16px', background:'#f9fafb', borderRadius:12, border:'1px solid #e5e7eb' }}>
                  <div style={{ fontSize:'0.9rem', color:'#6b7280', marginBottom:'8px', fontWeight:600 }}>Substitusi In</div>
                  <div style={{ fontSize:'2rem', fontWeight:700, color:'#059669' }}>{playerStats[selectedPlayer].subIn}'</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}


