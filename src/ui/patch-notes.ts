/**
 * Notes de version annoncées par le crieur public, de la plus récente à la plus ancienne.
 * Elles sont écrites pour les joueurs ; le fichier CHANGELOG.md, à la racine du dépôt, en est
 * la copie destinée aux développeurs, et un test vérifie que les deux annoncent les mêmes
 * versions.
 */
export type PatchNote = {
  /** Numéro de version, au format majeur.mineur. */
  version: string
  /** Date de publication, au format AAAA-MM-JJ. */
  date: string
  /** Titre de l'annonce. */
  title: string
  /** Nouveautés, une phrase chacune. */
  changes: string[]
}

export const PATCH_NOTES: PatchNote[] = [
  {
    version: '1.2',
    date: '2026-10-23',
    title: 'Les caravanes prennent la route',
    changes: [
      'Le relais des caravanes ouvre près du village : envoyez jusqu’à 500 ressources à un autre seigneur, trois caravanes à la fois.',
      'Engagez des gardes ou des chevaliers : plus l’escorte est forte, moins les brigands osent attaquer. La jauge du relais indique le risque avant le départ.',
      'Suivez votre caravane sur la route, de profil, de la porte du village à celle du destinataire, et assistez à l’attaque si elle a lieu.',
      'Une caravane attaquée revient avec ce que les brigands ont laissé : au moins la moitié de chaque ressource.',
      'Le classement compte désormais les caravanes livrées par chaque joueur.',
      'Le crieur public annonce les nouveautés du royaume, depuis le menu du château.',
    ],
  },
  {
    version: '1.1',
    date: '2026-10-23',
    title: 'Le royaume prend vie',
    changes: [
      'Le village s’affiche en plein écran : on se rend dans chaque lieu en cliquant sur son bâtiment.',
      'Chaque lieu a son décor : la place du Marché, la salle de la Taverne, l’entrée du Donjon, la salle des trophées et les archives du château.',
      'On quitte un lieu en cliquant sur le décor, ou par la touche Échap ; sur mobile, par la croix en haut de l’écran.',
      'Cliquez sur le soleil ou sur la lune pour passer du jour à la nuit.',
      'Les villageois circulent entre les bâtiments, et la mare s’anime quand on la touche.',
      'Chaque unité produite s’affiche au-dessus de la scierie, de la carrière et de la mine, et une flèche signale les bâtiments que vous pouvez améliorer.',
    ],
  },
  {
    version: '1.0',
    date: '2026-10-23',
    title: 'Fondation du royaume',
    changes: [
      'Fondez votre village, produisez du bois, de la pierre et de l’or, et améliorez vos bâtiments.',
      'Explorez le Donjon à plusieurs, avec des compagnons, en trois niveaux de difficulté.',
      'Échangez vos ressources avec les autres seigneurs au Marché.',
      'Comparez-vous aux autres joueurs dans le Classement, mis à jour en temps réel.',
      'Retrouvez les autres seigneurs à la Taverne.',
      'Exportez vos données ou supprimez votre compte depuis « Mes données ».',
    ],
  },
]

/** Version la plus récente : le menu du château signale son annonce tant qu'elle n'a pas été lue. */
export const LATEST_VERSION = PATCH_NOTES[0].version

/** Clé du navigateur sous laquelle est retenue la dernière version lue par le joueur. */
const SEEN_KEY = 'royaumes.patch-notes.seen'

/** Dernière version lue dans ce navigateur, ou null si elle est inconnue. */
export function seenVersion(): string | null {
  try {
    return window.localStorage.getItem(SEEN_KEY)
  } catch {
    return null
  }
}

/** Retient que le joueur a lu la dernière annonce. Sans stockage, l'annonce reste signalée. */
export function markSeen() {
  try {
    window.localStorage.setItem(SEEN_KEY, LATEST_VERSION)
  } catch {
    // Stockage indisponible (navigation privée) : rien à retenir.
  }
}
