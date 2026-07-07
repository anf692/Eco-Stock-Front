import React from 'react';
import '../../styles/Composants.css';



export const Entree = ({
  label,
  icone: Icone,
  type = 'text',
  options = [],
  placeholder,
  value,
  onChange,
  name,
  required = false,
  className = '',
  style,
  ...props
}) => {
  const aIcone = !!Icone;
  const classeInput = `${type === 'select' ? 'champ-select' : 'champ-saisie'} ${aIcone ? 'champ-avec-icone' : ''} ${className}`.trim();

  return (
    <div className="champ-conteneur" style={style}>
      {label && <label className="champ-label">{label}</label>}
      
      <div className="input-conteneur">
        {aIcone && (
          <div className="champ-icone">
            <Icone size={18} />
          </div>
        )}
        
        {type === 'select' ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className={classeInput}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.valeur} value={opt.valeur}>
                {opt.libelle}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={classeInput}
            {...props}
          />
        )}
      </div>
    </div>
  );
};



