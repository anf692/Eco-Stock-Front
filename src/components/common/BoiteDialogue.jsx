import React from 'react';
import { X } from 'lucide-react';
import '../../styles/Composants.css';


//Boîte de dialogue (Modale) réutilisable suivant SRP.
export const BoiteDialogue = ({
  estOuvert,
  surFermeture,
  titre,
  children,
  largeurMax = '500px'
}) => {
  if (!estOuvert) return null;

  // Fermer la modale en cliquant sur l'arrière-plan
  const gererClicArrierePlan = (evenement) => {
    if (evenement.target === evenement.currentTarget) {
      surFermeture();
    }
  };

  return (
    <div className="modale-arriere-plan" onClick={gererClicArrierePlan}>
      <div className="modale-cadre" style={{ maxWidth: largeurMax }}>
        <div className="modale-entete">
          <h3 className="modale-titre">{titre}</h3>
          
          <button 
            onClick={surFermeture} 
            className="modale-bouton-fermer"
            aria-label="Fermer la boîte de dialogue"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="modale-corps">
          {children}
        </div>
      </div>
    </div>
  );
};

