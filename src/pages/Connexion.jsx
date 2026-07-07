import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Warehouse } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { Bouton } from '../components/common/Bouton';
import { Entree } from '../components/common/Entree';
import '../styles/Connexion.css';
import login from '../assets/login.jpeg';


// Page de connexion de l'application Eco-Stock.
export default function Connexion() {
  const [identifiant, setIdentifiant] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);
  
  const { connexion } = useAuth();
  const navigate = useNavigate();

  const gererSoumission = async (evenement) => {
    evenement.preventDefault();
    setErreur('');
    setChargement(true);

    try {
      await connexion(identifiant, motDePasse);
      navigate('/'); // Redirection vers le tableau de bord
    } catch (err) {
      setErreur(err.message || 'Impossible de se connecter. Vérifiez vos identifiants.');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="connexion-page">
      {/* Côté gauche : Formulaire de connexion */}
      <div className="zone-formulaire">
        <div className="connexion-cadre">
          <div className="connexion-logo">
            <div className="connexion-titre-conteneur">
              <Warehouse size={24} color="#3A5B22" />
              <h1 className="connexion-titre">Eco-Stock</h1>
            </div>
            <p className="connexion-soustitre">
              Veuillez vous identifier pour accéder à votre espace de gestion.
            </p>
          </div>

          {erreur && (
            <div className="connexion-erreur-alerte">
              <AlertCircle size={16} />
              <span>{erreur}</span>
            </div>
          )}

          <form className="connexion-form" onSubmit={gererSoumission}>
            <Entree
              label="Adresse Email ou username"
              icone={Mail}
              placeholder="nom@entreprise.com"
              value={identifiant}
              onChange={(e) => setIdentifiant(e.target.value)}
              required
            />

            <div>
              <div className="connexion-mdp-entete">
                <label className="champ-label">
                  Mot de passe
                </label>
                <a 
                  className="connexion-mdp-oublie"
                  href="#oublie" 
                  onClick={() => alert('Veuillez contacter votre administrateur pour réinitialiser votre mot de passe.')}
                >
                  Oublié ?
                </a>
              </div>
              <Entree
                icone={Lock}
                type="password"
                placeholder="••••••••"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                required
              />
            </div>

            <Bouton 
              type="submit" 
              variante="primaire" 
              pleineLargeur 
              disabled={chargement}
              className="btn-connexion"
            >
              {chargement ? 'Connexion...' : 'Se connecter'}
            </Bouton>
          </form>

          <div className="connexion-pied">
            <span>Besoin d'aide ? </span>
            <a className="connexion-lien-support" href="mailto:support@ecostock.com">
              Contacter le support
            </a>
          </div>
        </div>
      </div>

      {/* Côté droit : Image décorative */}
      <div className="zone-illustration">
        <img 
          className="image-illustration"
          src={login} 
          alt="Entrepôt éco-responsable" 
        />
      </div>
    </div>
  );
}


