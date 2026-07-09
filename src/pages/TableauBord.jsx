import React, { useState, useEffect } from 'react';
import { MiseEnPage } from '../components/layout/MiseEnPage';
import { clientApi } from '../services/clientApi';
import { Package, CheckCircle, AlertTriangle, XCircle, Info, RefreshCw } from 'lucide-react';
import { Bouton } from '../components/common/Bouton';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import '../styles/TableauBord.css';


//Page Tableau de bord.
export default function TableauBord() {
  const [produits, setProduits] = useState([]);
  const [entrepots, setEntrepots] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  
  // États pour l'audit des entrepôts
  const [entrepotAuditId, setEntrepotAuditId] = useState(null);
  const [auditResultat, setAuditResultat] = useState(null);
  const [auditEnCours, setAuditEnCours] = useState(false);

  const chargerDonnees = async () => {
    setChargement(true);
    setErreur('');
    try {
      const [dataProduits, dataEntrepots] = await Promise.all([
        clientApi.getProduits(),
        clientApi.getEntrepots()
      ]);
      setProduits(dataProduits);
      setEntrepots(dataEntrepots);
    } catch (err) {
      setErreur("Une erreur s'est produite lors de la récupération des données.");
      console.log(err)
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    chargerDonnees();
  }, []);

  const gererAudit = async (id) => {
    setEntrepotAuditId(id);
    setAuditEnCours(true);
    setAuditResultat(null);
    try {
      const resultat = await clientApi.getAuditEntrepot(id);
      setAuditResultat(resultat);
    } catch (err) {
      alert("Erreur lors de l'audit.");
    } finally {
      setAuditEnCours(false);
    }
  };

  // Calcul des statistiques
  const totalReferences = produits.length;
  const quantiteTotale = produits.reduce((acc, p) => acc + p.quantite, 0);
  
  const dispoCount = produits.filter(p => p.status === 'disponible').length;
  const reserveCount = produits.filter(p => p.status === 'reserve').length;
  const perimeCount = produits.filter(p => p.status === 'perime').length;

  const dataStats = [
    { name: 'Disponibles', value: dispoCount },
    { name: 'Réservés', value: reserveCount },
    { name: 'Périmés', value: perimeCount }
  ];

  const COLORS = ['#3A5B22', '#D97706', '#DC2626'];

  if (chargement) {
    return (
      <MiseEnPage titre="Tableau de Bord">
        <div className="chargement-conteneur">
          <div className="chargement-texte">
            <RefreshCw size={24} className="animate-spin" />
            Chargement des données...
          </div>
        </div>
      </MiseEnPage>
    );
  }

  return (
    <MiseEnPage titre="Tableau de Bord">
      {erreur && <div className="db-erreur-alerte">{erreur}</div>}

      {/* Grille de statistiques générales */}
      <div className="stats-grille">
        {/* Références Produits */}
        <div className="kpi-carte">
          <div className="kpi-icone-ronde kpi-vert">
            <Package size={20} />
          </div>
          <div className="kpi-textes">
            <span className="kpi-valeur">{totalReferences}</span>
            <span className="kpi-label">Produits Enregistrés</span>
          </div>
        </div>

        {/* Quantité Totale en Stock */}
        <div className="kpi-carte">
          <div className="kpi-icone-ronde kpi-gris">
            <RefreshCw size={20} />
          </div>
          <div className="kpi-textes">
            <span className="kpi-valeur">{quantiteTotale}</span>
            <span className="kpi-label">Unités Totales</span>
          </div>
        </div>

        {/* Disponibles */}
        <div className="kpi-carte">
          <div className="kpi-icone-ronde kpi-dispo">
            <CheckCircle size={20} />
          </div>
          <div className="kpi-textes">
            <span className="kpi-valeur">{dispoCount}</span>
            <span className="kpi-label">Disponibles</span>
          </div>
        </div>

        {/* Réservés */}
        <div className="kpi-carte">
          <div className="kpi-icone-ronde kpi-reserve">
            <AlertTriangle size={20} />
          </div>
          <div className="kpi-textes">
            <span className="kpi-valeur">{reserveCount}</span>
            <span className="kpi-label">Réservés</span>
          </div>
        </div>

        {/* Périmés */}
        <div className="kpi-carte">
          <div className="kpi-icone-ronde kpi-perime">
            <XCircle size={20} />
          </div>
          <div className="kpi-textes">
            <span className="kpi-valeur">{perimeCount}</span>
            <span className="kpi-label">Périmés</span>
          </div>
        </div>
      </div>

      <div className="graphiques">

        {/* CAMEMBERT */}
        <div className="graphique-carte">
          <h3>Répartition des produits</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dataStats}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {dataStats.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* BARRES */}
        <div className="graphique-carte">
          <h3>Produits par statut</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Deuxième ligne : Liste des entrepôts + Audits de capacité */}
      <div className="db-sections">
        <div className="db-section-carte">
          <div className="flex-entre-deux">
            <h3 className="db-section-titre">Capacité et Audit des Entrepôts</h3>
            <span className="stats-total-label">
              Total : {entrepots.length} entrepôt(s)
            </span>
          </div>

          <div className="entrepot-grille">
            {entrepots.map((entrepot) => (
              <div className="entrepot-carte" key={entrepot.id}>
                <div className="entrepot-infos">
                  <span className="entrepot-nom">{entrepot.nom}</span>
                  <span className="entrepot-detail">
                    Localisation : <strong>{entrepot.localisation}</strong> | Capacité Max : <strong>{entrepot.capacite} kg/m³</strong>
                  </span>
                </div>
                
                <div>
                  <Bouton 
                    variante="contour" 
                    onClick={() => gererAudit(entrepot.id)}
                    disabled={auditEnCours && entrepotAuditId === entrepot.id}
                  >
                    {auditEnCours && entrepotAuditId === entrepot.id ? 'Audit...' : 'Lancer l\'audit'}
                  </Bouton>
                </div>
              </div>
            ))}

            {entrepots.length === 0 && (
              <div className="message-vide">
                Aucun entrepôt n'est encore enregistré dans la base de données.
              </div>
            )}
          </div>

          {/* Rendu du résultat de l'audit */}
          {auditResultat && (
            <div className="audit-resultat-alerte">
              <Info size={16} />
              <span>
                Audit de <strong>{auditResultat.Entrepot}</strong> : {auditResultat.total_products} unité(s) actuellement en stock.
              </span>
            </div>
          )}
        </div>

        <div className="db-section-carte hauteur-ajustee">
          <h3 className="db-section-titre">Aide rapide</h3>
          <div className="aide-rapide-liste">
            <p>
              Bienvenue dans l'espace de gestion <strong>Eco-Stock</strong>. 
            </p>
            <p>
              - La section <strong>Produits</strong> vous permet de lister, rechercher, ajouter ou modifier les produits. 
            </p>
            <p>
              - La section <strong>Entrepôts</strong> permet de gérer les différents lieux de stockage.
            </p>
            <p>
              - Les audits de capacité calculent automatiquement la somme totale des produits stockés dans chaque site.
            </p>
          </div>
        </div>
      </div>
    </MiseEnPage>
  );
}
