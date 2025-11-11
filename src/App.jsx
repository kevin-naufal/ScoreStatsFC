import React from 'react';
import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Leagues from './pages/Leagues.jsx';
import Players from './pages/Players.jsx';
import Clubs from './pages/Clubs.jsx';
import Transfers from './pages/Transfers.jsx';
import Search from './pages/Search.jsx';
import Match from './pages/Match.jsx';
import Team from './pages/Team.jsx';
import Player from './pages/Player.jsx';
import League from './pages/League.jsx';
import { loadCsv } from './utils/csv.js';
import { normalizeText, nameMatchScore } from './utils/text.js';
import { SoccerBall, MagnifyingGlass, TwitterLogo, FacebookLogo, InstagramLogo } from '@phosphor-icons/react';

export default function App() {
  const navigate = useNavigate();
  const [dataset, setDataset] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [openResults, setOpenResults] = React.useState(false);
  const resultsRef = React.useRef(null);

  React.useEffect(()=>{
    (async()=>{
      try{
        let data;
        try { data = await loadCsv('/data/players_top5_2324.csv'); }
        catch { data = []; }
        setDataset(Array.isArray(data) ? data : []);
      } catch { setDataset([]); }
    })();
  },[]);

  const norm = normalizeText;
  const uniqueBy = (arr, key)=>{
    const seen = new Set();
    const out = [];
    for(const it of arr){ if(!seen.has(key(it))){ seen.add(key(it)); out.push(it); } }
    return out;
  };

  const computedResults = React.useMemo(()=>{
    if(!searchQuery || searchQuery.length < 3) return { players: [], teams: [], leagues: [] };
    const q = norm(searchQuery);
    const rows = dataset;
    const getName = r => r.name || r.Player || r.player || r.player_name || r.FullName || r.full_name;
    const getTeam = r => r.team || r.Team || r.club || r.Club || r.Squad;
    const getLeague = r => r.league || r.League || r.competition || r.Competition || r.Comp;

    const playerCandidates = rows
      .map(r=>{
        const title = getName(r);
        const score = nameMatchScore(title, searchQuery);
        return { type:'player', id: encodeURIComponent(title), title, subtitle: getTeam(r)||'—', to:`/player/${encodeURIComponent(title)}`, score };
      })
      .filter(it => it.score > 0);
    const playerHits = uniqueBy(playerCandidates, it=>`player:${norm(it.title)}`)
      .sort((a,b)=> b.score - a.score || a.title.localeCompare(b.title))
      .slice(0,5);

    const teamHits = uniqueBy(
      rows.filter(r => norm(getTeam(r)).includes(q)).map(r=>({
        type:'team',
        id: encodeURIComponent(getTeam(r)),
        title: getTeam(r),
        subtitle: 'Klub',
        to: `/team/${encodeURIComponent(getTeam(r))}`
      })),
      it=>`team:${it.title}`
    ).slice(0,5);

    const leagueHits = uniqueBy(
      rows.filter(r => norm(getLeague(r)).includes(q)).map(r=>({
        type:'league',
        id: encodeURIComponent(getLeague(r)),
        title: getLeague(r),
        subtitle: 'Liga',
        to: `/league/${encodeURIComponent(getLeague(r))}`
      })),
      it=>`league:${it.title}`
    ).slice(0,5);

    return { players: playerHits, teams: teamHits, leagues: leagueHits };
  },[searchQuery, dataset]);

  React.useEffect(()=>{
    function onClickOutside(e){
      if(resultsRef.current && !resultsRef.current.contains(e.target)) setOpenResults(false);
    }
    document.addEventListener('click', onClickOutside);
    return ()=> document.removeEventListener('click', onClickOutside);
  },[]);
  return (
    <div>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <Link to="/" className="logo-link">
                <h1 style={{ display:'flex', alignItems:'center', gap:'8px' }}><SoccerBall size={24} weight="fill" /> ScoreStatsFC</h1>
              </Link>
            </div>
            <nav className="nav">
              <NavLink to="/players" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>Player Performance</NavLink>
              <NavLink to="/leagues" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>Tabel Liga</NavLink>
              <NavLink to="/transfers" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>Transfer</NavLink>
            </nav>
            <div className="header-actions">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Cari pemain, klub, liga..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e)=>{ setSearchQuery(e.currentTarget.value); setOpenResults(true); }}
                  onFocus={()=> setOpenResults(true)}
                  onKeyDown={(e)=>{
                    if(e.key==='Enter'){
                      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                      setOpenResults(false);
                    }
                  }}
                />
                <MagnifyingGlass size={18} weight="regular" className="search-icon" style={{ color:'#6b7280', pointerEvents:'none' }} />
                {openResults && searchQuery.length>=3 && (computedResults.players.length+computedResults.teams.length+computedResults.leagues.length)>0 && (
                  <div className="search-results open" ref={resultsRef}>
                    {computedResults.players.length>0 && (
                      <div className="search-result-item" style={{cursor:'default', background:'#f9fafb'}}>
                        <div style={{fontWeight:700, color:'#111827'}}>Pemain</div>
                      </div>
                    )}
                    {computedResults.players.map((r, idx)=> (
                      <div key={`player-${idx}-${r.id}`} className="search-result-item" onClick={()=>{ navigate(r.to); setOpenResults(false); setSearchQuery(''); }}>
                        <div style={{fontWeight:600, color:'#1f2937'}}>{r.title}</div>
                        <div style={{color:'#6b7280', fontSize:'0.85rem'}}>{r.subtitle}</div>
                      </div>
                    ))}
                    {computedResults.teams.length>0 && (
                      <div className="search-result-item" style={{cursor:'default', background:'#f9fafb'}}>
                        <div style={{fontWeight:700, color:'#111827'}}>Klub</div>
                      </div>
                    )}
                    {computedResults.teams.map((r, idx)=> (
                      <div key={`team-${idx}-${r.id}`} className="search-result-item" onClick={()=>{ navigate(r.to); setOpenResults(false); setSearchQuery(''); }}>
                        <div style={{fontWeight:600, color:'#1f2937'}}>{r.title}</div>
                        <div style={{color:'#6b7280', fontSize:'0.85rem'}}>{r.subtitle}</div>
                      </div>
                    ))}
                    {computedResults.leagues.length>0 && (
                      <div className="search-result-item" style={{cursor:'default', background:'#f9fafb'}}>
                        <div style={{fontWeight:700, color:'#111827'}}>Liga</div>
                      </div>
                    )}
                    {computedResults.leagues.map((r, idx)=> (
                      <div key={`league-${idx}-${r.id}`} className="search-result-item" onClick={()=>{ navigate(r.to); setOpenResults(false); setSearchQuery(''); }}>
                        <div style={{fontWeight:600, color:'#1f2937'}}>{r.title}</div>
                        <div style={{color:'#6b7280', fontSize:'0.85rem'}}>{r.subtitle}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/leagues" element={<Leagues />} />
            <Route path="/players" element={<Players />} />
            <Route path="/clubs" element={<Clubs />} />
            <Route path="/transfers" element={<Transfers />} />
            <Route path="/search" element={<Search />} />
            <Route path="/match/:id" element={<Match />} />
            <Route path="/team/:id" element={<Team />} />
            <Route path="/league/:id" element={<League />} />
            <Route path="/player/:id" element={<Player />} />
          </Routes>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>ScoreStatsFC</h3>
              <p>Platform terlengkap untuk data sepak bola Eropa</p>
            </div>
            <div className="footer-section">
              <h4>Liga</h4>
              <ul>
                <li><Link to="/leagues">Premier League</Link></li>
                <li><Link to="/leagues">Serie A</Link></li>
                <li><Link to="/leagues">Bundesliga</Link></li>
                <li><Link to="/leagues">La Liga</Link></li>
                <li><Link to="/leagues">Ligue 1</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Fitur</h4>
              <ul>
                <li><Link to="/">Live Score</Link></li>
                <li><Link to="/players">Statistik</Link></li>
                <li><Link to="/transfers">Transfer</Link></li>
                <li><Link to="/leagues">Klasemen</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Kontak</h4>
              <p>support@scorestatsfc.com</p>
              <div className="social-links" style={{ display:'flex', gap:'12px', marginTop:'8px' }}>
                <a href="#" style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:'36px', height:'36px', borderRadius:'50%', background:'#1da1f2', color:'#fff' }}><TwitterLogo size={20} weight="fill" /></a>
                <a href="#" style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:'36px', height:'36px', borderRadius:'50%', background:'#1877f2', color:'#fff' }}><FacebookLogo size={20} weight="fill" /></a>
                <a href="#" style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:'36px', height:'36px', borderRadius:'50%', background:'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)', color:'#fff' }}><InstagramLogo size={20} weight="fill" /></a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 ScoreStatsFC. Dibuat oleh Kevin Naufal Aryanto & Reiki Putra Darmawan.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


