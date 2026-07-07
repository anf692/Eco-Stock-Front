import React from 'react';
import '../../styles/Composants.css';


export const Bouton = ({ 
  children, 
  onClick, 
  type = 'button', 
  variante = 'primaire', 
  pleineLargeur = false, 
  disabled = false,
  className = '',
  style,
  ...props 
}) => {
  // Fusionne les classes par défaut de la variante avec l'éventuelle classe personnalisée
  const nomClasse = `btn btn-${variante} ${pleineLargeur ? 'btn-pleine-largeur' : ''} ${className}`.trim();

  return (
    <button
      type={type}
      className={nomClasse}
      onClick={onClick}
      disabled={disabled}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
};


