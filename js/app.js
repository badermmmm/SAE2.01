/**
 * app.js — Jeu de Memory
 *
 * Gère le formulaire de démarrage, la transition vers le jeu,
 * le chronomètre et la communication avec le serveur.
 */

// ── Éléments de la page ──────────────────────────────────────────────────────

const formulaire    = document.getElementById('setup-form');
const zoneDeJeu     = document.getElementById('game-area');
const boutonJouer   = document.getElementById('btn-start');
const messageErreur = document.getElementById('error-msg');

const champNom        = document.getElementById('player-name');
const champDifficulte = document.getElementById('difficulty');
const champCollection = document.getElementById('collection');

const affichageJoueur     = document.getElementById('player-display');
const affichageDifficulte = document.getElementById('difficulty-display');
const boutonAbandon       = document.getElementById('btn-abandon');

// ── Serveur ──────────────────────────────────────────────────────────────────

const URL_API = 'https://memory.iuthub.fr/api';

// ── État de la partie ────────────────────────────────────────────────────────

let idPartie = null;
let minuterie = null;
let secondes  = 0;

// ── Événements ───────────────────────────────────────────────────────────────

boutonJouer.addEventListener('click', demarrerPartie);
boutonAbandon.addEventListener('click', abandonnerPartie);

// ── Démarrage ────────────────────────────────────────────────────────────────

async function demarrerPartie() {
  const nom        = champNom.value.trim();
  const difficulte = champDifficulte.value;
  const collection = champCollection.value;

  // Vérification que le joueur a bien entré son pseudo
  if (!nom) {
    afficherErreur('Entre ton pseudo pour commencer !');
    champNom.focus();
    return;
  }

  effacerErreur();
  boutonJouer.disabled = true;
  boutonJouer.querySelector('span').textContent = 'Connexion…';

  try {
    // Envoi au serveur pour créer la partie
    idPartie = await creerPartie(nom, difficulte);

    // Mise à jour de l'entête de jeu
    affichageJoueur.textContent     = `👤 ${nom}`;
    affichageDifficulte.textContent = `🃏 ${difficulte} paires`;

    // On cache le formulaire et on montre le jeu
    formulaire.classList.add('cache');
    zoneDeJeu.classList.remove('cache');

    lancerChronometre();
    initialiserPlateau(parseInt(difficulte), collection);

  } catch (erreur) {
    afficherErreur('Impossible de contacter le serveur. Vérifie ta connexion.');
    console.error(erreur);
  } finally {
    boutonJouer.disabled = false;
    boutonJouer.querySelector('span').textContent = 'Jouer';
  }
}

// ── Appels serveur ────────────────────────────────────────────────────────────

async function creerPartie(nom, difficulte) {
  const reponse = await fetch(`${URL_API}/game`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: nom, difficulty: parseInt(difficulte) })
  });

  if (!reponse.ok) {
    throw new Error(`Erreur serveur : ${reponse.status}`);
  }

  const donnees = await reponse.json();
  console.log('Partie créée, id :', donnees.id);
  return donnees.id;
}

async function terminerPartie(pairesRestantes) {
  if (!idPartie) return;

  try {
    await fetch(`${URL_API}/game/${idPartie}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombreCoupsRestant: pairesRestantes })
    });
    console.log('Partie terminée, paires restantes :', pairesRestantes);
  } catch (erreur) {
    console.error('Erreur lors de la fin de partie :', erreur);
  }
}

// ── Abandon ───────────────────────────────────────────────────────────────────

async function abandonnerPartie() {
  arreterChronometre();

  const pairesRestantes = compterPairesRestantes();
  await terminerPartie(pairesRestantes);

  // Retour au formulaire
  zoneDeJeu.classList.add('cache');
  formulaire.classList.remove('cache');
  reinitialiserFormulaire();
}

// ── Chronomètre ───────────────────────────────────────────────────────────────

function lancerChronometre() {
  secondes = 0;
  mettreAJourAffichageTemps();
  minuterie = setInterval(() => {
    secondes++;
    mettreAJourAffichageTemps();
  }, 1000);
}

function arreterChronometre() {
  clearInterval(minuterie);
  minuterie = null;
}

function mettreAJourAffichageTemps() {
  const m = String(Math.floor(secondes / 60)).padStart(2, '0');
  const s = String(secondes % 60).padStart(2, '0');
  document.getElementById('timer').textContent = `⏱ ${m}:${s}`;
}

// ── Plateau de jeu ────────────────────────────────────────────────────────────

// Images disponibles par collection (émojis utilisés comme "images")
const collections = {
  animaux: ['🐶', '🐱', '🐸', '🐼', '🦊', '🐨', '🐯', '🦁'],
  fruits:  ['🍎', '🍌', '🍓', '🍇', '🍉', '🍑', '🥝', '🍋'],
  sport:   ['⚽', '🏀', '🎾', '🏈', '🏐', '🎱', '🏓', '🥊']
};

// Cartes actuellement retournées (en attente de vérification)
let cartesRetournees = [];

// Nombre de paires trouvées
let pairesTouvees = 0;

// Nombre total de paires dans la partie
let totalPaires = 0;

// Empêche de cliquer pendant la vérification d'une paire
let verificationEnCours = false;

function initialiserPlateau(nbPaires, collection) {
  const plateau = document.getElementById('game-board');
  plateau.innerHTML = '';

  // Remise à zéro
  cartesRetournees  = [];
  pairesTouvees     = 0;
  totalPaires       = nbPaires;
  verificationEnCours = false;

  // On récupère les images de la collection et on en prend nbPaires
  const images = collections[collection].slice(0, nbPaires);

  // On crée les paires (chaque image apparaît 2 fois) puis on mélange
  const cartes = melangerTableau([...images, ...images]);

  // On ajuste le nombre de colonnes selon la difficulté
  if (nbPaires <= 4) {
    plateau.style.gridTemplateColumns = 'repeat(4, 1fr)';
  } else if (nbPaires <= 6) {
    plateau.style.gridTemplateColumns = 'repeat(4, 1fr)';
  } else {
    plateau.style.gridTemplateColumns = 'repeat(4, 1fr)';
  }

  // On crée et ajoute chaque carte dans le plateau
  cartes.forEach((image, index) => {
    const carte = creerCarte(image, index);
    plateau.appendChild(carte);
  });
}

// Crée une carte HTML
function creerCarte(image, index) {
  const carte = document.createElement('div');
  carte.classList.add('carte');
  carte.dataset.image = image;
  carte.dataset.index = index;

  // Face cachée (dos de la carte)
  const dosCarte = document.createElement('div');
  dosCarte.classList.add('dos-carte');
  dosCarte.textContent = '🃏';

  // Face visible (l'image)
  const faceCarte = document.createElement('div');
  faceCarte.classList.add('face-carte');
  faceCarte.textContent = image;

  carte.appendChild(dosCarte);
  carte.appendChild(faceCarte);

  carte.addEventListener('click', () => clicSurCarte(carte));

  return carte;
}

// Quand le joueur clique sur une carte
function clicSurCarte(carte) {
  // On ignore si : vérification en cours, carte déjà retournée, ou déjà trouvée
  if (verificationEnCours) return;
  if (carte.classList.contains('retournee')) return;
  if (carte.classList.contains('trouvee')) return;

  // On retourne la carte
  carte.classList.add('retournee');
  cartesRetournees.push(carte);

  // Si c'est la 2ème carte retournée, on vérifie la paire
  if (cartesRetournees.length === 2) {
    verifierPaire();
  }
}

// Vérifie si les 2 cartes retournées forment une paire
function verifierPaire() {
  verificationEnCours = true;

  const [carte1, carte2] = cartesRetournees;

  if (carte1.dataset.image === carte2.dataset.image) {
    // C'est une paire ! On les marque comme trouvées
    carte1.classList.add('trouvee');
    carte2.classList.add('trouvee');
    pairesTouvees++;
    cartesRetournees  = [];
    verificationEnCours = false;

    // Est-ce que toutes les paires sont trouvées ?
    if (pairesTouvees === totalPaires) {
      gagnantPartie();
    }
  } else {
    // Ce n'est pas une paire, on les remet face cachée après 1 seconde
    setTimeout(() => {
      carte1.classList.remove('retournee');
      carte2.classList.remove('retournee');
      cartesRetournees  = [];
      verificationEnCours = false;
    }, 1000);
  }
}

// Le joueur a trouvé toutes les paires
async function gagnantPartie() {
  arreterChronometre();
  await terminerPartie(0);

  setTimeout(() => {
    alert(`🎉 Bravo ! Tu as trouvé toutes les paires en ${secondes} secondes !`);
    zoneDeJeu.classList.add('cache');
    formulaire.classList.remove('cache');
    reinitialiserFormulaire();
  }, 400);
}

// Retourne le nombre de paires pas encore trouvées
function compterPairesRestantes() {
  return totalPaires - pairesTouvees;
}

// Mélange un tableau (algorithme de Fisher-Yates)
function melangerTableau(tableau) {
  for (let i = tableau.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tableau[i], tableau[j]] = [tableau[j], tableau[i]];
  }
  return tableau;
}

// ── Formulaire ────────────────────────────────────────────────────────────────

function afficherErreur(message) {
  messageErreur.textContent = message;
}

function effacerErreur() {
  messageErreur.textContent = '';
}

function reinitialiserFormulaire() {
  champNom.value = '';
  effacerErreur();
  arreterChronometre();
  secondes  = 0;
  idPartie  = null;
}