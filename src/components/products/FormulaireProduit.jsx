import React, { useState, useEffect } from 'react';
import { Package, Hash, Calendar, Layers, Info } from 'lucide-react';
import { Entree } from '../common/Entree';
import { Bouton } from '../common/Bouton';
import '../../styles/Inventaire.css';

const statutOptions = [
  { valeur: 'disponible', libelle: 'Disponible' },
  { valeur: 'reserve', libelle: 'Réservé' },
  { valeur: 'perime', libelle: 'Périmé' },
];


// Formulaire de création/édition d'un produit.
export const FormulaireProduit = ({ 
  produitInitial, 
  entrepots = [], 
  onSoumettre, 
  surFermer 
}) => {
  const [nomp, setNomp] = useState('');
  const [quantite, setQuantite] = useState(1);
  const [dateExpiration, setDateExpiration] = useState('');
  const [status, setStatus] = useState('disponible');
  const [entrepot, setEntrepot] = useState('');
  const [erreur, setErreur] = useState('');
  const [soumissionEnCours, setSoumissionEnCours] = useState(false);

  // Remplit le formulaire si on est en mode édition
  useEffect(() => {
    if (produitInitial) {
      setNomp(produitInitial.nomp);
      setQuantite(produitInitial.quantite);
      setDateExpiration(produitInitial.date_expiration);
      setStatus(produitInitial.status);
      setEntrepot(produitInitial.entrepot);
    } else {
      setNomp('');
      setQuantite(1);
      setDateExpiration('');
      setStatus('disponible');
      // Sélectionne le premier entrepôt par défaut s'il y en a
      if (entrepots.length > 0) {
        setEntrepot(entrepots[0].id);
      }
    }
    setErreur('');
  }, [produitInitial, entrepots]);

  const gererSoumission = async (evenement) => {
    evenement.preventDefault();
    setErreur('');
    setSoumissionEnCours(true);

    if (!entrepot) {
      setErreur('Veuillez sélectionner un entrepôt.');
      setSoumissionEnCours(false);
      return;
    }

    try {
      const produitData = {
        nomp,
        quantite: parseInt(quantite, 10),
        date_expiration: dateExpiration,
        status,
        entrepot: parseInt(entrepot, 10),
      };

      await onSoumettre(produitData);
    } catch (err) {
      setErreur(err.message || 'Une erreur est survenue lors de la soumission.');
    } finally {
      setSoumissionEnCours(false);
    }
  };

  const entrepotOptions = entrepots.map(e => ({
    valeur: e.id,
    libelle: `${e.nom} (${e.localisation})`
  }));

  return (
    <form onSubmit={gererSoumission} className="form-eco">
      {erreur && (
        <div className="alerte-erreur">
          {erreur}
        </div>
      )}

      <Entree
        label="Nom du produit"
        icone={Package}
        placeholder="Ex: Sac d'engrais bio"
        value={nomp}
        onChange={(e) => setNomp(e.target.value)}
        required
      />

      <div className="double-champs-grille">
        <Entree
          label="Quantité"
          type="number"
          icone={Hash}
          min="1"
          value={quantite}
          onChange={(e) => setQuantite(e.target.value)}
          required
        />

        <Entree
          label="Date d'expiration"
          type="date"
          icone={Calendar}
          value={dateExpiration}
          onChange={(e) => setDateExpiration(e.target.value)}
          required
        />
      </div>

      <Entree
        label="Statut du produit"
        type="select"
        icone={Info}
        options={statutOptions}
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        required
      />

      <Entree
        label="Entrepôt de stockage"
        type="select"
        icone={Layers}
        options={entrepotOptions}
        placeholder={entrepots.length === 0 ? "Aucun entrepôt disponible" : "Sélectionner un entrepôt"}
        value={entrepot}
        onChange={(e) => setEntrepot(e.target.value)}
        required
      />

      <div className="form-actions">
        <Bouton variante="contour" onClick={surFermer} disabled={soumissionEnCours}>
          Annuler
        </Bouton>
        <Bouton type="submit" variante="primaire" disabled={soumissionEnCours}>
          {soumissionEnCours ? 'Enregistrement...' : produitInitial ? 'Mettre à jour' : 'Ajouter le produit'}
        </Bouton>
      </div>
    </form>
  );
};

