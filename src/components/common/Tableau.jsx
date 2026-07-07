import React from 'react';
import '../../styles/Composants.css';


//Composant de base de Tableau regroupant les styles fondamentaux.
export const Tableau = ({ colonnes, children }) => {
  return (
    <div className="table-conteneur">
      <table className="table-eco">
        <thead className="table-entete">
          <tr>
            {colonnes.map((col, index) => (
              <th 
                key={index} 
                className={`table-th ${col.aligner ? `text-${col.aligner}` : 'text-gauche'}`}
              >
                {col.libelle}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  );
};
