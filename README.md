# SAE 2.01 - GettingStarted

## Équipe
- Sadi ALAM
- Bader Mouneimneh
- Tenzin Khasamba
- Redha Hadjsaid

## Groupe de TP
Groupe 110

Voici nos 3 fonctionnalités supplémentaires :
1. Système de Leaderboard (Le "Flex")
Notre idée est de créer un tableau d'honneur persistant.

    Fonctionnement : À la fin de chaque partie gagnée, vous enregistrez le score (temps + nombre de coups) dans le localStorage.
    Le petit plus pour les jeunes : Ajoutez un bouton "Partager mon score" qui génère une chaîne de texte stylisée (ex: "🎮 Memory Pro : Niveau Difficile terminé en 42s ! Peux-tu battre @Pseudo ?") à copier-coller sur Discord ou Snapchat.
    Affichage : Un petit onglet "Classement" sur l'écran d'accueil pour voir qui est le "GOAT" du groupe de TP.
2. Duel Local (Le mode "Pause")
Pour défier un pote rapidement entre deux cours.
    Fonctionnement : Dans le menu d'accueil, ajoutez une option "Mode 2 Joueurs".
    Mécanique : Le Joueur 1 commence. S'il trouve une paire, il rejoue. S'il échoue, c'est au tour du Joueur 2.
    Interface : Prévoyez deux zones de score bien distinctes en haut de l'écran (ex: bleu pour J1, rouge pour J2) pour que l'on sache immédiatement qui mène la danse.
3. Sauvegarde de Session (Anti-Rage Quit)
   Rien de plus frustrant qu'un rafraîchissement de page (F5) qui efface tout.
   Fonctionnement : À chaque clic sur une carte, vous sauvegardez l'état actuel du plateau (quelles cartes sont retournées, le temps écoulé, le nombre de coups) dans le localStorage.
   Le "Plus" technique : Au chargement de la page, l'application vérifie s'il existe une partie en cours. Si oui, elle propose un bouton "Reprendre la partie" ou "Nouvelle partie". Cela prouve au correcteur que vous maîtrisez la persistance des données.