// Applique le thème choisi par le joueur avant le premier affichage de la page, afin
// d'éviter un éclair du thème clair lorsqu'il a choisi le thème sombre (et inversement).
// Sans choix enregistré, le thème suit celui du système (prefers-color-scheme).
try {
  var theme = localStorage.getItem('theme')
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme
} catch (e) {}
