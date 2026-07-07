import React, { createContext, useState, useEffect, useContext } from 'react';
import { clientApi, deconnexion as apiDeconnexion } from '../services/clientApi';

// Création du contexte d'authentification
const ContexteAuth = createContext(null);


// Fournisseur d'authentification qui enveloppe l'application.
export const FournisseurAuth = ({ children }) => {
  const [utilisateur, setUtilisateur] = useState(null);
  const [estAuthentifie, setEstAuthentifie] = useState(false);
  const [chargement, setChargement] = useState(true);

  // Vérifie si une session utilisateur existe déjà au chargement de l'application
  useEffect(() => {
    const nomUtilisateur = localStorage.getItem('eco_stock_utilisateur');
    const token = localStorage.getItem('eco_stock_access');

    if (nomUtilisateur && token) {
      setUtilisateur(nomUtilisateur);
      setEstAuthentifie(true);
    }
    setChargement(false);
  }, []);


  //  Action de connexion utilisateur.
  const connexion = async (username, password) => {
    try {
      const nom = await clientApi.connexion(username, password);
      setUtilisateur(nom);
      setEstAuthentifie(true);
      return nom;
    } catch (erreur) {
      setUtilisateur(null);
      setEstAuthentifie(false);
      throw erreur; // Permet de remonter l'erreur au formulaire de connexion
    }
  };


  //  Action de déconnexion utilisateur.
  const deconnexion = () => {
    apiDeconnexion();
    setUtilisateur(null);
    setEstAuthentifie(false);
  };

  const valeur = {
    utilisateur,
    estAuthentifie,
    chargement,
    connexion,
    deconnexion,
  };

  return (
    <ContexteAuth.Provider value={valeur}>
      {!chargement && children}
    </ContexteAuth.Provider>
  );
};


//Hook personnalisé pour utiliser facilement l'authentification dans n'importe quel composant.
export const useAuth = () => {
  const contexte = useContext(ContexteAuth);
  if (!contexte) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un FournisseurAuth");
  }
  return contexte;
};


