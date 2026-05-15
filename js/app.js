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
    formulaire.classList.add('hidden');
    zoneDeJeu.classList.remove('hidden');

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
  zoneDeJeu.classList.add('hidden');
  formulaire.classList.remove('hidden');
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

function initialiserPlateau(nbPaires, collection) {
  const plateau = document.getElementById('game-board');
  plateau.innerHTML = '';
  // TODO : sera complété lors de l'étape suivante (logique des cartes)
  plateau.textContent = `Plateau de jeu — ${nbPaires} paires (collection : ${collection})`;
}

function compterPairesRestantes() {
  // TODO : sera implémenté avec la logique des cartes
  return 0;
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