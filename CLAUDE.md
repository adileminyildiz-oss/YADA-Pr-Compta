# CLAUDE.md — YADA / Précompta (passation Claude Code)

> Ce fichier est lu automatiquement par Claude Code au lancement. Il décrit le projet, les **règles de travail**, l'architecture, et **la dernière mise à jour**. La source de vérité reste **`precompta.html`** (un seul fichier).

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

## 🟢 Dernière mise à jour — Éditeur d'écritures : saisie directe « tableur » (champs plats, clic droit pour insérer, date sur toutes les lignes, colonnes fixes) — v218
**Quoi :** l'**éditeur d'écritures** (`.ec-sage`) devient une vraie grille de saisie directe, plus simple : (1) **saisie directe sur le texte ET les montants** — champs **totalement plats**, **aucune bulle / aucun cercle / aucun halo** au focus (juste un léger fond bleu) ; (2) **insérer une ligne au CLIC DROIT** (menu contextuel « ↧ Insérer une ligne » / « 🗑 Supprimer la ligne ») — le **bouton ✕ (cercle rouge)** par ligne est **masqué** ; (3) la **date** de l'écriture est **répétée sur toutes les lignes** (jusqu'au solde) en **texte éditable (jj/mm/aaaa)** — **plus aucun sélecteur de date** ; (4) **tableau à colonnes FIXES** (`table-layout:fixed`) : tout reste en place quand on **agrandit / redimensionne** la fenêtre.

**Où / comment :** `yada-addon113` — `<style id="ec-tableur-mod">` (colonnes `cw-*` fixes, champs plats, ✕ masqué, menu `#ec-ctx`) + helpers `window.ecSetDateTxt(id,v)` (parse jj/mm/aaaa → ISO) et `window.ecInsertLine(id,i)` + écouteur `contextmenu` (capture) sur `tr.ec-r` de `#ec-win`. `ecRender` génère désormais `data-eid`/`data-li` par ligne, la **date-texte sur chaque ligne** (`ec-datetxt`, plus de `type=date`) et un **`<colgroup>`** à largeurs fixes. Aucune logique comptable modifiée. Badge → **v218**.

---

## 🟢 MAJ précédente — Éditeur d'écritures (Compte auxiliaire / Consultation) : refonte sobre façon Sage aux couleurs YADA — v217
**Quoi :** l'**éditeur d'écritures** façon Sage (`.ec-sage` — Compte auxiliaire, double-clic sur un compte, « Saisir une opération ») est rendu **plus sobre, plus dense et plus léger**, au plus près du **format Sage** mais aux **couleurs YADA (bleu nuit + bleu Crystal)** : (1) suppression des **bandeaux « Écriture i / N · Pièce · Équilibrée ✓ »** (moins de texte, moins de cadrage) ; (2) une **seule ligne bleu Crystal (#1e90ff, 2px)** fine **après chaque écriture SOLDÉE** (la logique v216 est inchangée : aucune ligne après une écriture non soldée) ; (3) **lignes serrées + champs compacts** (densité façon journal Sage) ; (4) ligne d'actions **allégée** (sans fond ni « Soldée ✓ », bouton « + Ajouter » discret — « Solder l'écriture » conservé) ; (5) en-tête/pied **aplatis**.

**Où / comment :** `yada-addon112` injecte `<style id="ec-epure-mod">` en fin de `<head>` (prioritaire dans la cascade) ; **100% CSS**, aucune logique modifiée (séparateur conditionné au solde + fermeture bloquée tant qu'une écriture n'est pas soldée restent tels quels). Badge → **v217**.

---

## 🟢 MAJ précédente — Consultation / journal éditable : pas de quitter une écriture non soldée + ligne bleue seulement après écriture soldée — v216
**Quoi :** dans l'éditeur de journal/compte (Consultation des comptes), (1) la **ligne bleue de séparation** n'apparaît **qu'après une écriture SOLDÉE** (équilibrée) — déjà le cas (`if(ok)` dans `ecRender`, ligne `ec-redrow`/`ec-soldee`) ; les écritures soldées avant une écriture modifiée gardent leur ligne ; (2) **impossible de fermer la page** tant qu'une écriture n'est pas soldée — un **message d'erreur** s'affiche à chaque tentative de sortie, avec la pièce et l'écart Débit/Crédit. Aucun changement de format/encadrement.

**Où / comment :** `ecFermer` — ajout d'un contrôle : si une écriture a `Σdébit ≠ Σcrédit` (≥ 0,005), `alert(...)` détaillé et `return` (fermeture bloquée). La logique de la ligne bleue (uniquement après écriture équilibrée) était déjà en place. Badge → **v216**.

---

## 🟢 MAJ précédente — Charges & Paie : suppression des fiches de paie et des tableaux/documents de charges — v214
**Quoi :** boutons **🗑 Supprimer** ajoutés pour retirer une **fiche de paie** (depuis la liste), un **bulletin déposé**, et un **document de charges** déposé (journal de paie). Les écritures de paie/charges restaient déjà supprimables (`pjSupprimer`, `bpSupprimerOD`, `cpSupprimerMois`, `pjReset`).

**Où / comment :** `bpCard` — bouton 🗑 par fiche (`bpSupprimer`) + 🗑 par bulletin déposé (`bpSupprPiece` retire la pièce de `db.parametres.pieces`) ; `pjCard` (addon93) — `pjSupprDoc(m)` retire le document de charges du mois (`d.doc` + pièce `cat:'paie'`). Badge → **v214**.

---

## 🟢 MAJ précédente — Tiers : montants réels par ligne + un seul tiers par nom (auto-fusion) + ligne bleue dans la Consultation — v207
**Quoi :** (1) la liste des Tiers affiche le **vrai total** (CA TTC clients / Dépensé TTC fournisseurs) calculé depuis les **écritures** du compte de tiers ; (2) les doublons de même nom sont **fusionnés automatiquement en un seul compte** (tous les montants regroupés) ; (3) une **ligne bleue** sépare chaque écriture dans la **Consultation des comptes** (grand-livre).

**Pourquoi :** les lignes de tiers affichaient 0 pour les comptes alimentés par le FEC (pas de `db.factures`) ; plusieurs « HABITAT CONCEPT » subsistaient ; et la ligne bleue n'apparaissait pas dans le grand-livre.

**Ce qu'il fait :**
- **`statsTiers`** : total depuis les écritures sur `c9(compteAux)` — client = Σ débits, fournisseur = Σ crédits (+ TVA estimée) ; repli sur `db.factures`.
- **`auxLignes` corrigé** : rattache aussi les lignes portées **directement sur le compte auxiliaire** (FEC + factures depuis v201), pas seulement le collectif via facture → le grand-livre montre tous les mouvements du tiers.
- **Auto-fusion** (`tiersConsoliderDoublons`, appelée au rendu de la page Tiers) : fusionne les groupes de même nom normalisé en **un seul** compte (déplace les lignes `c9(compteAux)` des doublons vers le maître, rattache factures/docs/banque/règlements) ; **sécurité** : ne fusionne pas si SIRET différents (alerte + fusion manuelle). Bouton « Fusionner » manuel conservé.
- **Ligne bleue** entre écritures (`lx-ecr-sep`) dans le grand-livre auxiliaire (`auxLignes`) **et** la consultation lecture seule (`#cl-overlay`).

**Où / comment :** `statsTiers`, `auxLignes`, `_fusionGroupeTiers`/`tiersConsoliderDoublons` + greffe `pageTiers`, CSS `lx-ecr-sep` (addon110). Badge → **v207**.

---

## 🟢 MAJ précédente — Tiers : doublons clients/fournisseurs fusionnés en UN seul compte (montants regroupés) + dédoublonnage à la réception — v206
**Quoi :** quand un client (ex. **HABITAT CONCEPT**) apparaît plusieurs fois dans les tiers, la **fusion** ne garde **qu'une fiche** et **regroupe tous les montants saisis** sur **ce compte tiers** (les lignes d'écriture du compte auxiliaire des doublons sont déplacées vers celui de la fiche conservée). La **réception** des factures clients ne crée plus de doublon (réutilisation du tiers existant).

**Pourquoi :** les factures clients reçues créaient un nouveau client à chaque fois (plusieurs « HABITAT CONCEPT ») ; l'utilisateur veut une alerte de doublon, une seule fiche par client et tous les montants regroupés sur ce compte.

**Ce qu'il fait :**
- **Alerte doublon** (déjà existante) : tag **DOUBLON** + carte « Doublons fournisseurs / clients » (`scanDoublonsTiers`/`blocDoublonsTiers`, normalisation du nom).
- **Fusion corrigée** (`tiersFusionner`) : choisit la fiche maître (la plus active / compte personnalisé), rattache factures/`docs`/écritures/banque/règlements, **et déplace les lignes d'écriture `c9(compteAux)` des doublons vers `c9(compteAux)` du maître** → tous les montants sur un seul compte tiers. `compteAuxCustom=true` sur le maître.
- **Dédoublonnage à la création** : `integrerFEC`/`trouverOuCreerTiers` (FEC), `ficheValider` (dépôt « client/fournisseur inconnu ») et `faClientEmettre` (nouveau client) **réutilisent** un tiers du même nom (comparaison **normalisée** : majuscules, sans accents ni ponctuation) au lieu d'en recréer un.

**Où / comment :** `tiersFusionner` (consolidation des lignes via `c9`), `trouverOuCreerTiers`/`ficheValider`/`faClientEmettre` (réutilisation par nom normalisé). Badge → **v206**.

**Limites :** le rapprochement se fait sur le **nom normalisé** ; deux entités réellement distinctes au même nom devraient être distinguées manuellement (bouton « Laisser »).

---

## 🟢 MAJ précédente — Import FEC : écritures classées par libellé (OD PAIE / OD CHARGES / OD TVA / OD) + ligne bleue entre écritures — v205
**Quoi :** à l'import FEC, chaque écriture d'O.D. est placée dans le **bon journal d'après son libellé** : « OD PAIE » → **OD PAIE (ODP)**, charges (CHARGE/COTISATION/URSSAF/PATRONAL) → **OD CHARGES (ODC, nouveau journal)**, TVA → **OD TVA (ODTVA)**, le reste → **OD (Opérations diverses)**. Les écritures de charges générées par la paie vont aussi en **ODC**. Une **ligne bleue** sépare chaque écriture dans le Journal comptable.

**Où / comment :**
- Nouveau journal **`ODC` (OD CHARGES)** dans `journauxDefaut`.
- `fecJournalMoteur(code, jlib, ecrLib)` classe les O.D. par libellé (TVA → ODTVA ; CHARGE/COTISATION/URSSAF/PATRONAL → ODC ; PAIE/SALAIRE/BULLETIN → ODP ; sinon OD) ; `integrerFEC` transmet le libellé d'écriture.
- Paie : `posterPaieMois` et `bpGenererODMois` postent l'**OD CHARGES en journal ODC** ; idempotence (`paieDejaPostee`, `bpODFaite`/`bpSupprOD`) gère ODP **et** ODC.
- Affichage : `ODC` ajouté à `sgJournaux`, `sgJournalGrid`, `journauxDoc`, `centralisateurDoc`, filtre éditeur.
- `yada-addon110` : ligne bleue (`border-top:2px #1e90ff`) entre chaque `.ecr` de la page Journal comptable (le grand-livre/Consultation ont déjà `sgj-ecr-sep`). Badge → **v205**.

**Limites :** la classification se base sur des mots-clés du libellé/journal FEC (tolérante mais heuristique).

---

## 🟢 MAJ précédente — Charges & Paie : 2 onglets (Paie / Charges) + vérification du bulletin avant génération — v204
**Quoi :** le module **Charges & Paie** est organisé en **2 onglets — « Paie (bulletins de salaire) » et « Charges (cotisations & organismes) »** — et la modale d'un bulletin affiche un **panneau de Vérification & Validation** avant la génération de l'écriture de paie.

**Pourquoi :** l'utilisateur veut déposer un bulletin (scan/OCR/saisie), voir toutes les informations reprises et **vérifiées** (société employeur, période, salarié, compte 421, cumuls, taux, montants, cotisations), puis valider et générer l'écriture.

**Ce qu'il fait :**
- **Onglets Paie / Charges** (`cpTabPC`) : « Paie » = bulletins de salaire (`.bp-card` : dépôt → OCR → fiche éditable → génération) ; « Charges » = journal de paie + cotisations patronales / organismes (cartes héritées).
- **Panneau de vérification** (`bpVerifHTML`, injecté dans `bpVoir`) : 🏢 **Société employeur** (raison, adresse, SIRET), 📅 **Période**, 👤 **Salarié** (nom, n° SS, emploi, statut), 💼 **Compte de personnel 421** (net à payer), 📊 **Cumuls annuels** (brut / net imposable / net à payer / charges patronales, sur les bulletins de l'année), ✅ **Contrôle des calculs** : chaque cotisation (montant = base × taux, parts salariale & patronale) + total cotisations + net à payer, avec ✓/✗ et l'écart attendu. Badge « Calculs cohérents ✓ » global.
- L'écriture (OD de paie + OD de charges) se génère ensuite via le panneau existant (addon106).

**Où / comment :** `yada-addon109` — réorganise les enfants de `.cp-scroll` en 2 `.cp-pane` + barre `.cp-pc-tabs` (greffe `pageChargesPaie`) ; `bpVerifHTML` réutilise `window.bpCalc` (exposé par addon106) ; greffe sur `bpVoir` pour insérer le panneau avant les « Écritures proposées ». CSS `<style id="cp-pc-mod">`. Badge → **v204**.

**Limites :** l'OCR des bulletins scannés nécessite le réseau (addon52) ; le contrôle vérifie la cohérence base × taux = montant (tolérance 0,02 €) — les taux/bases restent modifiables sur la fiche.

---

## 🟢 MAJ précédente — Sociétés (portefeuille) : bouton « Accéder à Qonto » — v203
**Quoi :** dans **Sociétés (portefeuille)**, un bouton cliquable **« 🏦 Accéder à Qonto »** ouvre le compte bancaire **Qonto** (application `https://app.qonto.com`) dans un nouvel onglet. Le lien « Accéder à Qonto » de chaque ligne de dossier ouvre désormais réellement Qonto (au lieu d'ouvrir le dossier).

**Où / comment :** `accederQonto(url)` (`window.open(url||'https://app.qonto.com','_blank','noopener,noreferrer')`) ; bouton ajouté dans l'entête de la carte « Portefeuille d'entreprises » (`cabinetApercu`) ; lien par ligne (`cabinetTable`) → `accederQonto(d.qontoUrl||'')` (URL Qonto propre au dossier si renseignée, sinon l'app générique). Badge → **v203**.

---

## 🟢 MAJ précédente — Facturation : « Conditions de paiement » à la place du délai en jours — v202
**Quoi :** dans la création de facture (Espace Client **et** fenêtre cabinet), la case **« Délai de paiement (jours) »** est remplacée par une liste **« Conditions de paiement »** (À réception, 8 / 15 / 30 / 45 / 60 jours, 30 / 45 jours fin de mois). La date d'échéance se calcule automatiquement selon la condition choisie ; la condition est imprimée sur la facture.

**Où / comment :** `yada-addon108` — `FA_CONDITIONS`, `faCondDefaut`, `faCondOptions`, `faEcheanceFromCond` (+ `lastDayOfMonthISO` pour « fin de mois ») ; `faEcheanceAuto`/`nfEcheanceAuto` lisent `fa-cond`/`nf-cond`. Champs `fa-cond`/`nf-cond` (selects) à la place de `fa-delai`/`nf-delai` dans `faClientCreer`, `pageFacturation`, `nfFormHTML`. `emettre` enregistre `doc.conditions` (affiché par `docHTML`). Réglage **« Conditions de paiement par défaut »** dans `factParamCard`/`factParamSave` (`db.societe.conditionPaiement`, + `delaiPaiement` dérivé pour compat). Badge → **v202**.

---

## 🟢 MAJ précédente — Facture fournisseur : écriture ACH avec le compte de tiers complet (401GASO00) — v201
**Quoi :** l'**écriture d'achat** (journal ACH), en aperçu **et** générée, utilise désormais le **compte de tiers complet (auxiliaire)** — ex. **401GASO00** — au lieu du collectif 401000000, et l'aperçu affiche les comptes en **codes 9 chiffres** dans l'ordre **401 (tiers) / 445xxx (TVA) / 606xxx (charge)**.

**Pourquoi :** l'utilisateur veut voir, dans « l'écriture qui sera générée », le compte de tiers réel (401GASO00) puis la TVA déductible puis le compte de charge.

**Où / comment :**
- `posterFacture` remplace la ligne collective 401/411 par `tiers.compteAux` (centralisé — vaut pour achats **et** ventes, manuels comme déposés ; les dépôts le faisaient déjà via `posterFactureAux`).
- `majAc` (aperçu ACH) : ordre **tiers (compteAux, `c9`) / TVA (`tiers.compteTVA`, `c9`) / charge (`c9`)**, libellés complets. `validerAchat` transmet `tiers.compteTVA`. Aperçu autoliquidation aligné sur le compte auxiliaire.
- Les cartes de comptabilisation des **dépôts** restent pré-remplies (OCR/scan/saisie, addon48/50) et utilisent ces mêmes comptes. Badge → **v201**.

**Limites :** le code TVA exact (ex. 445667000) et le compte de charge (ex. 606200000) proviennent de la **fiche du tiers** (compteTVA / compteContre) — à régler sur la fiche pour qu'ils apparaissent tels quels.

---

## 🟢 MAJ précédente — Facture : échéance auto (émission + délai) + adresse société sur 2 lignes — v200
**Quoi :** (1) la **date d'échéance** se calcule **automatiquement** = date d'émission + **délai de paiement** (30 j par défaut, modifiable) ; recalcul à chaque changement de la date d'émission OU du délai. (2) l'**adresse de la société** (ex. ALR CONSEIL) est **mise à la ligne** sur la facture A4 (rue / code postal + ville).

**Où / comment :**
- `yada-addon108` : `addDaysISO(iso,n)`, `faDelaiDefaut()` (= `db.societe.delaiPaiement` ?? 30), `faEcheanceAuto()` (champs `fa-*`) et `nfEcheanceAuto()` (fenêtre cabinet `nf-*`). Champs **« Délai de paiement (jours) »** ajoutés dans `faClientCreer`, le formulaire `pageFacturation` et la fenêtre `nfFormHTML` ; `fa-date`/`nf-date` `onchange` → recalcul de l'échéance ; valeurs initiales d'échéance déjà calculées. Réglage **« Délai de paiement par défaut »** dans `factParamCard`/`factParamSave` (`db.societe.delaiPaiement`).
- `adrLignes(adresse,cp,ville)` (avant `docHTML`) : coupe la rue / le code postal (5 chiffres) — sinon vers le 15e caractère sans couper un mot ; utilisé pour le bloc société **et** client dans `docHTML`.
- Badge → **v200**.

---

## 🟢 MAJ précédente — Facturation cabinet : liste des factures agrandie (pleine largeur, 25/page) — v199
**Quoi :** la **liste des factures de génération** (page « Client » côté cabinet) est **agrandie** : affichée en **pleine largeur** (au lieu d'une colonne étroite avec défilement horizontal) et **25 factures par page** au lieu de 10.

**Où / comment :** `addon73` ne **scinde plus** `pageFacturation` en 2 colonnes (cabinet) → la liste `factureListe` occupe toute la largeur ; `factureListe` : `per` 10 → **25**. `addon73` continue de scinder `pageAchats`. Badge → **v199**.

---

## 🟢 MAJ précédente — Facturation client : retrait de la « saisie rapide » (page épurée) — v198
**Quoi :** suppression du module **« Émettre un document client (saisie rapide) »** de la page **Facturation client** (menu « Client ») pour une présentation plus paisible et harmonieuse.

**Où / comment :** `pageFacturation` ne rend plus `formulaireRapide()` ; le bouton **« ↧ Saisir »** (qui reprenait une facture dans la saisie rapide) est retiré de `factureListe` — la comptabilisation reste accessible via **« ⚙️ Générer »** sur chaque ligne. Sous-titre de la page mis à jour. `formulaireRapide`/`faReprendre` restent définis (inutilisés) ; aucune autre fonction impactée. Badge → **v198**.

---

## 🟢 MAJ précédente — Module Client : facture créée → liste + génération en un clic — v197
**Quoi :** refonte du **Module Client (Facturation)**. Une facture de vente créée est **immédiatement ajoutée à la liste « Mes factures de vente »** (toujours visible), puis **son écriture se génère depuis cette liste** (tableau de génération, pré-rempli) au lieu d'être comptabilisée automatiquement.

**Pourquoi :** l'utilisateur veut voir la facture toujours dans la liste et pouvoir la générer/pré-saisir dans un tableau de génération, avec une interface simple et intuitive.

**Ce qu'il fait :**
- **« Créer la facture »** crée le document (statut *valide*, **non comptabilisé**) → il apparaît aussitôt dans **« Mes factures de vente »** avec le statut **« À générer »** (ligne surlignée).
- **« ⚙️ Générer l'écriture »** dans la liste comptabilise la facture (`genererEcritureDoc` → écriture VTE équilibrée, TVA collectée transmise) ; la facture **reste dans la liste** et passe à **« Comptabilisée ✓ »**.
- KPIs : Total TTC facturé · À générer · Comptabilisées. Actions par ligne : Voir / Générer / Envoyer / → Facture (devis).

**Où / comment :** `emettre(valider, skipGen)` — nouveau paramètre `skipGen` (côté client) ne poste pas l'écriture à la validation. `faClientEmettre` appelle `emettre(valider,true)`. Nouvelle fonction `faClientFactures()` (liste complète + génération) remplace `faClientRecentes`/`suiviFacturesVente` dans `pageFacturationClient` (colonnes « Créer / Déposer » | « Mes factures de vente »). Badge → **v197**.

---

## 🟢 MAJ précédente — Lisibilité des listes déroulantes (option) — v196
**Quoi :** correctif d'**affichage** des menus déroulants natifs (`<select>`/`<option>`). Sur le thème noir, le texte des options (ex. « Compte de contrepartie ») était **peu lisible** (terne) car les `<option>` n'avaient aucune couleur explicite.

**Où / comment :** `yada-addon107` injecte un `<style id="option-readability">` qui force, **par thème**, un fond opaque + un texte contrasté sur les `<option>` (noir : fond bleu nuit `#0c1a2a` / texte clair ; clairs : fond blanc / texte foncé) et une **surbrillance bleue** (`#0a64d6`, texte blanc) sur l'option sélectionnée/survolée. 100% additif. Badge → **v196**.

---

## 🟢 MAJ précédente — Tiers : numéro de compte (401/411) modifiable — v195
**Quoi :** dans la fiche **Modifier — <tiers>**, on peut désormais **changer le numéro de compte tiers** (401XXXX pour un fournisseur, 411XXXX pour un client). La renumérotation **met à jour les écritures existantes** du tiers pour qu'elles restent rattachées.

**Où / comment :** `tiersEditer` ajoute le champ `te-aux` ; `tiersEnregistrer` valide le préfixe (401/411 selon le type), l'unicité (aucun autre tiers), la longueur (≤9), puis remplace `c9(ancien)` par `c9(nouveau)` dans toutes les lignes d'écriture (avec confirmation si des écritures existent) et marque `t.compteAuxCustom=true`. `migrerAuxTiers` **préserve** les numéros saisis manuellement (ne les régénère plus). Badge → **v195**.

---

## 🟢 MAJ précédente — Création de dossier : Statuts facultatifs — v194
**Quoi :** lors de la **création d'un dossier**, les **Statuts ne sont plus obligatoires** (seul le K-bis reste requis). On peut créer le dossier sans joindre les statuts et les ajouter plus tard.

**Où / comment :** `creerDossierComplet()` — suppression du blocage `if(!cdDocs.statuts)…` ; `statutsRecu/statutsNom/statutsPdf` renseignés seulement si un fichier est joint ; libellés du formulaire (« Statuts (facultatif) ») et toast adaptés. Badge → **v194**.

---

## 🟢 MAJ précédente — Paie : écritures visibles (carte Bulletins + Journal comptable) — v192
**Quoi :** correctif de **visibilité des écritures de paie**. Les OD de paie / OD de charges (journal `ODP`) sont désormais affichées **directement dans la carte Bulletins de paie** (pas seulement dans la modale du bulletin) et apparaissent dans le **Journal comptable imprimable** et le **centralisateur**.

**Pourquoi :** l'utilisateur ne voyait pas les écritures générées — elles n'apparaissaient que dans la modale du bulletin, et le journal comptable imprimable (`journauxDoc`) n'affichait que `ACH/VTE/BQ/OD` (pas `ODP`/`ODTVA`).

**Ce qu'il fait :**
- La carte **Bulletins de paie** intègre le panneau **« Écritures proposées / ✅ Écritures comptabilisées »** (détail OD de paie + OD de charges, statut, bouton générer/régénérer/supprimer) en plus de la modale.
- Indication explicite « Retrouvez ces écritures dans le **Journal comptable** (filtre OD) et la **Consultation des comptes** (641, 645, 421, 431, 437, 442) ».
- `journauxDoc`/`centralisateurDoc` ajoutent **`ODP` (OD - PAIE)** et **`ODTVA` (OD - TVA)** quand des écritures existent (corrige aussi la visibilité de la paie/TVA héritée).

**Où / comment :** `yada-addon106` — `bpODApercu(m)` injecté dans `bpCard` ; `journauxDoc`/`centralisateurDoc` : liste de journaux = `['ACH','VTE','BQ','OD']` + `ODP`/`ODTVA` présents. Badge → **v192**.

---

## 🟢 MAJ précédente — Paie : génération de la fiche + proposition des OD de paie ET de charges — v191
**Quoi :** après la saisie d'une fiche de paie, YADA **génère le bulletin** (aperçu A4) puis **propose de comptabiliser** l'**OD de paie** (salaires) **et** l'**OD de charges** (patronales) du mois — deux écritures distinctes et équilibrées.

**Pourquoi :** l'utilisateur veut, suite à la saisie d'une fiche, voir la fiche générée et se voir proposer la génération des écritures d'OD de paie et d'OD de charges.

**Ce qu'il fait (description fonctionnelle) :**
- Bouton **« ✅ Générer la fiche de paie »** dans l'éditeur → ouvre l'**aperçu A4** du bulletin et, en dessous, un panneau **« Écritures proposées »** montrant le détail des deux écritures (OD de paie + OD de charges) agrégeant **toutes les fiches du mois**, avec un bouton **« ⚙️ Générer l'OD de paie et l'OD de charges »**.
- **OD de paie** (équilibrée) : 641 (brut) + 648 (primes panier/transport) au débit = 645100000/645300000 (cotisations salariales) + 442100000 (PAS) + 421 (net à payer) au crédit.
- **OD de charges** (équilibrée) : 645100000/645300000 (charges patronales) au débit = 431000000 (URSSAF) + 437300000 (caisses retraite/prévoyance) au crédit.
- **Idempotent par mois** : régénérer **remplace** les écritures « OD PAIE / OD CHARGES » du mois (jamais de doublon) ; statut affiché (« déjà comptabilisées ») ; bouton de suppression.

**Où / comment (description technique) :**
- `yada-addon106` : `bpCalc` expose la décomposition salariale/patronale par organisme (`salUrssaf/patUrssaf/salPrev/patPrev/salCsg/patCsg`) ; `bpAgg(m)` agrège les fiches du mois ; `bpLignesPaie`/`bpLignesCharges` construisent les deux écritures équilibrées ; `bpGenererODMois(m)` supprime puis re-poste « OD PAIE/OD CHARGES »+pièce via `posterOD` (journal ODP, dernier jour du mois) ; `bpFinaliser(id)` enregistre + ouvre `bpVoir` (A4 + aperçu des OD via `bpODApercu`). `bpODStatut(m)` / `bpSupprimerOD(m)`.
- Badge de version → **v191**.

**Limites assumées :** une seule OD de paie et une seule OD de charges par mois (agrégat de toutes les fiches) ; net à payer = brut − cotisations salariales − PAS + primes non soumises ; taux par défaut indicatifs, modifiables ligne par ligne.

---

## 🟢 MAJ précédente — Charges & Paie : bulletins de paie éditables (modèle français) + OD de paie multi-mois — v190
**Quoi :** un module **Bulletins de paie** dans Charges & Paie qui **génère des fiches de paie au modèle français** dont **tous les éléments sont modifiables** (gains, cotisations salariales & patronales, primes, PAS), pour **plusieurs salariés** et **plusieurs mois**, avec **récupération de plusieurs bulletins déposés** et alimentation automatique du **Journal de paie** (addon93) pour produire les **OD de paie**.

**Pourquoi :** l'utilisateur veut que YADA repère les bulletins de paie déposés, génère des fiches de paie entièrement éditables (sur le modèle fourni), récupère les informations de plusieurs fiches et de plusieurs mois de journal de paie pour les OD.

**Ce qu'il fait (description fonctionnelle) :**
- **Fiche de paie éditable** (`yada-addon106`) : création/édition d'un bulletin au modèle français (employeur depuis `db.societe`, salarié, gains avec nombre/taux/montant, **table de cotisations** où base, taux salarial, part salariale, taux patronal, part patronale sont **tous modifiables** — ajout/suppression de lignes), primes non soumises (panier, Navigo), **PAS** (taux ou montant). Totaux en direct : brut, cotisations salariales, **net imposable**, **net à payer**, charges patronales, coût employeur.
- **Aperçu A4 + impression** du bulletin (`bpVoir`/`bpImprimer`).
- **Multi-salariés / multi-mois** : chaque fiche est rattachée à un mois ; la liste du mois affiche brut/net imposable/net à payer/charges patronales + totaux.
- **Dépôt de plusieurs bulletins** : `bpDepot` (sélection multiple) stocke dans `db.parametres.pieces` (cat `bulletin`) ; **OCR auto quand connecté** (réutilise `window.ocrImage`) → crée une fiche pré-remplie ; repli saisie manuelle (scans sans couche texte).
- **OD de paie du mois** : `bpGenererODMois` **agrège toutes les fiches du mois**, reporte les totaux dans `db.parametres.paieJournal[mois]` (clés `brut/urssaf/csg/prev/panier/navigo/pas`) et appelle **`pjGenerer`** (addon93) → écriture **OD PAIE équilibrée** (641 / 6451 / 6453 / 648 / 4421 / 421).

**Où / comment (description technique) :**
- `yada-addon106` : greffe sur `pageChargesPaie` (injection de `bpCard()` avant la carte `.pj-card`). Données dans `db.parametres.bulletins.fiches[]` (chaque fiche : salarié, `gains[]`, `cotis[]` avec org `urssaf/prev/csg` + `ded`, panier/navigo/PAS). `bpCalc(f)` calcule brut/net/charges + les clés du Journal de paie ; `bpGenererODMois` agrège puis délègue à `pjGenerer` (réutilisation testée, OD garantie équilibrée). Rendu A4 `bpBulletinHTML`, CSS `<style id="bp-mod">`. 100% additif.
- Badge de version → **v190**.

**Limites assumées :** les **taux de cotisation par défaut sont indicatifs** (modèle simplifié 2024) et **entièrement modifiables** ligne par ligne ; l'OCR des bulletins **scannés (images)** nécessite le réseau (Tesseract.js, addon52), les PDF scannés sans couche texte → saisie manuelle ; l'OD de paie suit le mapping pré-compta de l'addon93 (net à payer en équilibrage), garanti équilibré.

---

## 🟢 MAJ précédente — Facture Client : aperçu A4 en direct + indemnité de recouvrement 40 € — v189
**Quoi :** deux finitions du module **Facture Client** : (1) une **prévisualisation au format A4 mise à jour en direct** pendant la création d'une facture/devis, et (2) l'ajout automatique de l'**indemnité forfaitaire de recouvrement (40 €)** au montant dû de chaque facture **en retard** dans le **Suivi des règlements**.

**Pourquoi :** l'utilisateur veut voir la facture exactement telle qu'elle sera imprimée pendant qu'il la saisit (désignations, RIB, conditions), et veut que le montant réclamé en cas d'impayé inclue l'indemnité de 40 € déjà mentionnée sur la facture (art. L441-10 / D441-5 du Code de commerce).

**Ce qu'il fait (description fonctionnelle) :**
- **Aperçu A4 en direct** (`yada-addon105`) : sous le formulaire d'émission, un panneau « 📄 Aperçu de la facture (format A4 · mis à jour en direct) » rend la **vraie page A4** (`docHTML`) à chaque frappe — désignations saisies, Qté masquée pour les **prestations** / affichée pour les **produits/marchandises**, totaux HT/TVA/TTC, conditions (TVA, escompte, indemnité 40 €), **RIB en bas**. N° de facture prévisualisé sans consommer le compteur.
- **Indemnité 40 € dans le Suivi des règlements** (`yada-addon98`) : chaque facture en retard se voit ajouter `frais = db.societe.fraisRecouvrement ?? 40` ; nouvelles colonnes **Frais (40 €)** et **Total dû** dans les tableaux Clients/Fournisseurs ; KPI « Total dû (frais inclus) » + « Dont indemnités de recouvrement » ; l'alerte impayés (≥3 retards) et ses pièces jointes affichent restant + frais + total dû.

**Où / comment (description technique) :**
- `yada-addon105` : greffe sur le **binding global** `faMaj` (`var _f=faMaj; faMaj=function(){…; refreshA4();}`) — intercepte aussi l'appel interne de `render` (`if(current==='facturation'…) faMaj()`), donc l'aperçu se peint au premier affichage ET à chaque oninput/onchange. `draftDoc()` lit `fa-type`/`fa-client`/`fa-date`/`fa-ech` + `faLignes` + `faTotaux()` + paramètres `db.societe` ; `ensureA4()` insère `#fa-a4-wrap`/`#fa-a4` juste après `#fa-apercu` ; CSS `<style id="fa-a4-mod">` (cadre gris, `.inv` mis à l'échelle, responsive mobile). 100% additif, aucune écriture créée.
- `yada-addon98` : `regLignes` renvoie `frais`/`du` par ligne (frais si `enRetard`) ; `tiersAlerteImpayes` cumule `montant` (avec frais) + `frais` ; `regAlerteModal` et `pageReglements` propagent `du` (sous-totaux, KPI, colonnes, en-têtes).
- Badge de version → **v189**.

**Limites assumées :** l'aperçu A4 utilise le même `docHTML` que le PDF final (fidèle) ; le montant de l'indemnité est paramétrable via `db.societe.fraisRecouvrement` (Paramétrage facturation, addon104), défaut 40 €.

---

## 🟢 MAJ précédente — Refonte visuelle mobile (Espace Client) — v180
**Quoi :** une refonte **visuelle** de l'application **mobile** (téléphone, Espace Client uniquement) qui modernise l'écran d'accueil et la navigation, en conservant l'identité **bleu nuit / or** « liquid glass ».

**Pourquoi :** sur mobile le client n'a accès qu'à son Espace Client (addon38/62) ; l'accueil et la barre d'onglets méritaient une présentation plus soignée et plus lisible au pouce.

**Ce qu'il fait (description fonctionnelle) :**
- **Écran d'accueil « hero »** : salutation contextuelle (Bonjour / Bon après-midi / Bonsoir selon l'heure), **nom de la société** (typo Fraunces), date du jour, et **3 chiffres clés** en pastilles (Chiffre d'affaires, Résultat, Trésorerie).
- **Tuiles d'action 2×2** : Mes factures & devis, Réception factures, Mes clients & fournisseurs, Déposer une pièce.
- **Barre de navigation basse FLOTTANTE** (pilule détachée, verre dépoli) à **3 onglets** : 🏠 **Accueil** / ✚ **Créer** / 📥 **Déposer**, avec le bouton central **« Créer » surélevé** en accent **or**.

**Où / comment (description technique) — addon `yada-addon99` :**
- Override `window.ecHero` **sur mobile uniquement** (`isMobile()` ≤820px) : renvoie le hero + les tuiles ; sur bureau, délègue à l'ancien `ecHero` (capturé au chargement). Aucun impact desktop.
- Reconstruction du `#m-tabbar` après chaque `render` (greffe `render`, s'exécute **après** addon63 → 3 onglets `.mtab`, dont `.mtab-fab` central). Marquage `active` selon `current`.
- Feuille de style **`<style id="mobile-refonte">`** injectée en fin de `<head>` (priorité cascade), entièrement gardée par `@media(max-width:820px)` + `body[data-role="client"]` ; neutralise l'indicateur `::before` de l'ancienne barre, masque le `.page-head` redondant de l'accueil, et augmente le `padding-bottom` du contenu pour la barre flottante + bouton surélevé.
- Badge de version (addon37) → **v180 · mobile**.

**Limites assumées :** purement **visuel** (aucune logique comptable touchée, écritures inchangées) ; pages **Créer** (facturation) et **Déposer** (achats) conservent leur mise en forme mobile existante (cartes `li-cli`, etc.).

---

## Refonte visuelle mobile (Espace Client) — addon99
- **`yada-addon99` (refonte visuelle mobile)** : accueil « hero » mobile (salutation + société + 3 chiffres clés en pastilles) + tuiles d'action 2×2 + **barre de navigation basse flottante** 3 onglets (🏠 Accueil / ✚ Créer / 📥 Déposer, bouton central or surélevé). Override `window.ecHero` (mobile only) + reconstruction `#m-tabbar` post-`render` + `<style id="mobile-refonte">`. 100% additif, bureau inchangé.

## Maniabilité mobile (Espace Client) — addon100
- **`yada-addon100` (maniabilité mobile)** : rend l'app mobile plus facile à manier, 3 axes. **(1) Cibles tactiles plus grandes** : boutons (`.btn` min 52px), champs (52px/16px), onglets/FAB et tuiles agrandis (`<style id="mobile-maniabilite">`). **(2) Retour & repères clairs** : bouton **« ← »** (`#m-back`) injecté dans `#m-topbar` quand `current !== 'client'` (revient à l'accueil) + **titre = nom de la page** (`LABELS`), via `updateTopbar()` greffé sur `render`. **(3) Écrans épurés** : `.flow` décoratif + paragraphes `.page-head p` masqués sur mobile client, grille KPI `.grid.g4` masquée sur l'accueil (redondante avec le hero), et **tableaux longs repliés** au-delà de 5 lignes derrière un bouton **« Voir plus / Voir moins »** (`truncateTables()`, classes `.vp-hidden`/`.vp-more`/`.vp-btn`, idempotent par `data-vp`). Gardé par `isMobile()`/@media + `body[data-role="client"]`. 100% additif, bureau inchangé.

---

## 🟢 MAJ précédente — Facturation électronique : opérateur relié (PPF/PDP) + Factur-X
**Quoi :** un module ajouté dans la page **Facturation client** (`pageFacturation`) qui simule l'intégration à un **opérateur de dématérialisation agréé** (PPF — Portail Public de Facturation, ou PDP — Plateforme de Dématérialisation Partenaire), conformément à l'esprit de la réforme française de la facturation électronique B2B.

**Pourquoi :** à terme, un PDF par e-mail ne suffira plus en B2B ; les factures doivent transiter par une plateforme agréée au format structuré (**Factur-X / XML**). Le module pose les fondations côté outil.

**Ce qu'il fait (description fonctionnelle) :**
- **Connexion d'un opérateur** : choix du type (PPF/PDP), nom, identifiant/SIRET → bouton « Relier l'opérateur ». État mémorisé et sauvegardé.
- **Transmission** d'une facture validée à l'opérateur au format **Factur-X** (« Transmettre »).
- **Cycle de vie e-invoice** suivi par facture : `à transmettre → Déposée → Émise par la plateforme → Mise à disposition du client → Approuvée → Encaissée`, avec une branche **Refusée**.
- **Flux horodaté** consultable en modale (timeline des étapes + dates).
- **Génération Factur-X** : un **XML CII** (profil simplifié) téléchargeable, avec vendeur (SIRET/TVA de la société), acheteur, lignes, TVA et totaux.
- Compteur « N/M factures transmises ».

**Où / comment (description technique) — addon `yada-addon20` :**
- Greffe : `const _pf=pageFacturation; pageFacturation=function(){ return _pf()+efacturationCard(); }`.
- Constante d'étapes : `EFACT_ETAPES = ['Déposée','Émise par la plateforme','Mise à disposition du client','Approuvée','Encaissée']`.
- Config persistée dans **`db.parametres.efact`** = `{operateur, idOp, mode:'PPF'|'PDP', connecte}` via `efactCfg()`.
- Statut par facture stocké sur l'objet document : **`doc.efact`** = `{statut, operateur, mode, flux:[{etape,date}]}`.
- Fonctions : `efacturationCard()`, `efactStatutTag(s)`, `efactConnecter()`, `efactDeconnecter()`, `efactTransmettre(id)`, `efactAvancer(id)`, `efactRefuser(id)`, `efactFlux(id)` (modale), `efactXML(id)` (génère + télécharge le Factur-X).
- CSS ajouté : `<style id="efact-mod">` (timeline `.ef-step/.ef-dot/.ef-timeline`, encart `.ef-on`).

**Limites assumées :** simulation **hors-ligne** (pas de connexion réelle à un PPF/PDP) ; le Factur-X généré est **représentatif** du format CII, à fiabiliser (schéma officiel) avant un usage réel ; le calendrier de la réforme a été décalé plusieurs fois → vérifier les dates en vigueur.

**Pistes de suite sur ce module :** statut « reçu » côté Achats (e-reporting / réception fournisseurs) ; embarquer le Factur-X dans un PDF/A-3 ; variante en ligne réelle via clé API d'un opérateur.

---

## Le projet
App de **pré-comptabilité française** (style Sage) en **un seul fichier `precompta.html`** autonome, **hors-ligne**, tout en français. Logique + UI dans des `<script>`. 3 thèmes (`noir` défaut, `liquid-clair`, `liquid-teinte`). Écran de connexion + portefeuille multi-dossiers. 2 démos : **AMA** (`d-ama`), **SCI DU 42** (`d-sci42`).
État actuel : ~764 Ko, 55 `<script>`, **54 modules d'extension** (`yada-addon` → `yada-addon60`, n°49 réservé) + **PWA installable** (manifest.webmanifest, sw.js, icônes) + **interface mobile** (style `mobile-ui` + `mobile-theme` bleu nuit/or, viewport verrouillé sans zoom, barre d'onglets ; client = factures vente/achat uniquement), 23 entrées de navigation.
Feuille de route : voir **`ROADMAP.md`** (finalisation par module).
- **`yada-addon21` (T1)** : clôture de l'exercice — **OD de résultat** (solde 6/7 → 120/129) + **report des à‑nouveaux** (classes 1→5), carte page Éditions. Continuité comptable (bilan d'ouverture N+1 équilibré). Fonctions : `t1ResultatLignes/t1GenererResultat`, `t1ANLignes/t1GenererAN`, `t1SupprimerCloture`, `t1Card`.
- **`yada-addon22` (T2)** : **cohérence des comptes** — normalisation `c9` (9 chiffres) de tous les comptes d'écriture (migration de tous les dossiers + à chaque `save`), de sorte que l'**OD TVA solde réellement** les comptes alimentés par les factures (44571→445710000, 44566→445660000). `tvaDuMois` comparé en `c9`. Fonction : `t2Normaliser()`. + correctif chirurgical du solde banque (ligne ~3390 : `c9(l.compte)==='512000000'`).
- **`yada-addon23` (T4)** : **états de synthèse** — **Bilan** + **Compte de résultat** imprimables, carte page Éditions. CR calculé hors « OD RÉSULTAT » (valable avant/après clôture) ; Bilan toujours équilibré (résultat non affecté ajouté en capitaux propres). Fonctions : `t4Card`, `t4Afficher('bilan'|'cr')` (+ `etatBilan/etatCR` internes).
- **`yada-addon24` (T3)** : **lettrage unifié** — moteur commun `lzLettrer(refs)`/`lzDelettrer(refs)`/`lzProchaineLettre(cptC9)` (champ `l.lettre`, contrôle Σ débit = Σ crédit) ; **lettrage interactif dans l'éditeur** (clic sur lignes → `ecSel`, barre `.ec-letbar`, `ecLettrerSel/ecDelettrerSel`). Données partagées avec le compte auxiliaire. **Fondations T1→T4 terminées.**
- **`yada-addon25` (risque compta)** : **Règlements ↔ Banque** — `marquerRegle`/`ecart` génèrent l'écriture de trésorerie (encaissement client : crédit 411 / débit 512 ; paiement fournisseur : débit 401 / crédit 512) puis lettrent la facture. La créance/dette est réellement soldée par la trésorerie.
- **`yada-addon26` (risque compta)** : **Cession d'immobilisation** — `imCeder` génère l'OD de sortie équilibrée : 675 (VNC) + 28x (amort. cumulés) D = 21x (immo brute) C ; 512 (prix) D = 775 (produit) C. Idempotent (libellé « CESSION IMMOBILISATION … »). Fonction : `imCederComptabilise(im,date,prix)`.
- **`yada-addon27`** : éditeur d'écritures — **filtre / tri** (`ecSetFiltre/ecToggleSort`, barre `.ec-filtbar`). Affichage seul.
- **`yada-addon28`** : **Tiers — édition/suppression** d'une fiche (`tiersEditer/tiersEnregistrer/tiersSupprimer`, bouton ✎). Bloqué si tiers mouvementé ; pas de modif rétroactive des écritures. **+ Complétion via le SIRET** dans la modale d'édition (`tiersEditSiret` → `lookupSiret` ; champs `te-siret`/`te-tvaintra` remplis : nom, adresse, CP/ville, n° TVA ; persistés par `tiersEnregistrer`). La création de tiers a déjà l'auto-SIRET (`remplirTiersDepuisSiret`).
- **`yada-addon29`** : **Éditions — balance âgée** clients & fournisseurs (`balanceAgeeCard`, ventilation par ancienneté). Lecture seule.
- **`yada-addon30`** : **Tableau de bord** — trésorerie réelle (solde 512, `soldeTresorerie()`) + CA/charges depuis les écritures (`dashTresoCard`).
- **`yada-addon31`** : **GED** — dépôt glisser-déposer de vrais fichiers (`db.parametres.pieces`, `gedAdd/gedCard`), carte Espace Client.
- **`yada-addon32`** : **Espace Client séparé** — `window.sessionRole` (cabinet|client) + `CLIENT_PAGES=['client','facturation','achats','tiers']` (navigation restreinte côté client) ; `choisirDossierClient/quitterEspaceClient` ; actions cabinet masquées.
- **`yada-addon33`** : **Messagerie client ↔ cabinet** + pièces demandées (`db.parametres.messages/demandes`, `messagerieCard`).
- **`yada-addon34`** : **FEC inverse** — bouton « ouvrir l'exercice précédent (N-1) » pour les à-nouveaux (`fecOuvrirPrecedent`).
- **`yada-addon35`** : **Autoliquidation de TVA (achats)** — case « Autoliquidation » dans Achats ; écriture 4 lignes équilibrée (60x HT + 445660000 TVA déd. D = 401 HT + 445710000 TVA coll. C). Net dû = HT ; TVA collectée + déductible déclarées sur la CA3. Fonction : `posterAchatAutoliq(o)` (override `validerAchat`/`majAc`).
- **`yada-addon36`** : **cohérence des KPI de synthèse** — Tableau de bord & Espace Client alignent **CA / Charges / Résultat** sur les **écritures** (classe 7/6 hors « OD RÉSULTAT »), comme le Compte de résultat (avant : basés sur les factures, ignoraient paie/dotations). `resEcritures()` ; greffe `dashCompta`/`pageEspaceClient`. L'Analytique reste basé factures (analyse par pièce).
- **`yada-addon37`** : badge de version (repère de déploiement, bas-droite) — confirme qu'une MAJ est en ligne (GitHub Pages).
- **`yada-addon38`** : **Connexion 2 espaces avant les dossiers** — choix Cabinet/Client puis identifiant+mot de passe (empreintes SHA-256 salées `CAB`/`CLI`) ; **Client = accès direct à SON dossier** (`CLIENT_DOSSIER='d-ama'`) **sans page intermédiaire** (page rendue sous l'écran de connexion puis dévoilée) ; cloisonnement, verrouillage auto, déconnexion.  `secChoisir/secEssayer/secRetour/secVerrouiller/secOuvrir`. **Sur mobile (`isMobile()` ≤820px) : seul l'Espace Client est accessible** — la gate force `CHOICE='client'` (formulaire client direct, pas de choix ni de Cabinet), `secChoisir('cabinet')` ignoré, `boot` ignore une mémorisation cabinet. **Proposition d'installation mobile depuis l'ordinateur** (addon62) : `mobileInstallModal()` (QR code via api.qrserver.com + lien + instructions Android/iOS, repli lien si hors-ligne) ; bannière discrète une fois (`yada-mob-prop`) + bouton dans Paramétrage. **+ Connexion automatique « appareil de confiance »** (addon57) : case « Rester connecté sur cet appareil » → `secOuvrir(role,true)` mémorise le rôle en `localStorage` (`yada-remember`) ; au chargement, `boot` rouvre directement l'espace sans gate (timer d'inactivité désactivé sur appareil mémorisé) ; `secVerrouiller` (déconnexion) efface session + mémorisation.
- **`yada-addon40`** : **Refonte visuelle Espace Client** — en-tête « hero » + 4 raccourcis (`ecHero()`, classes `#ec-hero`/`.ec-shortcuts`/`.ec-tile`), greffe `pageEspaceClient`. Style `<style id="ec-refonte">` ; espacement des modules client via `<style id="ec-spacing">` (colonne centrée 1080px, marges aérées, ciblé `body[data-page="client"]`).
- **`yada-addon41`** : **Refonte visuelle Tableau de bord Cabinet** — même esprit hero que l'Espace Client (`dashHero()`, hero vert `#ec-hero.cab-hero` + 4 raccourcis Facturation/Achats/Compta/TVA) **injecté dans le `.dash-wrap`** via greffe `pageDash` (`html.replace('<div class="dash-wrap">', …)`) ; styles ciblés `body[data-page="dash"]` dans `<style id="ec-spacing">`. Contenu inchangé en dessous.
- **`yada-addon42`** : **Vues client simplifiées (Facturation & Factures fournisseurs)** — quand `window.sessionRole==='client'`, `pageFacturation`→`pageFacturationClient()` et `pageAchats`→`pageAchatsClient()` (greffes à bascule ; le cabinet conserve la page complète). **Facturation client** = création simplifiée (`faClientCreer()` réutilise `faLignes`/`faSync`/`faMaj`/`emettre` ; type Facture/Devis, client, dates, lignes Qté·PU·TVA·Total HT) + « Factures récemment créées » (`faClientRecentes()`, 5 dernières) + `suiviFacturesVente()` + `listeFacturesEnvoyees()`. **Achats client** = « Dernières factures déposées » (`achatsClientRecentes()`, 5 dernières) + « Détail des factures fournisseur » (`achatsClientDetail()` : KPI HT/TVA/TTC + table N°/Fournisseur/Date/Règlement/HT/TVA/TTC/Paiement/Voir). Aucune écriture directe : la création passe par `emettre()`/`posterFacture` (VTE équilibrée). **+ Dépôt de factures** dans les deux pages client (`depotFacturesCard(cat,…)`, `factDepotAdd/factDrop/factPick/factFile`) : stockage réel dans `db.parametres.pieces` avec champ `cat` (`'vente'` côté Facturation, `'achat'` côté Achats) ; liste filtrée par catégorie, consultation/téléchargement/suppression via `gedVoir/gedDl/gedDel`. **Disposition 2 colonnes** (addon58) des pages client : colonne gauche = actions (créer/déposer), colonne droite = suivis/listes (`.cli-2col/.cli-col`, repli 1 colonne <1000px).
- **`yada-addon44`** : **Dépôts de factures — workflow d'approbation cabinet** (client & cabinet, vente & achat). Le client dépose un fichier (Facturation→`cat:'vente'`, Achats→`cat:'achat'`) : création d'une **pièce** (`db.parametres.pieces`) + d'un **dépôt** (`db.parametres.depots` : `{statut,doublon,fichierId,tiersId,numero,ht,tva,ttc,taux,ecritureId,…}`) + d'une **notification** (`db.parametres.notifsDepot`). **Doublon** repéré dès la réception (même nom de fichier dans le dossier) → liste colorée **vert = unique / rouge = doublon** (`.dep-ok/.dep-dup`), visible **côté client et cabinet**. Le cabinet valide en 2 temps : **`depotRecevoir`** (statut `deposee→recue`) puis **`depotComptabiliser`** (formulaire inline tiers/n°/date/TTC/TVA → `posterFacture` type vente/achat, écriture équilibrée, statut `comptabilisee`) ; **`depotRefuser`** sinon. Le client ne peut que déposer/retirer (`depotSupprimer` si `deposee`). Fonctions : `depotsListe(cat,role)`, `depotsCabinetCard(cat)` (greffée sur `pageFacturation`/`pageAchats` côté cabinet), `depotFacturesCard` (client, override addon42), `notifMarquerLu(cat)` + pastille menu cabinet (`.nav-badge-dep`, greffe `buildNav`). **Aucune saisie sans double validation cabinet.**
- **`yada-addon45`** : **Fournisseur inconnu → fiche d'information** (achats). Au dépôt d'une facture d'achat, le client choisit le fournisseur (`#dep-four-achat`) ou « ➕ inconnu / nouveau ». Si inconnu : `factDepotAdd` (override) marque `dep.tiersInconnu` et crée une **fiche** (`db.parametres.fichesTiers` : `{type:'fournisseur',depotId,statut:'a_remplir'|'remplie'|'validee',raison,siret,tvaIntra,adresse,cp,ville,email,tel,iban,tiersId}`). Proposition visible **côté client** (`fichesClientCard`, bouton « Remplir » → modale `ficheRemplir`/`ficheEnregistrer`) **et cabinet** (`fichesCabinetCard`, greffée sur `pageAchats`). Le cabinet valide (`ficheValider`) → création du `db.tiers` fournisseur (606000/44566, `genAux`) + rattachement `dep.tiersId`, puis comptabilisation normale du dépôt. `ficheVoir` (modale lecture). **Complétion auto via le SIRET** (addon53) : bouton « 🔎 Compléter via le SIRET » dans la fiche → `ficheCompletSiret()` appelle `lookupSiret` (API publique **recherche-entreprises.api.gouv.fr**, sans clé) et remplit raison sociale, adresse, CP, ville, **n° TVA** (`tvaFromSiren`) depuis le seul SIRET (e-mail/tél/IBAN restent manuels ; recherche nécessite le réseau).
- **`yada-addon46`** : **Préservation du défilement** — `render` (override) mémorise le `scrollTop` du conteneur (`.mod-wrap`/`.dash-wrap`) et le restaure quand la page (`current`) est ré-rendue à l'identique (plus de « retour en haut » après chaque enregistrement, ex. Achats cabinet).
- **`yada-addon47`** : **Comptabilisation des dépôts — compte tiers auxiliaire + doublon comptable**. La comptabilisation d'un dépôt utilise désormais le **compte auxiliaire 401XXXX / 411XXXX** (`posterFactureAux` : `posterFacture` puis remplacement de la ligne collective `401`/`411` — comparée en `c9` car `save` normalise — par `tiers.compteAux`). Avant saisie, **détection de doublon comptable** (`factureDoublon` : même tiers + même n°, sinon même tiers + date + TTC) → **modale de confirmation** (`compareModal`) affichant **les deux factures côte à côte** (existante vs nouvelle, chacune ouvrable via `gedVoir`/`voirFactureAchat`) avec 3 choix : **Conserver l'existante** (annule), **Comptabiliser les deux** (`depotComptaGarderLesDeux`), **Remplacer par la nouvelle** (`depotComptaRemplacer` → `supprimerFactureEtEcriture` : **délettrage** `delettrerEcriture` si l'écriture portait une lettre, suppression facture+écriture+règlement, puis saisie de la nouvelle). Toutes les infos saisies (date, n°, HT/TVA/TTC, fournisseur). La facture déposée reste **ouvrable dès la réception** (bouton 📎 dans la liste cabinet). Greffe : override `depotComptabiliser`.
- **`yada-addon48`** : **Saisie complète de la facture reçue + pré-remplissage de la comptabilisation**. Le dépôt d'un achat se fait via un **formulaire complet** (fournisseur, n°, date facture, **HT, remise fournisseur, taux TVA** → **net HT, TVA, TTC calculés en direct** `depotCalcAchat`, + justificatif) — `depotAchatDeposer` enregistre toutes ces infos sur le dépôt (`htBrut,remise,ht,tva,ttc,taux,numero,dateFacture`). Override de `depotsListe` : la **saisie comptable cabinet est pré-remplie automatiquement** (fournisseur pré-sélectionné, n°, date, TTC, taux + HT/remise affichés) avec un **récapitulatif comparatif** « Informations reçues » et un bouton **« 📎 Comparer avec la facture »** (ouvre le fichier) → l'utilisateur vérifie puis valide. Override de `depotFacturesCard` (achat = formulaire ; vente = dépôt fichier simple). La remise est déduite de la base HT (TTC = net HT + TVA). **Montants exacts** : la comptabilisation utilise les **montants HT et TVA transmis** (champs `cmp-ht`/`cmp-tva` éditables et pré-remplis, TTC = HT+TVA recalculé via `depotCmpCalc`) — `posterFactureMontants` (addon47) construit l'écriture avec ces montants exacts (pas de recalcul depuis le TTC), sur le compte auxiliaire 401XXXX, équilibre garanti (TTC = HT+TVA).
- **`yada-addon50`** : **Lecture automatique de la facture d'achat → le cabinet n'a qu'à valider**. Le client **dépose seulement le fichier** (plus aucun montant à saisir) : `factDepotAdd` (override) lance `extractFromFile` (lecture **simulée** hors-ligne : montant détecté dans le nom du fichier — décimales prioritaires, sinon plus grand entier, sinon valeur simulée déterministe — + n° et taux 20%), calcule **HT et TVA depuis le TTC** (`net=TTC/(1+taux)`, `TVA=TTC−net`) et les stocke sur le dépôt (`auto:true`). La saisie comptable cabinet est alors **entièrement pré-remplie** (TTC/HT/TVA/n°/taux via `depotsListe` addon48) → le cabinet **valide** (et peut « Comparer avec la facture » / corriger). `depotFacturesCard` (override) : achat = sélecteur fournisseur + zone de dépôt fichier (lecture auto) ; vente = dépôt fichier. Tout le circuit aval (doublon/confirmation/remplacement, compte 401XXXX, montants exacts) reste actif.
- **`yada-addon51`** : **Lecture RÉELLE de la facture PDF** (couche texte) — **sans bibliothèque ni réseau**. `factDepotAdd` (override) lit le PDF déposé : décompression des flux **FlateDecode** via **`DecompressionStream` natif** (`flate`/`inflate`/`pumpToU8`), extraction du texte (`pdfExtractText` + `textFromContent`/`pdfUnescape`/`hexDecode`) puis détection des montants (`pdfParseAmounts` : repère TTC/TVA/HT par mots-clés, taux déduit, n° de facture), et calcule HT/TVA depuis le TTC. Repli `extractFromFile` (nom de fichier) si PDF non lisible ; **image = pas d'OCR hors-ligne** → repli nom de fichier (mention explicite). `dep.lecture` indique la source ; toast récapitulatif. Le cabinet n'a qu'à valider (saisie pré-remplie addon48).
- **`yada-addon52`** : **OCR des images / scans (prêt pour le réseau)**. Définit le point d'accroche `window.ocrImage(file,dataUrl)` appelé par `factDepotAdd` (addon51) pour les images : **charge Tesseract.js à la demande** depuis un CDN (`db.parametres.ocr.cdn`, défaut jsDelivr `tesseract.js@5`) **uniquement si le réseau est disponible** (`navigator.onLine`) ; lance `Tesseract.recognize(..,'fra')` → texte → `pdfParseAmounts` (TTC/TVA/HT). **Repli automatique** (lecture par nom de fichier, addon51) si hors-ligne / CDN bloqué / délai. Réglages : `db.parametres.ocr={enabled,lang,cdn}`, `ocrConfig()`, `ocrSetEnabled(v)`. Non bloquant pour l'usage hors-ligne (lazy-load, try/catch, timeout 20 s).
- **`yada-addon54-55`** : **Nouveaux fournisseurs créés par le client** — `ficheValider` marque le tiers `nouveau:true, origine:'client', dateAjout`. Affichage **badge « NOUVEAU »** (vert) dans la liste Tiers (`sectionTiers`, ligne `.new-tiers`) + **pastille** sur le menu Tiers (`.nav-badge-new`, `tiersNbNouveaux`, greffe `buildNav`). Le cabinet **modifie la fiche** (modale `tiersEditer`) avec champs **IBAN** (`te-iban`), e-mail, téléphone, SIRET, n° TVA + bouton « Compléter via le SIRET » (`tiersEditSiret`) ; `tiersEnregistrer` persiste `iban/siret/tvaIntra` et **retire le marquage `nouveau`** une fois la fiche vérifiée.

- **`yada-addon56`** : **Même système pour les clients** — le flux « tiers inconnu → fiche → validation cabinet → tiers marqué nouveau » est généralisé au **type client** (vente). Sélecteur « Client inconnu / nouveau » dans le dépôt Facturation (`dep-client-vente`) ; fonctions `ficheRemplir/ficheVoir/ficheValider/fichesClientCard/fichesCabinetCard` rendues **type-aware** (fournisseur → 401/606/44566 ; client → 411/706/44571). Greffes : `fichesClientCard('client')` sur Facturation client, `fichesCabinetCard('client')` sur Facturation cabinet (et inchangées pour fournisseur sur Achats). Marquage `nouveau` + badge/pastille et édition cabinet (IBAN/mail/tél/SIRET) communs aux deux types.

> **Hors périmètre hors-ligne** : l'OCR d'images nécessite le réseau (chargement de Tesseract.js) — **prêt et activé automatiquement quand connecté**, repli hors-ligne ; la lecture PDF couche-texte est réelle et hors-ligne ; IA en ligne et e-reporting Achats à compléter ultérieurement.

- **`yada-addon59`** : **Sauvegarde automatique + indicateur** — `save()` (déjà appelé après chaque action) est enveloppé pour afficher un indicateur **« 💾 Enregistré ✓ HH:MM:SS »** (bas-gauche, `#yada-save-ind`) à chaque mise à jour ; filet de sécurité : sauvegarde **avant fermeture** (`beforeunload`) + **périodique** (60 s). Données dans `localStorage` (`yada-db`).

- **`yada-addon63` (format mobile client)** : sur mobile (Espace Client), **barre d'onglets en bas** centrée sur les 2 actions — **🏠 Accueil / 🧾 Créer (facturation) / 📥 Déposer (achats)** (`#m-tabbar`, reconstruite à chaque `render`, état actif sur `current`, visible via `body[data-role=client]` + media ≤820px). Cadrage mobile soigné (style `mobile-ui`) : lignes de facture `.li-row` en **carte empilée** (désignation pleine largeur, Qté/PU/TVA/Total + ✕), libellés `Qté`/`PU HT` ajoutés, anti-zoom iOS (`font-size:16px`), anti-débordement (`overflow-x:hidden`), `padding-bottom` pour la barre. Combiné à addon62 (mobile = client uniquement).

- **`yada-addon64` (fiche tiers groupée)** : plusieurs factures d'un **même nouveau tiers** se rattachent à **une seule fiche** (plus d'énumération). Le dépôt propose les **fiches en cours** (`<optgroup>` « Nouveaux … en cours », valeur `fiche:ID` via `fichePendOptions`) ; `factDepotAdd` rattache le dépôt (`fiche.depotIds[]`) sans recréer de fiche ; `ficheValider` rattache **tous** les `depotIds` au tiers créé. Les cartes de fiches affichent un **compteur** « (N factures) » au lieu d'une ligne par facture. **Regroupement automatique** (addon65) : `fichePendOptions` **pré-sélectionne la fiche en cours la plus récente** → les dépôts suivants se rattachent au même nouveau tiers par défaut (modifiable ; « ➕ inconnu » crée une fiche distincte).

- **`yada-addon87` (consultation — comptes de tiers cliquables → grand-livre lecture seule)** : dans la **Consultation des comptes**, onglets **Fournisseurs divers** et **Clients divers**, le **n° de compte du tiers est cliquable** (`ouvrirCompteLecture(code)`) et ouvre le **grand-livre du tiers en LECTURE SEULE** (overlay `#cl-overlay`, présentation façon Sage `.lx-app`/`table.lx` : Date/Jnl/I/Pièce/Libellé/Débit/Crédit/Solde/L), reconstitué via `auxLignes(t)` (toutes les écritures touchant le compte collectif 401/411 du tiers). Les lignes **ne sont pas modifiables** ; pour modifier, **clic droit** sur une ligne → menu `#cl-ctx` « 📓 Journal » (`clMenu`/`clVersJournal`) qui **redirige vers l'éditeur d'écritures** (`ouvrirEcrituresCompte`) tout en **laissant le compte ouvert** ; la page ne se ferme **qu'avec le bouton de fermeture** (`clFermer`). Valable pour **tous les comptes fournisseurs et clients** enregistrés & utilisés **ET pour les Comptes Généraux** (v167) : `ouvrirCompteLecture` ouvre tout code ; si aucun tiers ne correspond (`tiersDe`), le grand-livre du **compte général** est reconstruit via `clLignesGeneral(code)` (toutes les écritures dont une ligne a `c9(compte)===c9(code)`), libellé via `COMPTES`. Greffe sur les 3 onglets : lignes de `pageCompta` (généraux + `estAux` fournisseurs/clients) → `onclick="ouvrirCompteLecture(...)"`. **Navigation ↑/↓** (v168) : flèches ▲/▼ dans la barre (et touches clavier ↑/↓) pour passer au **fournisseur / client suivant ou précédent** (compte général : compte mouvementé suivant) — `clNav(sens)` parcourt `clSiblings()` (tiers du même type ayant des écritures, triés par `sageCode` ; ou comptes généraux mouvementés), avec libellé de position « Fournisseur i / N » (`.cl-navlbl`) et bouclage circulaire. Greffe : édition chirurgicale des lignes de tiers dans `pageCompta` (`estAux` → `onclick="ouvrirCompteLecture(...)"`) + addon (overlay, menu contextuel, CSS `<style id="cl-mod">`).

- **`yada-addon88` (consultation — fenêtre réductible)** : le bouton **▢** de la barre de titre (`.sg-win`) de la **Consultation des comptes** bascule la fenêtre (`.sg-app`) entre **plein écran** et une **fenêtre réduite centrée** (classe `.sg-reduit` : `min(1040px,100vw−64) × min(640px,100vh−72)`, marge auto, ombre, fond visible autour). Couvre les **6 onglets** (Comptes Généraux, Fournisseurs divers, Fournisseurs d'immobilisations, Clients divers, Retenue de Garantie, Personnel) car ils partagent la même fenêtre. État **mémorisé** (`localStorage 'yada-sg-reduit'`, lu dans `window.sgReduit`, appliqué par `pageCompta`). Le glyphe morphe ▢↔▣ ; ─ réduit aussi. Fonctions : `sgToggleReduit`, `sgReduireFenetre`. Greffe : édition de la `.sg-win`/classe `.sg-app` dans `pageCompta` + addon (logique + CSS `<style id="sg-reduit-mod">`).

- **`yada-addon88` (consultation — fenêtre réductible)** : le bouton **▢** de la barre de titre (`.sg-win`) de la **Consultation des comptes** bascule la fenêtre (`.sg-app`) entre **plein écran** et une **fenêtre réduite centrée** (classe `.sg-reduit` : `min(1040px,100vw−64) × min(640px,100vh−72)`, marge auto, ombre, fond visible autour). Couvre les **6 onglets** (Comptes Généraux, Fournisseurs divers, Fournisseurs d'immobilisations, Clients divers, Retenue de Garantie, Personnel) car ils partagent la même fenêtre. État **mémorisé** (`localStorage 'yada-sg-reduit'`, lu dans `window.sgReduit`, appliqué par `pageCompta`). Le glyphe morphe ▢↔▣ ; ─ réduit aussi. Fonctions : `sgToggleReduit`, `sgReduireFenetre`. Greffe : édition de la `.sg-win`/classe `.sg-app` dans `pageCompta` + addon (logique + CSS `<style id="sg-reduit-mod">`).

- **`yada-addon89` (gestionnaire de fenêtres — déplaçable / redimensionnable / réductible / autre écran)** : transforme les fenêtres façon Sage **et les sous-pages (modales)** en fenêtres manipulables. Cibles : Consultation (`.sg-app`), Compte auxiliaire (`#main .lx-app`), Grand-livre lecture seule (`#cl-overlay .lx-app`), Éditeur d'écritures (`#ec-overlay .ec-win`), **Rapprochement** (`.rb-app`/`.rb-title`), **Charges & paie** (`.cp-wrap`/`.cp-topbar`), **Immobilisations** (`.im-app`/`.im-title`), et **modales** (`#modal.show #modal-c`, via `.modal-h`). Chaque fenêtre reçoit : **déplacement** (glisser la barre de titre), **redimensionnement** (poignée coin bas-droite `.wm-resize`), **réduction `▢`** (bascule fenêtre flottante `.wm-float` ↔ plein écran ; pour la Consultation c'est `sgToggleReduit`/addon88), **`⧉` autre écran** (`wmPop` → `window.open` avec clone HTML + styles inlinés → à glisser sur le 2e moniteur ; vue). Géométrie mémorisée `localStorage 'yada-wm'` (`WM.st` par fenêtre `{float,x,y,w,h}`) ; les **modales** sont éphémères (état remis à zéro à la fermeture, non persisté). Réapplication après chaque rendu via greffes `wrap('render'/'ecRender'/'ouvrirCompteLecture'/'clNav')` + **MutationObserver** sur `#modal`/`#modal-c`. Quand une modale/overlay flotte, le fond (`.wm-floating`) devient transparent et non bloquant. Fonctions : `wmToggle(k)`, `wmPop(k)`, `wmApply()` ; CSS `<style id="wm-mod">`.

- **`yada-addon90` (saisie d'une opération — même interface que l'éditeur)** : bouton **« ＋ Saisir une opération »** (menu **Compte** de la Consultation + barre du **grand-livre lecture seule**) → ouvre l'**éditeur d'écritures** (`#ec-overlay`, déjà façon Sage et fenêtré) en **CRÉATION** via `window.ecNewId`. Barre injectée `.ec-newbar` (sélecteur **Journal** OD/BQ/HA/VT/OD TVA/OD Paie, **Date**, **Pièce**) + saisie des lignes (compte + autocomplétion addon85, libellé, débit, crédit) + contrôle Σ débit = Σ crédit. **Valider l'opération** (`ecValiderOperation` : nettoie les lignes vides, exige un compte par ligne mouvementée, équilibre obligatoire sinon `ecNotifSolde`, puis `save`) ; **Annuler** (`ecAnnulerOperation`) et fermeture ✕ (`ecFermer` en mode création) retirent le brouillon. Greffes base : `ecEcritures` (court-circuit → seule l'écriture en cours), `ouvrirEcrituresCompte` (sort du mode création), `ecFermer` (abandon = retrait du brouillon) ; `ecRender` enveloppé pour injecter la barre. CSS `<style id="ec-newop-mod">`.

- **`yada-addon91` (éditeur d'écritures — refonte noir & bleu, lisible & épurée)** : restyle l'**unique surface de saisie** `#ec-overlay/.ec-sage` (utilisée par « Modifier l'écriture » clic droit→Journal, double-clic sur un compte, ET « Saisir une opération » addon90) en **fond noir + accents bleus** (#1e90ff/#5ab0ff), **tout le texte lisible** (clair sur noir, surcharge des anciennes règles `!important` texte noir), débit/crédit/solde contrastés (rouge compta conservé). **Simplicité** : barres décoratives `.ec-menubar` (menu façon Windows) + `.ec-toolbar` (glyphes) **masquées** ; la `.ec-filtbar` (filtre/tri addon27, sœur de la menubar) reste et est restylée. CSS `<style id="ec-noir-mod">` (surcharge en fin de `<head>`, aucune logique modifiée).

- **`yada-addon93` (Charges & Paie — journal de paie mensuel assisté + comptabilisation)** : carte greffée dans `pageChargesPaie` (injection dans `.cp-scroll`). **Dépôt de document** (journal de paie/charges) stocké dans `db.parametres.pieces` (cat `paie`) ; **reconnaissance OCR auto quand connecté** (`window.ocrImage`+`pjParse` par mots-clés), repli saisie manuelle (scans sans couche texte). **Décomposé par mois** (utilise `cpMois`). Rubriques pré-mappées (`PJ_RUBR`, montants saisis dans `db.parametres.paieJournal[mois]`) : Salaire brut/total général→**641**, URSSAF+CSG/CRDS→**6451**, BTP prévoyance/retraite→**6453**, panier+Navigo→**648**, PAS→**4421**, **Net à payer (équilibrage)→421**. Détail de l'écriture affiché en dessous ; **génère l'OD PAIE équilibrée** (`pjGenerer`, journal `ODP`, libellé `JOURNAL PAIE MM/AAAA`, idempotent ; `pjSupprimer`). CSS `<style id="pj-mod">`.

- **`yada-addon96` (plan comptable — création des comptes Achats/Ventes/TVA demandés + tiers par nature)** : enrichit `COMPTES` + `PCG_COMPLET` (+ `db.plan` si déjà peuplé, sinon repli `COMPTES`) avec les comptes de **charges** (601/606/615x/616x/622600/622700/623000/623100/625100/625600), **produits** (701/704/705/706/707 + 707020/030/040/055/060) et **TVA** (collectée 445711..717, déductible 445661..667, sur immo 445621..627, assimilées/régul 445780/800/810/830/670) s'ils n'existent pas (idempotent, sans écraser les libellés existants). Crée 2 **tiers fournisseurs « par nature »** si absents : **GASOIL → 401GASO00** (606000000) et **RESTAURANT → 401REST00** (625700000). Re-joué après `chargerDossier`/`seed`. + **ligne ROUGE** sous une écriture soldée dans l'éditeur (`.ec-redrow .ec-soldee` repassé en rouge #e1342c) pour le Journal d'achat HA éditable.

- **`yada-addon98` (suivi des règlements — onglets Clients/Fournisseurs + alerte impayés)** : override `pageReglements` en **2 onglets** (Clients = règlements `a_encaisser` reçus, Fournisseurs = `a_payer` émis), à partir des factures. Par tiers/facture : **TTC, réglé, restant, retard (jours)** (échéance dépassée) ou **délai restant**, **date du dernier paiement** (`marquerRegle` mémorise `r.datePaiement`). KPIs (total impayé, dont en retard, tiers en alerte). **Alerte après 3 impayés en retard** (`SEUIL_IMPAYES`) : bandeau **« 🚫 Ne plus traiter avec ce client/fournisseur »** + modale `regAlerteModal` (montant impayé, dernier paiement, **factures non réglées en pièces jointes** ouvrables `regVoirFacture`). Helper réutilisable `tiersAlerteImpayes(tid)` ; **hook `posterFacture`** → l'alerte s'affiche **à la création/réception** d'une facture pour un tiers en alerte. CSS `<style id="reg-mod">`.

- **`yada-addon102` (synchronisation cloud multi-appareils — Supabase)** : retrouve le **dernier enregistrement sur tous les appareils** du même compte. Config **hors `db`** (localStorage `yada-cloud` = `{url,key,table,espace,enabled}`) pour ne pas être écrasée par les données reçues. **PUSH** (upsert horodaté `{id:espace,data:JSON(db),ts}` via REST `POST /rest/v1/<table>?on_conflict=id`, `Prefer:resolution=merge-duplicates`) **débounce après chaque `save()`** ; **PULL** au chargement (`pullOnLoad`) et à la demande (`GET ?id=eq.<espace>`), applique si `remote.ts > localTs` (« dernier gagnant », `localStorage 'yada-cloud-ts'`). Fonctions : `cloudPushNow/cloudPull/cloudSyncNow/cloudTest` ; `fetch` avec `AbortController` (timeout 15s), try/catch, hors-ligne géré ; indicateur `#yada-cloud-ind`. Carte de réglage greffée dans **Paramétrage** (URL/clé anon/table/clé d'espace + activer + Tester + Synchroniser + aide SQL de création de table/policy). 100% additif. **Chiffrement de bout en bout (v183)** : option `encrypt` + `pass` (localStorage) → `encryptStr/decryptStr` (AES‑256‑GCM, PBKDF2 150k itér., WebCrypto) ; le cloud ne stocke qu'un blob `enc1:base64(salt+iv+ct)` illisible, la phrase secrète ne quitte jamais l'appareil ; phrase invalide → pull refusé (données locales préservées). Sans la phrase : données irrécupérables. **Contrôle d'intégrité multi-dossiers (v185)** : `cloudIntegrityCheck` compare, **dossier par dossier**, `db.dossiersData` local vs cloud (empreinte `dsFp` = débit/crédit/lignes/TTC + égalité JSON stricte) et affiche une modale « ✓ identique / ✗ écart » par dossier (la synchro réplique déjà le `db` complet — tous les dossiers). Bouton « 🔎 Vérifier les montants (tous les dossiers) » dans la carte Paramétrage.
- **`yada-addon103` (mise à jour automatique du système — même version partout)** : garantit que **toutes les surfaces / tous les appareils** convergent vers la **dernière version déployée**, jamais de système divergent. Vérifie périodiquement `version.json` (réseau, `cache:no-store`) + relance `serviceWorker.update()` ; si `remote.version > version courante` (badge), **enregistre les données puis recharge** (`applyUpdate`). Déclencheurs : démarrage (+6 s), toutes les 5 min, retour au premier plan (`visibilitychange`), reconnexion (`online`). Couplé au **SW « réseau d'abord »** (sw.js `CACHE yada-v4`, `version.json` réseau-seulement) et au **`controllerchange` → `save()` + reload**. `version.json` est **auto-généré par la CI** (`build-zip.yml`) depuis le badge de version → pas de dérive. 100% additif.
- **`yada-addon104` (paramétrage de la facturation)** : carte « Paramètres de facturation » greffée sur `pageFacturation`/`pageFacturationClient` (`factParamCard`/`factParamSave`) persistant dans `db.societe` : **condition TVA** (encaissements/débits), **moyen de paiement par défaut** (CB/Espèces/Chèque/Virement), **indemnité de recouvrement** (40 € par défaut), **escompte** (taux + délai), **RIB** (bénéficiaire/IBAN/BIC). Supprime le tableau « suivi & validation » (`documentsClientsCard`→''). **Plafond année à 4 chiffres** sur les `<input type=date>` (`max=9999-12-31`).
- **`yada-addon105` (facture — aperçu A4 en direct)** : sous le formulaire d'émission, panneau **« 📄 Aperçu de la facture (format A4 · mis à jour en direct) »** qui rend la vraie page A4 (`docHTML`) à chaque frappe. Greffe le **binding global** `faMaj` (`var _f=faMaj; faMaj=function(){…refreshA4();}`) → intercepte aussi l'appel interne de `render` (premier affichage) et chaque oninput/onchange. `draftDoc()` (champs `fa-*` + `faLignes` + `faTotaux` + `db.societe`), `ensureA4()` insère `#fa-a4-wrap`/`#fa-a4` après `#fa-apercu`, CSS `<style id="fa-a4-mod">`. N° prévisualisé sans consommer le compteur ; Qté masquée pour prestation. 100% additif (aucune écriture).
- **`yada-addon106` (Charges & Paie — bulletins de paie éditables + OD multi-mois)** : module **Bulletins de paie** greffé sur `pageChargesPaie`. Génère/édite des **fiches de paie au modèle français entièrement modifiables** (gains, **table de cotisations** base/taux/part salariale & patronale, primes panier/Navigo, **PAS** taux ou montant) pour **plusieurs salariés et plusieurs mois** ; totaux en direct (brut, net imposable, net à payer, charges patronales, coût employeur) ; **aperçu A4 + impression** (`bpBulletinHTML`/`bpVoir`/`bpImprimer`). **Dépôt multiple de bulletins** (`bpDepot`, `db.parametres.pieces` cat `bulletin`, OCR auto si connecté → fiche pré-remplie). **OD de paie du mois** : `bpGenererODMois` agrège toutes les fiches du mois → `db.parametres.paieJournal[mois]` → **`pjGenerer`** (addon93) → OD PAIE équilibrée. Données `db.parametres.bulletins.fiches[]` ; CSS `<style id="bp-mod">`. 100% additif.

## Règles de travail (IMPÉRATIF)
1. **Ajouter par-dessus l'existant sans rien casser.** Édition chirurgicale, jamais de réécriture globale. Les nouveautés = nouveaux **scripts d'extension** `yada-addonN` injectés avant `</body>` (greffe sur fonctions globales) + éventuels `<style id="...">` avant `</head>`.
2. **Numéros de ligne instables** → toujours re-chercher les ancres (grep) avant d'éditer.
3. **UTF-8 en clair** (accents/emoji), jamais `\uXXXX`. Attention aux apostrophes dans les chaînes JS en quotes simples : préférer les backticks pour le HTML, ou des guillemets doubles.
4. **Valider chaque modification** :
   - extraire chaque `<script>` et faire `node --check` (zéro erreur) ;
   - accolades CSS équilibrées (`{` == `}`) ;
   - balises `</head>`/`</body>`/`</html>` uniques ;
   - **rendu réel via Playwright** (Chromium) sur les 2 démos : parcourir les modules, capturer pageerror/console, vérifier que **toutes les écritures sont équilibrées** (Σ débit = Σ crédit).
   - Pré-requis test : `npm i -g playwright && npx playwright install chromium`.
   - **Filet de tests automatisé** : `node tests/equilibre-ecritures.mjs` charge `precompta.html` dans Chromium, réinitialise sur les 2 démos et vérifie que **chaque écriture est équilibrée** (Σ débit = Σ crédit) + exerce `posterFacture` (vente/achat). Lancé en CI à chaque push/PR via `.github/workflows/tests.yml` (installe Playwright à la volée — pas de `package.json` committé, voir `.gitignore`). En local hors-ligne, pointer un Chrome via `YADA_CHROME=/chemin/vers/chrome`.

## Architecture
- `render()` lit `current`, pose `document.body.dataset.page=current`, puis appelle le module via un objet de **dispatch réévalué à chaque rendu**. Réassigner `pageX = function(){…}` fonctionne → pattern de greffe : `const _p=pageX; pageX=function(){ return _p()+complement(); }`.
- **Persistance auto** : `save()` écrit tout `db` dans `localStorage` (clé `yada-db`) ; rechargé au démarrage (sinon `seed()` charge la démo). Export/Import JSON disponibles.
- Modale générique : `#modal` / `#modal-c` + `closeModal()`. Toasts : `toast(msg)`.

## Modèle de données `db`
`db = { cabinet:{dossiers[]}, dossiersData:{[id]:dataset}, activeId, …champs du dossier actif copiés au top-level (CHAMPS_DOSSIER, recopiés dans dossiersData[activeId] par persistActif()) }`.
Dataset : `societe` (raison, formeJur, siren, siret, tvaIntra, codeAPE, adresse, cp, ville, dirigeant, exoDebut/exoFin, exercices[], kbisRecu/kbisPdf, statutsRecu/statutsPdf…), `tiers[]` (type client/fournisseur, compteContre, compteTVA, taux, email, siret), `factures[]` (type achat/vente, tiersId, date, numero, ht/tva/ttc, compteContre, ecritureId), `ecritures[]` (journal ACH/VTE/BQ/OD/ODP/ODTVA, libelle, lignes:[{compte,lib,debit,credit,lettre?}]), `banque[]`, `reglements[]` (sens a_payer/a_encaisser, statut, restant), `docs[]` (documents commerciaux : type facture/devis/avoir, lignes[], ht/tva/ttc, statut brouillon/valide, envoye, ecritureId, **efact** pour e-invoice), `propositions[]` (Assistant IA), `relances{}`, `catalogue, immos, emprunts, paie, plan, journaux, seq, parametres` (dont **parametres.efact** = config opérateur e-invoice).

## Helpers globaux
`eur, r2, uid, c9, frDate, todayStr, ym, moisLabel, nextNum/nextNumUnique, save, render, toast, closeModal, head, flow, calcMontants(base,taux,'HT'|'TTC'), posterFacture(...), posterBanque(...), posterOD(...), genEcriture, analytique() → {prod,charge,parClient,parFourn,ca,achats,resultat}, tvaDuMois(m) → {col,ded,aDecaisser,credit}, moisDisponibles(), statsTiers(id), sageCode(t) (collectif 401/411 + 4 lettres — affichage), exoYear, addAnnees, exSuivant/exPrecedent, COMPTES, COMPTES_CHARGE, COMPTES_PRODUIT, PCG_COMPLET (~970 comptes), numIdentifiant, lookupSiret, tvaFromSiren, lookupConvention, relancesData/relancerClient, relancesCard, statutTag, dashRoute, chargerDossier, choisirDossier, datasetVide, societeDefaut, cabinetDefaut, chargerPlanBTP, voirDoc, telechargerDoc, docHTML, peutEnvoyer, genererEcritureDoc, transformerDevis, docEtatTag, ecTresorerie, ecEncoursParClient`.

## Modules (id → rôle)
`dash` tableau de bord · `societe` portefeuille · `client` **Espace Client** (chiffres clés, dépôt de pièces→OCR/IA, devis & factures, encours & relances, suivi par client) · `tiers` référentiel · `facturation` ventes : nouvelle facture (overlay), **cycle de vie** (attente→validé→envoyé verrouillé, suppression, lot), liste **Factures** (transfert ⚙ Générer), suivi/envoyées/saisie rapide/catalogue, **+ Facturation électronique opérateur relié (PPF/PDP) + Factur-X** · `achats` factures fournisseurs OCR (→ Assistant IA, panneau IA fournisseurs embarqué) · `compta` consultation (éditeur d'écritures façon Sage au double-clic) · `chargespaie` · `journal` · `ia` Assistant IA (écritures) · `tva` CA3 · `editions` (balance, grand livre) · `fec` import/export FEC (un FEC année N ouvre N **et** N+1) · `analytique` · `banque` · `saisiebq` (édition inline) · `rappro` lettrage · `reglements` · `immos` · `dossier` (création + suppression de dossier) · `infosociete` (fiche complète) · `coffre` · `parametrage`.

## Fonctionnalités majeures déjà livrées (addons 10→20)
Éditeur d'écritures façon Sage (double-clic) ; saisie banque inline ; facturation cycle de vie + lot ; Assistant IA (propositions d'écritures) ; achats → IA + panneau IA fournisseurs ; création de dossier (fiche + K-bis/Statuts) ; suppression de dossier ; Espace Client ; import FEC multi-exercice (N + N+1) ; sauvegarde automatique localStorage ; **facturation électronique opérateur relié + Factur-X** (dernière MAJ, voir en haut).

## Démarrage attendu d'une session
« Lis ce CLAUDE.md et `precompta.html`. Continue par ajouts chirurgicaux sans rien casser, en validant par `node --check` sur chaque `<script>` + un rendu Playwright sur les 2 démos (d-ama, d-sci42). »
