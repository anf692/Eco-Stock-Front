/*
  Centralise toutes les communications avec le backend Django.
    Gère l'authentification JWT (stockage et rafraîchissement automatique du token).
*/

const BASE_URL = import.meta.env.VITE_API_URL;


//   Fonction utilitaire pour récupérer les headers par défaut.
//    Ajoute automatiquement le token JWT s'il est présent.
  
function obtenirHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('eco_stock_access');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Fonction générique pour effectuer des requêtes HTTP.
// Gère automatiquement le rafraîchissement du token en cas d'erreur 401 (non autorisé).

async function requete(url, options = {}) {
  // Fusionne les options et les headers par défaut
  options.headers = {
    ...obtenirHeaders(),
    ...options.headers,
  };

  let reponse = await fetch(url, options);

  // Si le token a expiré (erreur 401), on tente de le rafraîchir
  if (reponse.status === 401) {
    const tokenRafraichissement = localStorage.getItem('eco_stock_refresh');
    if (tokenRafraichissement) {
      try {
        const estRafraichi = await rafraichirToken(tokenRafraichissement);
        if (estRafraichi) {
          // On réessaie la requête originale avec le nouveau token
          options.headers = {
            ...obtenirHeaders(),
            ...options.headers,
          };
          reponse = await fetch(url, options);
        }
      } catch (erreur) {
        console.error('Échec du rafraîchissement automatique du token :', erreur);
      }
    }
  }

  return reponse;
}


// Rafraîchit le jeton d'accès (Access Token) à l'aide du Refresh Token.
async function rafraichirToken(refresh) {
  try {
    const reponse = await fetch(`${BASE_URL}/api/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (reponse.ok) {
      const donnees = await reponse.json();
      localStorage.setItem('eco_stock_access', donnees.access); // Met à jour le token d'accès dans le localStorage
      return true;
    }
  } catch (erreur) {
    console.error('Erreur réseau lors du rafraîchissement :', erreur);
  }
  
  // Si le rafraîchissement échoue, on déconnecte l'utilisateur
  deconnexion();
  return false;
}


// Se déconnecter en vidant le localStorage.
export function deconnexion() {
  localStorage.removeItem('eco_stock_access');
  localStorage.removeItem('eco_stock_refresh');
  localStorage.removeItem('eco_stock_utilisateur');
}


// Service d'API exportant toutes les fonctions de communication.
export const clientApi = {
  // --- AUTHENTIFICATION ---
  

  // Connecte l'utilisateur avec son nom d'utilisateur et son mot de passe.
  connexion: async (username, password) => {
    const reponse = await fetch(`${BASE_URL}/api/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!reponse.ok) {
      const erreur = await reponse.json();
      throw new Error(erreur.detail || 'Identifiants incorrects');
    }

    const donnees = await reponse.json();
    localStorage.setItem('eco_stock_access', donnees.access);
    localStorage.setItem('eco_stock_refresh', donnees.refresh);
    localStorage.setItem('eco_stock_utilisateur', username);
    return username;
  },

}

