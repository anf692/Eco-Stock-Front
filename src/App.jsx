import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FournisseurAuth, useAuth } from './context/AuthContext';
import Connexion from './pages/Connexion';
import TableauBord from './pages/TableauBord';
import Produits from './pages/Produits';


// Composant RouteProtegee : 
// Redirige l'utilisateur vers la page de connexion s'il n'est pas authentifié.

const RouteProtegee = ({ children }) => {
  const { estAuthentifie } = useAuth();

  if (!estAuthentifie) {
    // Redirection vers la page de connexion si la session n'est pas ouverte
    return <Navigate to="/connexion" replace />;
  }

  return children;
};


// Composant principal de l'application Eco-Stock.
// Configure le routage et le fournisseur de contexte d'authentification.
function App() {
  return (
    <FournisseurAuth>
      <BrowserRouter>
        <Routes>
          {/* Route publique : Connexion */}
          <Route path="/connexion" element={<Connexion />} />

          {/* Routes privées : Nécessitent d'être connecté */}
          <Route 
            path="/" 
            element={
              <RouteProtegee>
                <TableauBord />
              </RouteProtegee>
            } 
          />

          <Route 
            path="/produits" 
            element={
              <RouteProtegee>
                <Produits />
              </RouteProtegee>
            } 
          />
         
          {/* Redirection automatique pour toute route inconnue */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </FournisseurAuth>
  );
}

export default App;
