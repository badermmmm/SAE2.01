import { imageCollections } from './ImageCollection.js';
import { ApiService } from './ApiService.js';
import { DOMManager } from './DOMManager.js';

export class Game {

  /**
   * @type {number} identifiant de la partie en cours
   */
  #id;

  /**
   * @type {DOMManager}
   */
  #domManager;

  /**
   * Cartes actuellement retournées (en attente de vérification)
   * @type {Element[]}
   */
  #cartesRetournees = [];

  /**
   * Nombre de paires trouvées
   * @type {number}
   */
  #pairesTouvees = 0;

  /**
   * Nombre total de paires dans la partie
   * @type {number}
   */
  #totalPaires = 0;

  /**
   * Empêche de cliquer pendant la vérification
   * @type {boolean}
   */
  #verificationEnCours = false;

  /**
   * Identifiant de l'intervalle du chronomètre
   */
  #minuterie = null;

  /**
   * Secondes écoulées depuis le début de la partie
   * @type {number}
   */
  #secondes = 0;

  constructor() {
    this.#domManager = new DOMManager();
  }

  /**
   * Démarre une nouvelle partie.
   * @param {number} id - The game ID.
   * @param {number} difficulte - Nombre de paires
   * @param {string} collection - Nom de la collection d'images
   * @param {string} nomJoueur - Pseudo du joueur
   */
  startGame(id, difficulte, collection, nomJoueur) {
    this.#id             = id;
    this.#totalPaires    = difficulte;
    this.#pairesTouvees  = 0;
    this.#cartesRetournees = [];
    this.#verificationEnCours = false;

    // Mise à jour de l'interface
    this.#domManager.mettreAJourInfosJoueur(nomJoueur, difficulte);
    this.#domManager.afficherZoneDeJeu();

    // Récupération des images selon la collection choisie
    const cle = this.#getClefCollection(collection);
    const images = imageCollections[cle].slice(0, difficulte);

    // Création des cartes sur le plateau
    this.#domManager.createCards(images, (carte) => this.#clicSurCarte(carte));

    // Lancement du chronomètre
    this.#lancerChronometre();
  }

  /**
   * Termine la partie et envoie le résultat au serveur.
   */
  async endGame() {
    this.#arreterChronometre();

    const pairesRestantes = this.#totalPaires - this.#pairesTouvees;

    try {
      const result = await ApiService.updateGameResult(this.#id, pairesRestantes);
      console.log('Fin de partie:', result);
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Erreur lors de la fin de la partie');
    }
  }

  /**
   * Abandon : termine la partie et revient au formulaire.
   */
  async abandonner() {
    await this.endGame();
    this.#domManager.afficherFormulaire();
  }

  // ── Logique des cartes ────────────────────────────────────────────────────

  /**
   * Appelée quand le joueur clique sur une carte.
   * @param {Element} carte
   */
  #clicSurCarte(carte) {
    // On ignore si vérification en cours, carte déjà retournée ou trouvée
    if (this.#verificationEnCours) return;
    if (carte.classList.contains('retournee')) return;
    if (carte.classList.contains('trouvee')) return;

    // On retourne la carte
    this.#domManager.retournerCarte(carte);
    this.#cartesRetournees.push(carte);

    // Si c'est la 2ème carte, on vérifie la paire
    if (this.#cartesRetournees.length === 2) {
      this.#verifierPaire();
    }
  }

  /**
   * Vérifie si les 2 cartes retournées forment une paire.
   */
  #verifierPaire() {
    this.#verificationEnCours = true;

    const [carte1, carte2] = this.#cartesRetournees;

    if (carte1.dataset.id === carte2.dataset.id) {
      // Bonne paire !
      this.#domManager.marquerTrouvee(carte1);
      this.#domManager.marquerTrouvee(carte2);
      this.#pairesTouvees++;
      this.#cartesRetournees    = [];
      this.#verificationEnCours = false;

      // Vérifie si la partie est terminée
      if (this.#pairesTouvees === this.#totalPaires) {
        this.#partieGagnee();
      }

    } else {
      // Mauvaise paire : on remet les cartes face cachée après 1 seconde
      setTimeout(() => {
        this.#domManager.cacherCarte(carte1);
        this.#domManager.cacherCarte(carte2);
        this.#cartesRetournees    = [];
        this.#verificationEnCours = false;
      }, 1000);
    }
  }

  /**
   * Le joueur a trouvé toutes les paires.
   */
  async #partieGagnee() {
    await this.endGame();
    setTimeout(() => {
      alert(`🎉 Bravo ! Tu as trouvé toutes les paires en ${this.#secondes} secondes !`);
      this.#domManager.afficherFormulaire();
    }, 400);
  }

  // ── Chronomètre ──────────────────────────────────────────────────────────

  #lancerChronometre() {
    this.#secondes = 0;
    this.#domManager.mettreAJourChronometre(this.#secondes);
    this.#minuterie = setInterval(() => {
      this.#secondes++;
      this.#domManager.mettreAJourChronometre(this.#secondes);
    }, 1000);
  }

  #arreterChronometre() {
    clearInterval(this.#minuterie);
    this.#minuterie = null;
  }

  // ── Utilitaires ───────────────────────────────────────────────────────────

  /**
   * Convertit la valeur du select en clef de imageCollections.
   * @param {string} collection
   * @returns {string}
   */
  #getClefCollection(collection) {
    const correspondances = {
      animaux: 'animals',
      fruits:  'fruits',
      sport:   'cars'
    };
    return correspondances[collection] ?? 'animals';
  }
}