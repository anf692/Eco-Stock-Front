import React, { useState, useEffect } from 'react';
import { Plus, Search, RefreshCw, AlertCircle, Check, Edit, Trash2, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clientApi } from '../services/clientApi';
import { MiseEnPage } from '../components/layout/MiseEnPage';
import { Bouton } from '../components/common/Bouton';
import { Entree } from '../components/common/Entree';
import { Tableau } from '../components/common/Tableau';
import { BoiteDialogue } from '../components/common/BoiteDialogue';
import '../styles/Inventaire.css';
import '../styles/Composants.css';


//Page de gestion des entrepôts.
export default function Entrepots() {
  const { estAuthentifie } = useAuth();

  // États de données
  const [entrepots, setEntrepots] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [messageSucces, setMessageSucces] = useState('');
  const [termeRecherche, setTermeRecherche] = useState('');

  // États pour formulaire entrepôt
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [entrepotAEditer, setEntrepotAEditer] = useState(null);
  const [nom, setNom] = useState('');
  const [localisation, setLocalisation] = useState('');
  const [capacite, setCapacite] = useState('');
  const [formErreur, setFormErreur] = useState('');
  const [soumissionEnCours, setSoumissionEnCours] = useState(false);

  // État pour l'audit
  const [entrepotAudit, setEntrepotAudit] = useState(null);
  const [auditResultat, setAuditResultat] = useState(null);
  const [chargementAudit, setChargementAudit] = useState(false);

  const chargerEntrepots = async () => {
    setChargement(true);
    setErreur('');
    try {
      const donnees = await clientApi.getEntrepots();
      setEntrepots(donnees);
    } catch (err) {
      setErreur('Impossible de charger la liste des entrepôts.');
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    chargerEntrepots();
  }, []);

  const afficherSucces = (texte) => {
    setMessageSucces(texte);
    setTimeout(() => {
      setMessageSucces('');
    }, 4000);
  };

  // Pré-remplit le formulaire en mode édition
  useEffect(() => {
    if (entrepotAEditer) {
      setNom(entrepotAEditer.nom);
      setLocalisation(entrepotAEditer.localisation);
      setCapacite(entrepotAEditer.capacite);
    } else {
      setNom('');
      setLocalisation('');
      setCapacite('');
    }
    setFormErreur('');
  }, [entrepotAEditer, modaleOuverte]);

  // --- ACTIONS CRUD ---

  const gererSoumission = async (evenement) => {
    evenement.preventDefault();
    setFormErreur('');
    setSoumissionEnCours(true);

    try {
      const entrepotData = {
        nom,
        localisation,
        capacite: parseInt(capacite, 10),
      };

      if (entrepotAEditer) {
        const misAJour = await clientApi.modifierEntrepot(entrepotAEditer.id, entrepotData);
        setEntrepots(entrepots.map(e => e.id === entrepotAEditer.id ? misAJour : e));
        afficherSucces(`L'entrepôt "${misAJour.nom}" a été mis à jour.`);
      } else {
        const nouveau = await clientApi.creerEntrepot(entrepotData);
        setEntrepots([nouveau, ...entrepots]);
        afficherSucces(`L'entrepôt "${nouveau.nom}" a été ajouté.`);
      }
      setModaleOuverte(false);
      setEntrepotAEditer(null);
    } catch (err) {
      setFormErreur(err.message || 'Une erreur est survenue lors de l\'enregistrement.');
    } finally {
      setSoumissionEnCours(false);
    }
  };

  const gererSuppression = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet entrepôt ? Tous les produits associés seront également supprimés (cascade).')) {
      try {
        await clientApi.supprimerEntrepot(id);
        setEntrepots(entrepots.filter(e => e.id !== id));
        // Réinitialise l'audit s'il concernait cet entrepôt
        if (entrepotAudit?.id === id) {
          setEntrepotAudit(null);
          setAuditResultat(null);
        }
        afficherSucces('L\'entrepôt a été supprimé.');
      } catch (err) {
        setErreur('Impossible de supprimer cet entrepôt.');
      }
    }
  };

  const lancerAudit = async (entrepot) => {
    setEntrepotAudit(entrepot);
    setChargementAudit(true);
    setAuditResultat(null);
    try {
      const res = await clientApi.getAuditEntrepot(entrepot.id);
      setAuditResultat(res);
    } catch (err) {
      alert("Erreur lors de l'audit.");
    } finally {
      setChargementAudit(false);
    }
  };

  // Filtrer les entrepôts
  const entrepotsFiltres = entrepots.filter(e =>
    e.nom.toLowerCase().includes(termeRecherche.toLowerCase()) ||
    e.localisation.toLowerCase().includes(termeRecherche.toLowerCase())
  );

  const colonnesTableau = [
    { libelle: 'Code/ID' },
    { libelle: 'Nom de l\'Entrepôt' },
    { libelle: 'Localisation' },
    { libelle: 'Capacité Maximale' },
    { libelle: 'Actions/Audit', aligner: 'right' }
  ];

  return (
    <MiseEnPage titre="Gestion des Entrepôts">
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

      {/* Barre de Recherche et Bouton d'ajout */}
      <div className="barre-actions">
        <div className="filtre-recherche-entrepot">
          <Entree
            icone={Search}
            placeholder="Rechercher un entrepôt..."
            value={termeRecherche}
            onChange={(e) => setTermeRecherche(e.target.value)}
          />
        </div>

        {estAuthentifie ? (
          <Bouton 
            variante="primaire" 
            onClick={() => {
              setEntrepotAEditer(null);
              setModaleOuverte(true);
            }}
          >
            <Plus size={18} />
            Ajouter un entrepôt
          </Bouton>
        ) : (
          <span className="msg-auth-requis">
            Connectez-vous pour modifier ou ajouter des entrepôts.
          </span>
        )}
      </div>

      {/* Affichage des résultats d'audit */}
      {entrepotAudit && (
        <div className="audit-alerte">
          <Info size={16} className="flex-shrink-0" />
          {chargementAudit ? (
            <span>Audit de capacité en cours pour <strong>{entrepotAudit.nom}</strong>...</span>
          ) : (
            <span>
              L'audit de l'entrepôt <strong>{auditResultat?.Entrepot}</strong> indique <strong>{auditResultat?.total_products}</strong> produits stockés sur une capacité maximale de {entrepotAudit.capacite} unités.
            </span>
          )}
        </div>
      )}

      {/* Tableau des entrepôts */}
      {chargement ? (
        <div className="chargement-conteneur">
          <div className="chargement-texte">
            <RefreshCw size={20} className="animate-spin" />
            Chargement des entrepôts...
          </div>
        </div>
      ) : entrepotsFiltres.length > 0 ? (
        <Tableau colonnes={colonnesTableau}>
          {entrepotsFiltres.map(entrepot => (
            <tr key={entrepot.id} className="table-tr">
              <td className="table-td table-td-gras">{entrepot.id}</td>
              <td className="table-td">{entrepot.nom}</td>
              <td className="table-td">{entrepot.localisation}</td>
              <td className="table-td">{entrepot.capacite} kg / m³</td>
              
              <td className="table-td text-droite">
                <div className="actions-conteneur">
                  <Bouton 
                    variante="contour" 
                    onClick={() => lancerAudit(entrepot)}
                    className="btn-pagination"
                  >
                    Audit
                  </Bouton>

                  {estAuthentifie && (
                    <>
                      <Bouton 
                        variante="contour"
                        title="Modifier"
                        onClick={() => {
                          setEntrepotAEditer(entrepot);
                          setModaleOuverte(true);
                        }}
                        className="btn-action-icone"
                      >
                        <Edit size={14} color="#3A5B22" />
                      </Bouton>

                      <Bouton 
                        variante="contour"
                        title="Supprimer"
                        onClick={() => gererSuppression(entrepot.id)}
                        className="btn-action-icone"
                      >
                        <Trash2 size={14} color="#991B1B" />
                      </Bouton>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </Tableau>
      ) : (
        <div className="message-info">
          Aucun entrepôt ne correspond à vos critères de recherche.
        </div>
      )}

      {/* Modale d'ajout / modification d'entrepôt */}
      <BoiteDialogue
        estOuvert={modaleOuverte}
        surFermeture={() => setModaleOuverte(false)}
        titre={entrepotAEditer ? `Modifier l'entrepôt : ${entrepotAEditer.nom}` : 'Ajouter un nouvel entrepôt'}
      >
        <form onSubmit={gererSoumission} className="form-eco">
          {formErreur && (
            <div className="alerte-erreur">
              {formErreur}
            </div>
          )}

          <Entree
            label="Nom de l'entrepôt"
            placeholder="Ex: Entrepôt Principal"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
          />

          <Entree
            label="Localisation"
            placeholder="Ex: Zone Industrielle, Dakar"
            value={localisation}
            onChange={(e) => setLocalisation(e.target.value)}
            required
          />

          <Entree
            label="Capacité maximale"
            type="number"
            min="1"
            placeholder="Ex: 5000"
            value={capacite}
            onChange={(e) => setCapacite(e.target.value)}
            required
          />

          <div className="form-actions">
            <Bouton variante="contour" onClick={() => setModaleOuverte(false)} disabled={soumissionEnCours}>
              Annuler
            </Bouton>
            <Bouton type="submit" variante="primaire" disabled={soumissionEnCours}>
              {soumissionEnCours ? 'Enregistrement...' : entrepotAEditer ? 'Modifier' : 'Ajouter'}
            </Bouton>
          </div>
        </form>
      </BoiteDialogue>
    </MiseEnPage>
  );
}
