import React from 'react';

export default function Transfers(){
  const transfers = [
    { id:1, player:'Jude Bellingham', from:'Dortmund', to:'Real Madrid', fee:103 },
    { id:2, player:'Harry Kane', from:'Tottenham', to:'Bayern Munich', fee:100 },
  ];
  return (
    <div id="transfersPage" className="page">
      <h2>Transfer Terbaru</h2>
      <div className="transfers-list">
        {transfers.map(t => (
          <div className="transfer-item" key={t.id}>
            <div className="transfer-info">
              <span className="transfer-player">{t.player}</span>
              <div className="transfer-clubs"><span>{t.from}</span><i className="fas fa-arrow-right"></i><span>{t.to}</span></div>
            </div>
            <div className="transfer-fee">€{t.fee}M</div>
          </div>
        ))}
      </div>
    </div>
  );
}


