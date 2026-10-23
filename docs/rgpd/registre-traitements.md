# Registre des traitements de données personnelles

Ce registre, prévu par l'article 30 du RGPD, recense les traitements de données personnelles
réalisés par Royaumes. Il est tenu à jour à chaque évolution du jeu qui ajoute, modifie ou
supprime une donnée personnelle, dans le même commit que cette évolution.

- Responsable du traitement : Juzanivan, dans le cadre du projet de cours, juleszanivan16@gmail.com.
- Date de dernière mise à jour : 2026-10-23.

## Sous-traitants

| Sous-traitant | Rôle | Localisation des données | Garanties à vérifier |
| --- | --- | --- | --- |
| Vercel | Hébergement de l'application, journaux techniques | Région de Francfort (fra1) pour les fonctions | Le DPA de Vercel (vercel.com/dpa) ne s'applique qu'aux offres Pro et Enterprise : le projet, sur l'offre gratuite Hobby, n'en bénéficie pas. Vercel indique que ses principales installations de traitement sont aux États-Unis, et que les données peuvent être traitées partout où Vercel ou ses sous-traitants (AWS, Azure, Google Cloud) opèrent ; pour les clients couverts, les transferts hors de l'Union reposent sur les clauses contractuelles types de 2021. L'offre Hobby est en outre réservée à un usage personnel et non commercial : un passage en production réelle demanderait l'offre Pro. |
| Neon | Hébergement de la base de données | Région de Francfort (AWS eu-central-1), choisie à la création du projet | Neon indique que tout client bénéficie automatiquement de son DPA (neon.com/dpa), désormais rattaché aux conditions de Databricks, propriétaire de Neon. Les données de la base restent dans la région choisie ; les transferts vers les États-Unis (par exemple vers les sous-traitants de supervision, comme Grafana Labs) reposent sur le Data Privacy Framework. Liste des sous-traitants : neon.com/subprocessors. |

## Traitements

| N° | Traitement | Finalité | Données | Personnes concernées | Base légale | Durée de conservation | Emplacement |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T1 | Comptes des joueurs | Permettre l'accès au jeu | Nom, adresse électronique, empreinte du mot de passe, date d'inscription | Joueurs | Exécution du contrat (conditions d'utilisation du jeu) | Jusqu'à la suppression du compte | `identity.user`, `identity.account` |
| T2 | Sessions | Maintenir la connexion ; limiter les tentatives de connexion | Adresse IP, navigateur, dates de la session | Joueurs | Exécution du contrat ; intérêt légitime (sécurité) | Jusqu'à l'expiration de la session, ou la suppression du compte | `identity.session` |
| T3 | Activité de jeu | Faire fonctionner le Village, le Donjon, le Marché et le Classement | Identifiant, nom du joueur, nom du village, actions de jeu | Joueurs | Exécution du contrat | Jusqu'à la suppression du compte ; ensuite, identifiant pseudonymisé et noms remplacés (ADR 0008) | `platform.events`, `platform.outbox`, `ranking`, `dungeon`, `market` |
| T8 | Caravanes | Acheminer des ressources entre les villages de deux joueurs, et présenter le voyage à l'expéditeur et au destinataire | Identifiant et nom de l'expéditeur ; identifiant et nom du village destinataire ; cargaison, escorte, heures et issue du voyage | Joueurs (expéditeur et destinataire) | Exécution du contrat | Jusqu'à la suppression du compte ; ensuite, identifiant pseudonymisé et noms remplacés (ADR 0008) ; le village d'un joueur effacé est retiré des destinations | `platform.events` (flux `caravan-`), `platform.outbox`, `caravan.caravans`, `caravan.destinations`, `ranking.caravan_senders` |
| T4 | Messagerie de la Taverne | Permettre aux joueurs de discuter | Contenu des messages, auteur, date | Joueurs | Exécution du contrat | Trente jours, ou jusqu'à la suppression du compte | `tavern.messages` |
| T5 | Présence dans la Taverne | Indiquer les joueurs présents | Identifiant, nom, date du dernier signal | Joueurs | Exécution du contrat | Deux minutes après le dernier signal | `tavern.presence` |
| T6 | Registre des effacements | Démontrer la réalisation des effacements | Date de l'effacement, nombre d'événements réécrits ; aucune donnée sur le joueur | Aucune personne identifiable | Obligation légale (responsabilité, article 5) | Illimitée | `platform.erasures` |
| T7 | Journaux techniques | Diagnostiquer les erreurs, assurer la sécurité | Adresse IP, adresses des requêtes, messages d'erreur | Joueurs, visiteurs | Intérêt légitime (sécurité, maintenance) | Une heure pour les journaux d'exécution sur l'offre Hobby (un jour sur l'offre Pro), selon la documentation de Vercel | Vercel |

## Droits des personnes

| Droit | Mise en œuvre |
| --- | --- |
| Accès et portabilité (articles 15 et 20) | Page « Mes données » : export JSON de toutes les données du joueur |
| Effacement (article 17) | Page « Mes données » : suppression du compte, effective dans tous les modules |
| Rectification (article 16) | Non mis en œuvre : le nom d'un joueur ne peut pas encore être modifié |
