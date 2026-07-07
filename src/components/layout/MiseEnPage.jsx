import React, { useState } from 'react';
import { BarreLaterale } from './BarreLaterale';
import { EnTete } from './EnTete';
import '../../styles/Disposition.css';

/*
 Composant de Mise en page général (Layout) qui centralise la réactivité
 et évite la duplication de code dans les différentes pages.
 Utilise des classes CSS standards.
 */

export const MiseEnPage = ({ children, titre }) => {
  const [sidebarOuverte, setSidebarOuverte] = useState(false);

  return (
    <div className="page-conteneur">
      {/* Barre latérale réactive */}
      <BarreLaterale 
        $ouverte={sidebarOuverte} 
        surFermeture={() => setSidebarOuverte(false)} 
      />

      {/* Overlay mobile en cas d'ouverture */}
      {sidebarOuverte && (
        <div className="page-overlay" onClick={() => setSidebarOuverte(false)} />
      )}

      <div className="page-zone-contenu">
        {/* En-tête avec bouton menu hamburger sur mobile */}
        <EnTete 
          titre={titre} 
          surClicMenu={() => setSidebarOuverte(true)} 
        />
        
        {/* Corps principal de la page */}
        <main className="page-principal">
          {children}
        </main>
      </div>
    </div>
  );
};


