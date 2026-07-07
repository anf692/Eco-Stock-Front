import React from 'react';
import { useAuth } from '../../contexte/ContexteAuth';
import { LogOut, User, Menu } from 'lucide-react';
import { Bouton } from '../Commun/Bouton';
import '../../styles/Disposition.css';


// Composant d'en-tête principal réactif avec burger menu mobile.
export const EnTete = ({ titre, surClicMenu }) => {
  const { utilisateur, deconnexion, estAuthentifie } = useAuth();

  return (
    <header className="header">
      <div className="header-titre-conteneur">
        {/* Menu Hamburger visible uniquement sur mobile */}
        <button 
          onClick={surClicMenu} 
          className="header-bouton-menu"
          aria-label="Ouvrir le menu"
        >
          <Menu size={22} />
        </button>
        <h2 className="header-titre">{titre}</h2>
      </div>
      
      <div className="header-info-utilisateur">
        {estAuthentifie && (
          <>
            <div className="header-profil">
              <div className="header-avatar">
                <User size={16} />
              </div>
              <span>{utilisateur}</span>
            </div>
            
            <Bouton 
              variante="contour" 
              onClick={deconnexion} 
              style={{ padding: '6px 12px', fontSize: '13px' }}
            >
              <LogOut size={14} />
              Déconnexion
            </Bouton>
          </>
        )}
      </div>
    </header>
  );
};


