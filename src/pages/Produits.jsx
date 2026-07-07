import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, RefreshCw, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clientApi } from '../services/clientApi';
import { MiseEnPage } from '../components/layout/MiseEnPage';
import { Bouton } from '../components/common/Bouton';
import { Entree } from '../components/common/Entree';
import { Tableau } from '../components/common/Tableau';
import { LigneProduit } from '../components/products/LigneProduit';
import { BoiteDialogue } from '../components/common/BoiteDialogue';
import { FormulaireProduit } from '../components/products/FormulaireProduit';
import { ModalDeplacement } from '../components/products/ModalDeplacement';
import '../styles/Inventaire.css';

/**
 * Page de gestion des produits (Inventaire).
 * Utilise des classes CSS standards issues de Inventaire.css.
 */
export default function Produits() {
  const { estAuthentifie } = useAuth();

  // États de données
  const [produits, setProduits] = useState([]);
  const [entrepots, setEntrepots] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [messageSucces, setMessageSucces] = useState('');

  // États de filtres et recherche
  const [termeRecherche, setTermeRecherche] = useState('');
  const [statutFiltre, setStatutFiltre] = useState('');
  const [entrepotFiltre, setEntrepotFiltre] = useState('');

  // États pour les modales
  const [modaleFormulaireOuverte, setModaleFormulaireOuverte] = useState(false);
  const [produitAEditer, setProduitAEditer] = useState(null);
  const [modaleDeplacementOuverte, setModaleDeplacementOuverte] = useState(false);
  const [produitADeplacer, setProduitADeplacer] = useState(null);

  // Pagination (simple implémentation locale)
  const [pageCourante, setPageCourante] = useState(1);
  const elementsParPage = 10;

  // Charge les produits et les entrepôts
  const chargerDonnees = async () => {
    setChargement(true);
    setErreur('');
    try {
      const [donneesProduits, donneesEntrepots] = await Promise.all([
        clientApi.getProduits(),
        clientApi.getEntrepots()
      ]);
      setProduits(donneesProduits);
      setEntrepots(donneesEntrepots);
    } catch (err) {
      setErreur('Impossible de charger les données de l\'inventaire.');
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    chargerDonnees();
  }, []);

  // Déclencher un message flash de succès
  const afficherSucces = (texte) => {
    setMessageSucces(texte);
    setTimeout(() => {
      setMessageSucces('');
    }, 4000);
  };

  // --- ACTIONS CRUD ---

  const gererAjoutOuModification = async (produitData) => {
    try {
      if (produitAEditer) {
        // Mode modification
        const produitMisAJour = await clientApi.modifierProduit(produitAEditer.id, produitData);
        setProduits(produits.map(p => p.id === produitAEditer.id ? produitMisAJour : p));
        afficherSucces(`Le produit "${produitMisAJour.nomp}" a été modifié avec succès.`);
      } else {
        // Mode création
        const nouveauProduit = await clientApi.creerProduit(produitData);
        setProduits([nouveauProduit, ...produits]);
        afficherSucces(`Le produit "${nouveauProduit.nomp}" a été ajouté avec succès.`);
      }
      setModaleFormulaireOuverte(false);
      setProduitAEditer(null);
    } catch (err) {
      throw err; // Laisse le formulaire gérer et afficher l'erreur
    }
  };

  const gererSuppression = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit de l\'inventaire ?')) {
      try {
        await clientApi.supprimerProduit(id);
        setProduits(produits.filter(p => p.id !== id));
        afficherSucces('Le produit a été supprimé de la base de données.');
      } catch (err) {
        setErreur('Erreur lors de la suppression du produit.');
      }
    }
  };

  const gererDeplacement = async (produitId, entrepotId) => {
    // Cette action fait appel à l'API /api/produits/<id>/move/
    const reponseDeplacement = await clientApi.deplacerProduit(produitId, entrepotId);
    
    // Met à jour l'entrepôt localement dans l'état
    setProduits(produits.map(p => p.id === produitId ? { ...p, entrepot: entrepotId } : p));
    afficherSucces(`${reponseDeplacement.message} Déplacé vers ${reponseDeplacement.Entrepot}.`);
  };

  // --- FILTRAGE DES PRODUITS ---

  const produitsFiltres = produits.filter(produit => {
    const correspondRecherche = produit.nomp.toLowerCase().includes(termeRecherche.toLowerCase());
    const correspondStatut = statutFiltre === '' || produit.status === statutFiltre;
    const correspondEntrepot = entrepotFiltre === '' || produit.entrepot === parseInt(entrepotFiltre, 10);
    return correspondRecherche && correspondStatut && correspondEntrepot;
  });

  // Calcul pagination
  const indexDernierElement = pageCourante * elementsParPage;
  const indexPremierElement = indexDernierElement - elementsParPage;
  const produitsAffiches = produitsFiltres.slice(indexPremierElement, indexDernierElement);
  const totalPages = Math.ceil(produitsFiltres.length / elementsParPage);

  // Trouver le nom de l'entrepôt pour chaque ID
  const obtenirNomEntrepot = (id) => {
    const entrepot = entrepots.find(e => e.id === id);
    return entrepot ? entrepot.nom : null;
  };

  const colonnesTableau = [
    { libelle: 'Code/ID' },
    { libelle: 'Nom du Produit' },
    { libelle: 'Entrepôt' },
    { libelle: 'Quantité' },
    { libelle: 'Expiration' },
    { libelle: 'Statut' },
    { libelle: 'Actions', aligner: 'right' }
  ];

  return (
    <MiseEnPage titre="Gestion de l'Inventaire">
      {erreur && (
        <div className="alerte-erreur">
          <AlertCircle size={18} />
          <span>{erreur}</span>
        </div>
      )}

      {messageSucces && (
        <div className="alerte-succes">
          <Check size={18} />
          <span>{messageSucces}</span>
        </div>
      )}

      {/* Actions & Barre de filtres */}
      <div className="barre-actions">
        <div className="barre-filtres">
          {/* Recherche */}
          <div className="filtre-recherche">
            <Entree
              icone={Search}
              placeholder="Rechercher un produit..."
              value={termeRecherche}
              onChange={(e) => {
                setTermeRecherche(e.target.value);
                setPageCourante(1);
              }}
            />
          </div>

          {/* Filtre de Statut */}
          <div className="filtre-statut">
            <Entree
              type="select"
              icone={Filter}
              options={[
                { valeur: 'disponible', libelle: 'Disponible' },
                { valeur: 'reserve', libelle: 'Réservé' },
                { valeur: 'perime', libelle: 'Périmé' }
              ]}
              placeholder="Tous les états"
              value={statutFiltre}
              onChange={(e) => {
                setStatutFiltre(e.target.value);
                setPageCourante(1);
              }}
            />
          </div>

          {/* Filtre d'Entrepôt */}
          <div className="filtre-entrepot">
            <Entree
              type="select"
              icone={Filter}
              options={entrepots.map(e => ({ valeur: e.id, libelle: e.nom }))}
              placeholder="Tous les entrepôts"
              value={entrepotFiltre}
              onChange={(e) => {
                setEntrepotFiltre(e.target.value);
                setPageCourante(1);
              }}
            />
          </div>
        </div>

        {/* Bouton d'ajout */}
        {estAuthentifie ? (
          <Bouton 
            variante="primaire" 
            onClick={() => {
              setProduitAEditer(null);
              setModaleFormulaireOuverte(true);
            }}
          >
            <Plus size={18} />
            Ajouter un produit
          </Bouton>
        ) : (
          <span className="msg-auth-requis">
            Connectez-vous pour ajouter ou modifier des produits.
          </span>
        )}
      </div>

      {/* Tableau d'inventaire */}
      {chargement ? (
        <div className="chargement-conteneur">
          <div className="chargement-texte">
            <RefreshCw size={20} className="animate-spin" />
            Chargement des produits...
          </div>
        </div>
      ) : produitsFiltres.length > 0 ? (
        <>
          <Tableau colonnes={colonnesTableau}>
            {produitsAffiches.map(produit => (
              <LigneProduit
                key={produit.id}
                produit={produit}
                nomEntrepot={obtenirNomEntrepot(produit.entrepot)}
                surModifier={(prod) => {
                  setProduitAEditer(prod);
                  setModaleFormulaireOuverte(true);
                }}
                surSupprimer={gererSuppression}
                surDeplacer={(prod) => {
                  setProduitADeplacer(prod);
                  setModaleDeplacementOuverte(true);
                }}
              />
            ))}
          </Tableau>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-barre">
              <span>
                Affichage de {indexPremierElement + 1} à {Math.min(indexDernierElement, produitsFiltres.length)} sur {produitsFiltres.length} produits
              </span>
              <div className="pagination-boutons">
                <Bouton
                  variante="contour"
                  disabled={pageCourante === 1}
                  onClick={() => setPageCourante(pageCourante - 1)}
                  className="btn-pagination"
                >
                  Précédent
                </Bouton>
                <Bouton
                  variante="contour"
                  disabled={pageCourante === totalPages}
                  onClick={() => setPageCourante(pageCourante + 1)}
                  className="btn-pagination"
                >
                  Suivant
                </Bouton>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="message-info">
          Aucun produit ne correspond à vos critères de recherche ou de filtrage.
        </div>
      )}

      {/* Modale d'ajout ou d'édition de produit */}
      <BoiteDialogue
        estOuvert={modaleFormulaireOuverte}
        surFermeture={() => {
          setModaleFormulaireOuverte(false);
          setProduitAEditer(null);
        }}
        titre={produitAEditer ? `Modifier le produit : ${produitAEditer.nomp}` : 'Ajouter un produit à l\'inventaire'}
      >
        <FormulaireProduit
          produitInitial={produitAEditer}
          entrepots={entrepots}
          onSoumettre={gererAjoutOuModification}
          surFermer={() => {
            setModaleFormulaireOuverte(false);
            setProduitAEditer(null);
          }}
        />
      </BoiteDialogue>

      {/* Modale de transfert de produit */}
      <ModalDeplacement
        estOuvert={modaleDeplacementOuverte}
        produit={produitADeplacer}
        entrepots={entrepots}
        onDeplacer={gererDeplacement}
        surFermeture={() => {
          setModaleDeplacementOuverte(false);
          setProduitADeplacer(null);
        }}
      />
    </MiseEnPage>
  );
}


