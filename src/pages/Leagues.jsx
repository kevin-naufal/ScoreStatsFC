import React from 'react';
import { useNavigate } from 'react-router-dom';
import { mockData } from '../mockData.js';
import premierLogo from '../../england-premier-league-logo-on-transparent-background-free-vector.jpg';
import serieALogo from '../../Serie_A.svg.png';
import bundesLogo from '../../GERMAN-BUNDESLIGA-LOGO-VECTOR.jpg';
import laLigaLogo from '../../LaLiga-Logo.png';
import ligue1Logo from '../../Ligue1_logo.png';

export default function Leagues(){
  const navigate = useNavigate();
  return (
    <div id="leaguesPage" className="page">
      <h2>Liga Eropa</h2>
      <div className="leagues-grid">
        {Object.entries(mockData.leagues).map(([id, lg]) => (
          <div className="league-detail-card" key={id} style={{ cursor:'pointer' }} onClick={()=> navigate(`/league/${encodeURIComponent(id)}`)}>
            <div className="league-header" style={{ marginBottom: 0 }}>
              {(()=>{
                const local = {
                  premier: premierLogo,
                  'serie-a': serieALogo,
                  bundesliga: bundesLogo,
                  laliga: laLigaLogo,
                  ligue1: ligue1Logo,
                };
                const src = local[id] || lg.logo;
                return <img src={src} alt={lg.name} />;
              })()}
              <div>
                <h3>{lg.name}</h3>
                <p>{lg.country} • {lg.clubs} Klub</p>
              </div>
            </div>
            {/* Info detail dihilangkan sesuai permintaan: Pertandingan, Musim, dan tombol */}
          </div>
        ))}
      </div>
    </div>
  );
}


