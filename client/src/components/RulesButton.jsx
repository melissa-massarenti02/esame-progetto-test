// --- src/components/RulesButton.jsx ---
import { useState } from 'react';

export default function RulesButton() {
  const [showRules, setShowRules] = useState(false);

  return (
    <>
      <button className="rules-button" onClick={() => setShowRules(!showRules)}>
        {showRules ? '✕ REGOLE DEL GIOCO' : '☰ REGOLE DEL GIOCO'}
      </button>

      {showRules && (
        <div className="rules-overlay">
          <h4 className="rules-title">Regolamento Rapido</h4>
          <ul className="rules-list">
            <li><strong>Live Path:</strong> Valida le sequenze delle stazioni.</li>
            <li><strong>Event Deck:</strong> Gestisci gli imprevisti (+2 / -1).</li>
            <li><strong>Countdown:</strong> Agisci entro 90 secondi.</li>
          </ul>
        </div>
      )}
    </>
  );
}