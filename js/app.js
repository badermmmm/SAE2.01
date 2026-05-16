import { ApiService } from './ApiService.js';
import { Game } from './Game.js';
import { DOMManager } from './DOMManager.js';

const domManager = new DOMManager();
const game       = new Game();

const boutonJouer   = document.getElementById('btn-start');
const boutonAbandon = document.getElementById('btn-abandon');

// ── Événements ───────────────────────────────────────────────────────────────

boutonJouer.addEventListener('click', demarrerPartie);
boutonAbandon.addEventListener('click', () => game.abandonner());

// ── Démarrage ────────────────────────────────────────────────────────────────

async function demarrerPartie() {
  const nom        = document.getElementById('player-name').value.trim();
  const difficulte = parseInt(document.getElementById('difficulty').value);
  const collection = document.getElementById('collection').value;

  // Validation
  if (!nom) {
    domManager.afficherErreur('Entre ton pseudo pour commencer !');
    document.getElementById('player-name').focus();
    return;
  }

  domManager.effacerErreur();
  boutonJouer.disabled = true;
  boutonJouer.querySelector('span').textContent = 'Connexion…';

  try {
    // Création de la partie sur le serveur
    const data = await ApiService.createGame(nom, difficulte);
    console.log('Partie créée, id :', data.id);

    // Lancement du jeu
    game.startGame(data.id, difficulte, collection, nom);

  } catch (erreur) {
    domManager.afficherErreur('Impossible de contacter le serveur. Vérifie ta connexion.');
    console.error(erreur);
  } finally {
    boutonJouer.disabled = false;
    boutonJouer.querySelector('span').textContent = 'Jouer';
  }
}