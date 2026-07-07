import React from 'react';
import { Edit, Trash2, ArrowLeftRight } from 'lucide-react';
import { Bouton } from '../common/Bouton';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Composants.css';


// Formate une date au format lisible JJ/MM/AAAA.
const formaterDate = (dateChaine) => {
  if (!dateChaine) return '-';
  const [annee, mois, jour] = dateChaine.split('-');
  return `${jour}/${mois}/${annee}`;
};


// Composant de ligne pour le tableau de produits.
export const LigneProduit = ({ 
  produit, 
  nomEntrepot, 
  surModifier, 
  surSupprimer, 
  surDeplacer 
}) => {
  const { estAuthentifie } = useAuth();

  return (
    <tr className="table-tr">
      <td className="table-td table-td-gras">{produit.id}</td>
      <td className="table-td">{produit.nomp}</td>
      <td className="table-td">{nomEntrepot || `Entrepôt (ID: ${produit.entrepot})`}</td>
      <td className="table-td">{produit.quantite}</td>
      <td className="table-td">{formaterDate(produit.date_expiration)}</td>
      <td className="table-td">
        <span className={`badge-statut badge-${produit.status}`}>
          {produit.status === 'disponible' ? 'Disponible' :
           produit.status === 'reserve' ? 'Réservé' :
           produit.status === 'perime' ? 'Périmé' : produit.status}
        </span>
      </td>
      
      <td className="table-td text-droite">
        <div className="actions-conteneur">
          {/* Bouton de transfert */}
          <Bouton 
            variante="contour" 
            title="Transférer le produit"
            onClick={() => surDeplacer(produit)}
            className="btn-action-icone"
          >
            <ArrowLeftRight size={14} color="#3C4A42" />
          </Bouton>

          {/* Actions d'édition et suppression réservées aux personnes authentifiées */}
          {estAuthentifie && (
            <>
              <Bouton 
                variante="contour" 
                title="Modifier"
                onClick={() => surModifier(produit)}
                className="btn-action-icone"
              >
                <Edit size={14} color="#3A5B22" />
              </Bouton>
              
              <Bouton 
                variante="contour" 
                title="Supprimer"
                onClick={() => surSupprimer(produit.id)}
                className="btn-action-icone"
              >
                <Trash2 size={14} color="#991B1B" />
              </Bouton>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};
