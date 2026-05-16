export class DOMManager {

  /**
   * Ajoute toutes les images d'une collection sur le gameBoard
   * @param {Image[]} images
   */
  createCards(images, onCardClick) {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';

    // On duplique les images pour créer les paires et on mélange
    const paires = this.melangerTableau([...images, ...images]);

    paires.forEach((image, index) => {
      // Création de la carte
      const carte = document.createElement('div');
      carte.classList.add('card');
      carte.dataset.id = image.id;
      carte.dataset.index = index;

      // Structure interne de la carte
      carte.innerHTML = `
        <div class="card-inner">
          <div class="card-front">
            <img src="./assets/images/mask1.jpg" alt="Hidden card">
          </div>
          <div class="card-back hidden">
            <img src="${image.url}" alt="${image.name}">
          </div>
        </div>
      `;

      // On branche le clic
      carte.addEventListener('click', () => onCardClick(carte));

      gameBoard.appendChild(carte);
    });
  }

  /**
   * Retourne une carte (montre sa face cachée)
   * @param {Element} carte
   */
  retournerCarte(carte) {
    carte.querySelector('.card-front').classList.add('hidden');
    carte.querySelector('.card-back').classList.remove('hidden');
    carte.classList.add('retournee');
  }

  /**
   * Remet une carte face cachée
   * @param {Element} carte
   */
  cacherCarte(carte) {
    carte.querySelector('.card-front').classList.remove('hidden');
    carte.querySelector('.card-back').classList.add('hidden');
    carte.classList.remove('retournee');
  }

  /**
   * Marque une carte comme trouvée (elle ne peut plus être cliquée)
   * @param {Element} carte
   */
  marquerTrouvee(carte) {
    carte.classList.add('trouvee');
  }

  /**
   * Affiche la zone de jeu et cache le formulaire
   */
  afficherZoneDeJeu() {
    document.getElementById('setup-form').classList.add('cache');
    document.getElementById('game-area').classList.remove('cache');
  }

  /**
   * Affiche le formulaire et cache la zone de jeu
   */
  afficherFormulaire() {
    document.getElementById('game-area').classList.add('cache');
    document.getElementById('setup-form').classList.remove('cache');
  }

  /**
   * Met à jour l'affichage du chronomètre
   * @param {number} secondes
   */
  mettreAJourChronometre(secondes) {
    const m = String(Math.floor(secondes / 60)).padStart(2, '0');
    const s = String(secondes % 60).padStart(2, '0');
    document.getElementById('timer').textContent = `⏱ ${m}:${s}`;
  }

  /**
   * Met à jour les infos du joueur dans l'entête de jeu
   * @param {string} nom
   * @param {number} difficulte
   */
  mettreAJourInfosJoueur(nom, difficulte) {
    document.getElementById('player-display').textContent = `👤 ${nom}`;
    document.getElementById('difficulty-display').textContent = `🃏 ${difficulte} paires`;
  }

  /**
   * Affiche un message d'erreur dans le formulaire
   * @param {string} message
   */
  afficherErreur(message) {
    document.getElementById('error-msg').textContent = message;
  }

  /**
   * Efface le message d'erreur
   */
  effacerErreur() {
    document.getElementById('error-msg').textContent = '';
  }

  /**
   * Mélange un tableau (Fisher-Yates)
   * @param {any[]} tableau
   * @returns {any[]}
   */
  melangerTableau(tableau) {
    for (let i = tableau.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tableau[i], tableau[j]] = [tableau[j], tableau[i]];
    }
    return tableau;
  }
}