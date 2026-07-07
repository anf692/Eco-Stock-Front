import React, { useState, useEffect } from 'react';
import { Layers } from 'lucide-react';
import { BoiteDialogue } from '../common/BoiteDialogue';
import { Entree } from '../common/Entree';
import { Bouton } from '../common/Bouton';


// Boîte de dialogue pour transférer un produit vers un autre entrepôt.
export const ModalDeplacement = ({ 
  estOuvert, 
  produit, 
  entrepots = [], 
  onDeplacer, 
  surFermeture 
}) => {
  const [entrepotSelectionne, setEntrepotSelectionne] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  // Réinitialise l'état lors de l'ouverture
  useEffect(() => {
    if (estOuvert && produit) {
      // Exclut l'entrepôt actuel du produit de la sélection initiale
      const autresEntrepots = entrepots.filter(e => e.id !== produit.entrepot);
      if (autresEntrepots.length > 0) {
        setEntrepotSelectionne(autresEntrepots[0].id);
      } else {
        setEntrepotSelectionne('');
      }
      setErreur('');
    }
  }, [estOuvert, produit, entrepots]);

  const gererSoumission = async (evenement) => {
    evenement.preventDefault();
    if (!entrepotSelectionne) {
      setErreur('Veuillez sélectionner un entrepôt de destination.');
      return;
    }

    setErreur('');
    setChargement(true);

    try {
      await onDeplacer(produit.id, parseInt(entrepotSelectionne, 10));
      surFermeture();
    } catch (err) {
      // Affiche l'erreur renvoyée par le backend (ex: "Produit périmé.")
      setErreur(err.message || 'Impossible de déplacer le produit.');
    } finally {
      setChargement(false);
    }
  };

  // Liste des entrepôts sauf celui où se trouve déjà le produit
  const optionsEntrepots = entrepots
    .filter(e => e.id !== produit?.entrepot)
    .map(e => ({
      valeur: e.id,
      libelle: `${e.nom} (${e.localisation})`
    }));

  return (
    <BoiteDialogue
      estOuvert={estOuvert}
      surFermeture={surFermeture}
      titre={`Transférer : ${produit?.nomp}`}
      largeurMax="450px"
    >
      <form onSubmit={gererSoumission} className="form-eco">
        <p className="modale-texte">
          Sélectionnez l'entrepôt vers lequel vous souhaitez déplacer ce produit. 
          Les produits périmés ne peuvent pas être transférés.
        </p>

        {erreur && (
          <div className="alerte-erreur">
            {erreur}
          </div>
        )}

        <Entree
          label="Entrepôt de destination"
          type="select"
          icone={Layers}
          options={optionsEntrepots}
          placeholder={optionsEntrepots.length === 0 ? "Aucun autre entrepôt disponible" : "Choisir l'entrepôt"}
          value={entrepotSelectionne}
          onChange={(e) => setEntrepotSelectionne(e.target.value)}
          required
        />

        <div className="form-actions">
          <Bouton variante="contour" onClick={surFermeture} disabled={chargement}>
            Annuler
          </Bouton>
          <Bouton 
            type="submit" 
            variante="primaire" 
            disabled={chargement || optionsEntrepots.length === 0}
          >
            {chargement ? 'Déplacement...' : 'Confirmer le transfert'}
          </Bouton>
        </div>
      </form>
    </BoiteDialogue>
  );
};


