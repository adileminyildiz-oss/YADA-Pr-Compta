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

## 🟢 Dernière mise à jour — Immobilisations : nature → compte → compte de dotation (chaîne stricte, sans décalage) — v275
**Quoi :** la création d'une immobilisation suit désormais une **chaîne stricte** conforme à la demande : (1) la **Nature est obligatoire** (saisie bloquée sinon) ; (2) la nature **détermine le compte d'immobilisation** (reconnaissance — véhicule → `218200000`, téléphone → `218300000`, mobilier → `218400000`, logiciel → `205000000`…) ; (3) le compte d'immobilisation **détermine le compte de dotation** (le compte d'**amortissement 28x**, obtenu en **insérant un « 8 » après le premier chiffre** : `218200000` → `281820000`). Les comptes dérivés sont **lecture seule** (aucune valeur ne correspondant pas n'est possible) et **se mettent à jour automatiquement** quand le compte d'immobilisation change.

**Comment — `yada-addon148` (édité) :**
- `imSave` : **Nature requise** ; `compteAmort=compteAmortDe(cpt)` (28x, règle « +8 »), `compteDot=imDotDe(cpt)` (charge 6811, interne à l'écriture) — dérivés du compte, plus lus depuis un champ libre.
- Modale : champ « Compte de dotation » désormais **lecture seule** (`im-dotdisp`), mis à jour par `imCptCascade` = `c9(compteAmortDe(compte))`. Nature marquée `*` (obligatoire).
- Fiche (`imDetail`, onglets Attributs **et** Comptable) : les anciens sélecteurs éditables 6811/28x sont remplacés par **une ligne lecture seule** « Compte de dotation : <28x> (accordé au compte d'immo) ». `imEdit` recalcule `compteAmort`/`compteDot` à chaque changement de compte → l'affichage suit.

**Note comptable :** le « compte de dotation » au sens de l'utilisateur = le compte d'**amortissement 28x** (crédité de l'OD de dotation). L'écriture de dotation reste **débit 6811 (dotation aux amortissements) / crédit 28x** (équilibrée). Validé : `node --check` (137 scripts) + dérivation testée (véhicule 218200000 → 281820000, logiciel 205 → 280500000…). Badge → **v275 · nature → compte → dotation (strict)**.

---

## 🟢 MAJ précédente — Immobilisations : compte de dotation (et d'amortissement) accordé au compte d'immobilisation, visible dans Attributs — v274
**Quoi :** dans la fiche d'immobilisation, **changer le compte d'immobilisation** met aussi à jour le **compte de dotation** (et le compte d'amortissement). Le changement était déjà appliqué en données (`imEdit` : compte → `compteAmort=compteAmortDe`, `compteDot=imDotDe`) mais les champs « Compte de dotation / d'amortissement » n'étaient affichés que dans l'onglet **Comptable** → l'accord n'était pas visible au moment du changement (fait dans **Attributs**). Désormais les deux comptes sont **affichés (et éditables) directement sous le Compte dans l'onglet Attributs** → ils se mettent à jour à l'écran dès qu'on change le compte d'immobilisation.

**Comment — 1 ajout dans l'override `imDetail` (Attributs) :** après la ligne `rowS('Compte :', …)`, insertion de `rowS('Compte de dotation :','compteDot', …, DOT_OPTS)` + `rowS("Compte d'amortissement :",'compteAmort', …, AMORT_OPTS)`. `imEdit` (inchangé) recalcule `compteDot` (incorporel 20x→681110000, corporel 21x→681120000) et `compteAmort` (28x) puis `render()` → les sélecteurs reflètent l'accord ; un choix manuel reste possible. Validé : `node --check` (137 scripts). Badge → **v274 · dotation accordée au compte immo**.

---

## 🟢 MAJ précédente — Immobilisations : liste de comptes FERMÉE (cliquer pour ouvrir) + génération des écritures d'immobilisation & de dotation — v273
**Quoi :** dans **Immobilisations & Financements** (`yada-addon148`, suite de v271) :
1. Le **sélecteur de compte d'immobilisation** (modale « Nouvelle immobilisation ») n'est **plus une liste ouverte** (`<select size="8">`) : c'est un **menu déroulant fermé** que l'on **clique pour ouvrir**, puis on voit la sélection. La reconnaissance/auto-dotation reste active.
2. **Génération des écritures** depuis l'onglet **Attributs** (section « Écritures comptables ») via 2 boutons :
   - **« Générer l'écriture d'immobilisation »** (`imGenererAcquisition`) → écriture d'acquisition (journal **ACH**) : **débit 2xx** (HT) + **débit 445620000** (TVA déductible/immo, selon le **Taux TVA** ajouté) = **crédit 404000000** (fournisseurs d'immobilisations, TTC). Équilibrée.
   - **« Générer l'écriture de dotation <année> »** (`imGenererDotation`) → OD : **débit 6811x** (dotation) / **crédit 28xx** (amortissement), montant = dotation de l'exercice (`immoRowAnnee`).
   - **Idempotent** (libellés « ACQUISITION IMMO <n°> » / « DOTATION IMMO <n°> <an> ») ; les boutons passent à **✓** une fois générés.
3. Champ **Taux TVA** ajouté (modale + Attributs éditable), comptes `404000000` / `445620000` enregistrés.

**Comment :** édition de l'override `imAdd` (select fermé + champ TVA), nouveau `window.imSave` (capture `tauxTVA`), `imGenererAcquisition`/`imGenererDotation`/`imAcqFaite`/`imDotFaite` (via `posterOD`), boutons greffés dans `imDetail` (Attributs). Validé : `node --check` (137 scripts) + équilibre de l'écriture d'acquisition à 20/10/0 % (Σ débit = Σ crédit). Badge → **v273 · immo : liste fermée + écritures**.

---

## 🟢 MAJ précédente — Consultation / éditeur : flèches (spinners) des champs Débit/Crédit masquées — v272
**Quoi :** dans la **Consultation des comptes** (saisie / édition), les champs **Débit** et **Crédit** (`<input type="number">`) affichaient les **petites flèches haut/bas** (spinners) pour augmenter/diminuer le montant. Elles sont désormais **masquées**.

**Comment — `yada-addon149` (100% CSS additif, `<style id="ec-nospin-mod">`) :** `::-webkit-outer/inner-spin-button{-webkit-appearance:none}` sur `.ec-num` et `.ec-sage input[type=number]`, + `appearance:textfield` (Firefox). Aucune logique modifiée (saisie au clavier inchangée). Validé : `node --check` (137 scripts). Badge → **v272 · débit/crédit sans flèches**.

---

## 🟢 MAJ précédente — Immobilisations : comptes enrichis + sélecteur à molette + reconnaissance + fiche éditable + reprise/sortie — v271
**Quoi :** refonte fonctionnelle du module **Immobilisations & Financements** (`yada-addon148`, 100% additif) :
1. **Liste des comptes d'immobilisation enrichie** (PCG) : ajout des comptes manquants (203, 206, 208, 212, 214, 215400, 215500, 218100, 218600, 271, 274), triés par numéro, avec libellés des comptes d'amortissement (28x).
2. **Sélecteur à molette** dans « Nouvelle immobilisation » : `<select size="8">` défilable (molette) pour voir tous les comptes.
3. **Association compte d'immo → compte de dotation automatique** : incorporel (20x) → `681110000`, corporel (21x) → `681120000`, financier (26/27) → aucune. Mise à jour auto à la sélection.
4. **Reconnaissance du compte d'après la nature / désignation** : téléphone/ordinateur → 2183, véhicule → 2182, mobilier → 2184, logiciel/licence → 205, machine/outillage → 215, terrain → 211, construction → 213, caution → 275… (`imDevineCompte`, texte sans accents). Auto-proposé tant que l'utilisateur n'a pas choisi manuellement.
5. **Onglets Attributs / Comptable / Fiscal ÉDITABLES** (paramètres) : Numéro, Nature, Compte, Montant HT, Dates, Fournisseur, Mode, Durée, Valeur résiduelle, Compte de dotation, Compte d'amortissement — modifiables (`imEdit` → `save`+`render`). Les **résultats** (dotation, cumul, VNC) restent **calculés** (immoPlan/immoRowAnnee).
6. **Attributs — boutons Sortie / Cession** (`imCeder`, comptabilisation VNC 675/amort/immo/512/775 existante) et **Reprise sur dépréciation** (`imReprise` → OD : débit 29x dépréciation / crédit `781600000`), + « Annuler la sortie » si une sortie existe.

**Comment :** override de `imAdd` (modale + handlers `imAutoCompte`/`imCptCascade`) et de `imDetail` (rendu éditable `imEdit`/`imReprise`/`imAnnulerSortie`) ; `IMMO_COMPTES` enrichi/trié ; mapping `imDotDe`/`imDeprecDe` ; `<style id="im-edit-mod">` (champs `.im-ev`, sélecteur `.im-cpt-scroll`).

**Limites :** reconnaissance par mots-clés (heuristique, modifiable manuellement) ; terrains (211) reçoivent un compte de dotation par défaut (non amortis en réalité — durée/dotation à la main) ; calculs d'amortissement inchangés. Validé : `node --check` (136 scripts) + test reconnaissance/association (iPhone→2183/681120000, logiciel→205/681110000, dépôt→275/—). Badge → **v271 · immo : comptes + édition + reprise**.

---

## 🟢 MAJ précédente — Suivi des règlements : cartes KPI du haut remplies depuis les factures non réglées (FEC inclus) — v270
**Quoi :** dans le **Suivi des règlements**, les **4 cartes KPI du haut** (Total dû / Dont en retard / Dont indemnités de recouvrement / Tiers en alerte) restaient à **0,00 €** pour un dossier alimenté par **FEC** (elles ne lisaient que `db.reglements`, vide). Elles sont désormais **remplies à partir des factures non réglées dérivées des écritures** (mêmes données que la carte « Factures non réglées » de v264) **quand le suivi `db.reglements` est vide** pour l'onglet courant — sinon l'existant (factures du logiciel) est conservé.

**Comment — `yada-addon147` (override `pageReglements`, 100% additif) :**
- `window.regKPIDepuisEcritures(type)` parcourt `window.regOpenGroups(type)` (factures non réglées = lignes non lettrées du compte de tiers) et calcule : **Total dû** (= montants + indemnités), **Dont en retard**, **Dont indemnités** (40 €), **Tiers en alerte** (≥3 factures en retard). **Échéance estimée** = date d'écriture + délai de paiement par défaut (`db.societe.delaiPaiement`, sinon 30 j) ; en retard si échéance < aujourd'hui.
- Greffe : si **aucun règlement ouvert** dans `db.reglements` pour le sens courant (`a_encaisser`/`a_payer`), les valeurs des 4 cartes (`.reg-k .v`) sont remplacées par regex sur leurs libellés (sinon inchangées).

**Limites :** retard/indemnités **estimés** (faute d'échéance saisie sur les écritures FEC) ; pour un dossier avec `db.reglements` (échéances réelles) le calcul existant est conservé. Affichage/calcul seulement. Validé : `node --check` (135 scripts) + test données réelles (MBC clients Total dû 29 692,40 € / 720 € indemnités / 1 alerte · MBC fourn. 12 644,15 € · ALR clients 1 820 €). Badge → **v270 · KPI règlements depuis écritures**.

---

## 🟢 MAJ précédente — Consultation : compteur des journaux PAR MOIS (zéro masqué) — v269
**Quoi :** dans la **Consultation des comptes**, la **liste des journaux** (colonne de gauche) affichait à côté de chaque journal (ex. « O - OD OPERATIONS DIVERSES (6) ») un nombre qui était le **cumul de l'année** (ex. 214 pour ACHATS), quel que soit le mois sélectionné. Désormais le nombre = **les écritures du SEUL mois sélectionné** (cohérent avec la grille `sgJournalGrid` qui n'affiche que le mois) ; et **s'il n'y a aucune écriture ce mois-là, aucun nombre n'est affiché** (le journal apparaît sans « (n) »).

**Comment — 2 éditions chirurgicales :**
- `sgJournaux(per)` : `ecrituresJusqua(per)` (cumul depuis le début d'année) → comptage **mois-exact** `db.ecritures` filtrées par `ym(e.date)===per` (ou tout le dossier si aucun mois).
- Ligne `jrnRows` (`pageCompta`) : `(${j.n})` → `${j.n>0?(' ('+j.n+')'):''}` → le compteur n'apparaît que si > 0 ; les journaux à 0 restent grisés (`.zero`) et sans nombre.

**Limites :** affichage/comptage seulement (aucune écriture modifiée). Validé : `node --check` (134 scripts) + test données réelles (MBC : ACH total 214 ; nov. 46 / déc. 36 / juin 15 ; « OD » en novembre = 0 → masqué). Badge → **v269 · compteur journal par mois**.

---

## 🟢 MAJ précédente — Éditeur : descendre sur une écriture NON soldée → ajoute une ligne à solder — v268
**Quoi :** dans l'**éditeur d'écritures** (Consultation des comptes), quand on **descend** — **Entrée** depuis un champ Débit/Crédit, ou **flèche du bas** — depuis la **dernière ligne d'une écriture NON soldée** (Débit ≠ Crédit), une **ligne est ajoutée à CETTE écriture** pour pouvoir la solder (au lieu de quitter ou de créer une autre écriture). **Garde :** tant que la dernière ligne ajoutée n'est **pas utilisée** (aucun compte ni montant), aucune autre ligne n'est ajoutée (le curseur y est maintenu) → chaque ligne doit être remplie avant de passer à la suivante. Si l'écriture **est soldée**, le comportement normal reprend (écriture suivante / nouvelle écriture, v259/v261).

**Comment — `yada-addon146` + 2 éditions d'`addon114` :**
- `window.ecDescendre(eid)` : calcule l'équilibre de l'écriture ; **soldée → `false`** (le caller continue normalement) ; **non soldée → `true`** après avoir, si la **dernière ligne est utilisée**, appelé `ecAddLine(eid)` (ajout d'une ligne + `ecRender`, curseur placé sur le compte de la nouvelle ligne), sinon maintenu le curseur sur la ligne vide (message « Remplissez cette ligne… »).
- `addon114` : sur **flèche du bas** depuis la dernière ligne d'une écriture → `ecDescendre(eid)` avant tout ; sur **Entrée** depuis un champ **Débit (col 6)/Crédit (col 7)** de la dernière ligne → idem. Sinon, comportement inchangé (navigation champ/ligne, nouvelle écriture en bas de liste si soldée).

**Limites :** réutilise `ecAddLine`/`ecRender` (aucune logique comptable ajoutée) ; la navigation champ par champ (compte/libellé) avec Entrée reste disponible. Validé : `node --check` (134 scripts). Badge → **v268 · ↓ ajoute une ligne à solder**.

---

## 🟢 MAJ précédente — Consultation / éditeur : ligne ROUGE sous une écriture non soldée + bouton « Solder l'écriture » retiré — v267
**Quoi :** dans l'**éditeur d'écritures** (Consultation des comptes), une **ligne ROUGE** apparaît désormais sous une **écriture NON soldée** (Débit ≠ Crédit) pour **prévenir l'utilisateur qu'il doit la solder avant de fermer ou de traiter une autre écriture**. Le **bouton « Solder l'écriture »** est **retiré** et remplacé par cette ligne rouge (+ un court message d'avertissement). La **ligne bleue** reste sous une écriture **soldée** (séparateur, inchangé). Le blocage de fermeture/creation tant qu'une écriture n'est pas soldée (v216/v261) est conservé.

**Comment — 2 éditions chirurgicales de `ecRender` + `yada-addon145` (CSS) :**
- `ecRender` : la ligne d'action n'affiche plus le bouton `ecSolder` ; à la place, **« ⚠ Écriture non soldée — à solder (Débit = Crédit)… »** (`.ec-koo`). Le filet séparateur (`.ec-redrow`) est émis **après chaque écriture** avec la classe `is-ok` (soldée) ou `is-ko` (non soldée).
- `addon145` (`<style id="ec-solder-rouge-mod">`, injecté en fin de `<head>`) : `.ec-redrow.is-ko .ec-soldee` → filet **rouge `#e1342c`** (spécificité `.ec-table tbody tr…` > règle bleue d'addon112) ; `.is-ok` → filet **bleu `#1e90ff`** ; `.ec-koo` rouge clair, `.ec-okk` vert.

**Limites :** affichage uniquement (aucune logique comptable modifiée) ; `ecSolder` reste défini mais n'est plus appelé. Validé : `node --check` (133 scripts). Badge → **v267 · ligne rouge non soldée**.

---

## 🟢 MAJ précédente — Modules Client / Fournisseur : factures (saisies + FEC) associées + carte de CORRESPONDANCES — v266
**Quoi :** dans le **module Client** (Suivi des factures de **vente**) et le **module Fournisseur** (Suivi des factures d'**achat**), une carte **« Correspondances — factures … (écritures VTE/ACH, FEC inclus) »** associe désormais **toutes les factures faites OU importées via le FEC** : reconstituées **depuis les écritures comptables** (journal VTE pour les ventes, ACH pour les achats), avec la **correspondance facture ↔ comptabilité**. Auparavant les suivis ne lisaient que `db.docs`/`db.factures` (saisies dans le logiciel) → **vides** pour un dossier FEC (ex. MBC : « Aucune facture de vente créée » alors que 59 écritures VTE existent).

**Comment — `yada-addon144` (override `suiviFacturesVente`/`suiviFacturesAchat`, 100% additif) :**
- `window.factDepuisEcritures(sens)` parcourt les écritures du **journal VTE** (vente) ou **ACH** (achat) et reconstitue chaque facture : **TTC** = mouvement du compte de tiers (411 débit / 401 crédit), **HT** = lignes classe 7 (vente) / classe 6 (achat), **TVA** = lignes `445x`. Tiers par **compte auxiliaire** (`c9(t.compteAux)`), sinon via `factureId`/banque, sinon « (tiers non identifié) ».
- **Correspondance** par facture : **« ✓ liée au logiciel »** si `e.factureId` ou un n° de pièce identique existe dans `db.docs`/`db.factures` ; sinon **« FEC / écriture »**.
- `window.correspondancesCard(sens)` rend la carte : **KPIs** (nb factures · dont liées / FEC · Total HT/TVA/TTC) + tableau N° de pièce / Tiers / Date / Jnl / HT / TVA / TTC / Correspondance (tri par date décroissante). Greffée sous chaque suivi.

**Limites :** affichage/calcul seulement (aucune écriture modifiée) ; un dossier en comptes **collectifs** sans comptes auxiliaires affiche « (tiers non identifié) » ; le TTC reflète le mouvement du compte de tiers de l'écriture. Validé : `node --check` (132 scripts) + test données réelles (MBC vente 59 fact./HT 113 347 € · MBC achat 214 · ALR vente 2/1 740 €). Badge → **v266 · correspondances factures FEC**.

---

## 🟢 MAJ précédente — Immobilisations & Financements : zone de travail accordée au thème (bleu nuit, fin du blanc) — v265
**Quoi :** dans le module **Immobilisations & Financements**, l'onglet **Immobilisations** affichait sa **zone de travail (`.im-screen`) en BLANC** (style Sage noir-sur-blanc) — en décalage avec les autres modules en **bleu nuit**. Elle est désormais **accordée au thème** : fond bleu nuit, accents bleu Crystal, textes clairs, **plus aucun blanc** (3 volets Périodes / Immobilisations / Détail, barre d'outils, onglets de détail, sections & lignes de la fiche). Les autres onglets (Emprunts, Crédit-bail, Locations, Taxe véhicules) utilisaient déjà des cartes `.card` au thème → inchangés.

**Comment — `yada-addon143` (100% CSS additif, `<style id="im-navy-mod">`) :**
- Surcharge **scopée `body[data-theme="noir"]`** et **injectée en fin de `<head>`** (source plus tardive) pour **battre** les anciennes règles `body[data-theme="noir"] .im-screen *{color:#1b1b1b}` / `background:#fff` (spécificité égale, dernière déclarée gagne).
- Palette reprise des autres modules : zone `#0c1a2a`, en-têtes `linear-gradient(#16304a,#0f2236)`, lignes/bordures `rgba(30,144,255,.2)`, sélection `rgba(30,144,255,.18)` + filet `#1e90ff`, valeurs `.im-row .v` `#0a1726`/`#24405d`, libellés `#9fb6d0`, accents `#5ab0ff`. Onglet **Immobilisations** actif raccordé à la zone (au lieu du blanc).

**Limites :** affichage uniquement (aucune logique/écriture modifiée) ; restylage **ciblé thème noir** (thèmes clairs inchangés, déjà cohérents avec leurs cartes claires). Validé : `node --check` (131 scripts) + balises structurelles uniques. Badge → **v265 · immo accordée au thème**.

---

## 🟢 MAJ précédente — Suivi des règlements : « Factures non réglées » depuis TOUTES les écritures (FEC inclus) — v264
**Quoi :** le module **Suivi des règlements** gagne une carte **« 📄 Factures non réglées »** (sous le suivi existant, pour l'onglet courant Clients/Fournisseurs) qui liste **toutes les factures saisies OU importées via le FEC** qui **n'ont pas encore été réglées** — y compris les **clients/fournisseurs sans `db.factures`** (dossiers alimentés par FEC). Auparavant le suivi ne lisait que `db.reglements` (créé uniquement par les factures émises dans le logiciel) → la liste était **vide** pour un dossier FEC.

**Comment — `yada-addon142` (override `pageReglements`, 100% additif) :**
- `window.regOpenGroups(type)` parcourt **toutes les écritures** : retient les **lignes NON LETTRÉES** (`!l.lettre` = non réglé) du **compte de tiers** — côté facture **débit** pour un client (créance), **crédit** pour un fournisseur (dette). Rattachement au tiers par **compte auxiliaire** (`c9(t.compteAux)`), sinon collectif 401/411 via `factureId`/banque, sinon « (tiers non identifié) ». Exclut « OD RÉSULTAT ».
- `window.regFacturesNonRegleesCard(type)` rend la carte : **KPIs** (Total non réglé · nb factures · tiers concernés) + un **bloc par tiers** (réutilise `.reg-bloc`/`.reg-t`/`.reg-kpis`) listant Date / Jnl / Pièce / Libellé / **Montant non réglé** (tri par montant décroissant, tiers non identifié en dernier).
- Greffe : `pageReglements = _pr() + regFacturesNonRegleesCard(regOnglet)`.

**Limites :** « non réglé » = ligne **non lettrée** du compte de tiers (le lettrage solde la facture) ; un dossier en comptes **collectifs** sans comptes auxiliaires regroupe sous « (tiers non identifié) ». Affichage/calcul seulement (aucune écriture modifiée). Validé : `node --check` (130 scripts) + test données réelles (MBC clients 18 fact./28 972,40 € · MBC fourn. 15/12 044,15 € · ALR clients 2/1 740 €). Badge → **v264 · factures non réglées**.

---

## 🟢 MAJ précédente — Rapprochement bancaire : liste « Rapprochements bancaires effectués » retirée (haut de page) — v263
**Quoi :** dans le **Rapprochement bancaire**, la **liste du haut** « Rapprochements bancaires effectués » (récap) est **entièrement retirée** (jugée inutile). Le reste du module (barre des périodes avec badges ✓/🔒/◐, relevé, lignes…) est **inchangé**.

**Comment — `addon121` (1 retrait chirurgical) :** dans l'override `pageRappro`, suppression de l'injection `html.replace('<div class="rb-top">', rapRecapHTML()+…)`. La fonction `rapRecapHTML` reste définie mais n'est plus appelée.

**Limites :** affichage uniquement. Validé : `node --check` (129 scripts). Badge → **v263 · rappro sans récap**.

---

## 🟢 MAJ précédente — Rapprochement bancaire : colonne « État » retirée du récap — v262
**Quoi :** dans le **Rapprochement bancaire**, le récapitulatif « Rapprochements bancaires effectués » n'affiche plus la colonne **« État »** (pastilles `✓ Soldé` / `🔒 Verrouillé` / `● Écart` qui ressemblaient à des interrupteurs inutiles). Le récap garde Mois · Compte 512 · Relevé · Solde relevé.

**Comment — `rapRecapHTML` (addon121), 2 retraits chirurgicaux :** suppression du `<th>État</th>` et de la cellule `<td>'+statut+'</td>`. Les badges de mois (✓/🔒/◐ dans la colonne Mois et sur la barre des périodes) restent inchangés.

**Limites :** affichage uniquement (aucune donnée/statut de rapprochement modifié). Validé : `node --check` (129 scripts). Badge → **v262 · rappro sans colonne État**.

---

## 🟢 MAJ précédente — Éditeur d'écritures : ↓ crée une écriture SEULEMENT si la précédente est soldée — v261
**Quoi :** dans l'éditeur (Consultation des comptes), la **flèche du bas** ne crée une **nouvelle écriture** que si l'**écriture précédente est soldée** (Débit = Crédit) et **non vide**. Sinon un message s'affiche et le curseur revient sur l'écriture à corriger.

**Comment — verrou ajouté dans `window.ecAjouterEcriture` (addon140) :**
- Si une écriture mouvementée de la liste n'est **pas équilibrée** (écart ≥ 0,005) → message « Soldez l'écriture précédente… » + focus sur l'écriture concernée ; **création refusée**.
- Si la **dernière** écriture est **vide** (aucun montant) → message « Saisissez et soldez l'écriture en cours… » + focus ; **création refusée** (évite d'empiler des écritures vides).
- Sinon → création normale (comportement v259).

**Limites :** réutilise l'éditeur existant (aucune logique comptable ajoutée). Validé : `node --check` (129 scripts). Badge → **v261 · ↓ après solde**.

---

## 🟢 MAJ précédente — Analytique & rentabilité : cartes remplies depuis TOUTES les écritures — v260
**Quoi :** les cartes du module **Analytique & rentabilité** (Produits par compte, Charges par nature, CA par client, Dépenses par fournisseur, KPIs CA/Charges/Résultat) étaient **vides** pour un dossier alimenté par **FEC / saisies** (car `analytique()` ne lisait que `db.factures`). Elles sont désormais **calculées sur toutes les écritures**.

**Comment — `yada-addon141` (override `window.analytique`, même forme de retour) :**
- **Produits par compte** (classe 7 = crédit−débit), **Charges par nature** (classe 6 = débit−crédit), **CA / Charges / Résultat** = sommes correspondantes. Exclut « OD RÉSULTAT ».
- **CA par client / Dépenses par fournisseur** depuis les **comptes auxiliaires** des tiers (débit pour clients, crédit pour fournisseurs) — rempli quand le dossier utilise des comptes auxiliaires par tiers (sinon, comptes collectifs → non ventilable par tiers).
- Profite aussi à l'**Espace Client** (suivi par client) et au hero mobile qui lisent `analytique()`.

**Limites :** un dossier sans écritures (ex. société non démarrée) reste vide ; la ventilation par tiers nécessite des comptes auxiliaires. Validé : `node --check` (129 scripts) + test données réelles (MBC : CA 113 347 € / Charges 100 350 € / Résultat 12 997 €). Badge → **v260 · analytique sur écritures**.

---

## 🟢 MAJ précédente — Éditeur d'écritures : FLÈCHE BAS en fin de liste → nouvelle écriture — v259
**Quoi :** dans l'**éditeur d'écritures** (page d'édition de la Consultation des comptes), appuyer sur **flèche du bas** depuis la **dernière ligne de la dernière écriture** **crée une nouvelle écriture** à saisir (curseur placé sur la saisie du compte). L'écriture doit être **soldée** (Débit = Crédit) pour être valide.

**Comment — `yada-addon140` + 1 édition d'`addon114` :**
- `addon114` (clavier) : sur `ArrowDown`, si la ligne courante est la **dernière** `tr.ec-r` de la table → `window.ecAjouterEcriture()` (sinon comportement normal `moveRow(1)`).
- `window.ecAjouterEcriture()` : pousse une nouvelle écriture (journal = filtre courant ou `OD` ; date = dernière écriture ; en mode compte, 1re ligne pré-remplie avec le compte consulté pour qu'elle apparaisse), `ecRender()`, puis focus sur la saisie du compte.
- **Validation** : `ecFermer` bloque déjà la fermeture tant qu'une écriture n'est pas équilibrée. Les écritures laissées **vides** (aucun montant) sont **purgées à la fermeture** (pas d'écriture fantôme).

**Limites :** réutilise l'éditeur existant (aucune logique comptable ajoutée). Validé : `node --check` (128 scripts). Badge → **v259 · éditeur ↓ nouvelle écriture**.

---

## 🟢 MAJ précédente — Module Banque : relevé présenté PAR ANNÉE puis PAR MOIS — v257/v258
**Quoi :** dans le **module Banque**, les écritures du relevé sont **présentées par mois**, et si le dossier comporte **plusieurs exercices** (2025, 2026…) une barre de **boutons d'année** apparaît d'abord (avec compteur), puis les **boutons mois** de l'année choisie. Tous les relevés traités restent accessibles (rien n'est masqué) ; il faut **choisir un mois** pour voir ses écritures.

**Année — v258 (`pageBanque` + `bqSetAnnee`) :** `anneesDispo` (années distinctes des écritures banque), barre `.bq-annee-bar` affichée **uniquement si >1 année** (accent or), défaut = année la plus récente ; changer d'année réinitialise le mois (`window.bqMoisSel=''`). `bqMois` n'est valide que si son année = année choisie.

**Comment — `pageBanque` (édition chirurgicale) + `yada-addon139` :**
- `pageBanque` : calcule `moisDispo` (mois distincts des écritures banque, via `ym`), `moisCount` (compteur par mois), et `bsrcMois` (écritures filtrées sur `window.bqMoisSel`). La carte « Relevé bancaire — par mois » rend la barre `.bq-mois-bar` (boutons `.bq-mois` + compteur `.bq-mc`) ; le tableau ne s'affiche **que si un mois est sélectionné**, sinon invite « 👆 Sélectionnez un mois ». Le filtre par compte bancaire (512) est conservé.
- `addon139` : `window.bqSetMois(m)` (toggle + `render`) + style des boutons mois (bleu nuit/Crystal, responsive).

**Limites :** affichage/filtre uniquement (aucune écriture/montant modifié). Validé : `node --check` (127 scripts). Badge → **v257 · banque par mois**.

---

## 🟢 MAJ précédente — Analytique & rentabilité : section avancée sur les ÉCRITURES (KPIs + graphiques + tableaux) — v256
**Quoi :** le module **Analytique & rentabilité** gagne une section **« 📊 Analytique avancée (sur écritures) »** calculée sur **toutes les écritures** (`db.ecritures` : factures + FEC + saisies), comme la Consultation — au lieu des seules factures.

**Contenu (`yada-addon138`, 100% additif, sans bibliothèque externe) :**
- **Filtre par exercice** (boutons année, défaut = année la plus récente des écritures).
- **KPIs** : CA (70x), Charges (60x), Résultat, marge %, Variation de trésorerie (flux 512).
- **4 graphiques SVG** (tooltips natifs `<title>`) : évolution mensuelle **CA vs Charges** (barres groupées), **trésorerie cumulée** (courbe), **répartition des charges** et **des produits** (donuts + légende top 6 + « Autres »).
- **Tableaux analytiques** : résultat mensuel (CA/Charges/Résultat/Marge + total), **Top clients** (CA) et **Top fournisseurs** (dépensé) calculés depuis les comptes auxiliaires.
- **Fonctionnalités** : **export CSV** du tableau mensuel, **impression** (`@media print`).

**Calcul :** classe 7 = crédit−débit (produit), classe 6 = débit−crédit (charge), exclut « OD RÉSULTAT ». Greffe : `pageAnalytique = _pa()+anaAvancee()`. Validé : `node --check` (126 scripts) + test sur données réelles (MBC 2025 : CA 113 347 € / Charges 100 350 € / Résultat 12 997 €). Badge → **v256 · analytique avancée**.

---

## 🟢 MAJ précédente — Paramétrage : bouton « Enregistrer la version actuelle & télécharger » — v255
**Quoi :** dans **Paramétrage** (carte « Transfert manuel »), un nouveau bouton **« 💾 Enregistrer la version actuelle & télécharger »** **enregistre l'état courant dans YADA** (localStorage + cloud si activé) **puis télécharge** le fichier `precompta-AAAA-MM-JJ.json` à jour.

**Comment — `yada-addon137` :** `window.exportJSONEnregistre()` = `persistActif()` → `save()` (enregistre dans YADA) → `cloudPushNow()` (push immédiat si synchro activée, sinon sans effet) → `exportJSON()` (télécharge le fichier à jour). Greffe sur `transfertManuelCard` (bouton injecté avant « ⬇️ Télécharger la base »).

**Limites :** export/enregistrement uniquement (aucune logique comptable touchée). Validé : `node --check` (125 scripts). Badge → **v255 · enregistrer & télécharger**.

---

## 🟢 MAJ précédente — Journal comptable : facture liée (fournisseur/client) à la suite de la date — v254
**Quoi :** dans le **module Journal comptable**, la **facture** liée à l'écriture (fournisseur ou client) s'affiche **juste après la date**, **cliquable** (voir) et **téléchargeable** (⤓).

**Comment — `yada-addon136` + 1 insertion dans `pageJournal` :**
- En-tête `.ecr-h` : après `${e.date}`, insertion de `${jrnFactureLien(e)}`.
- `window.jrnFactureLien(e)` résout le fichier par priorité : **dépôt** (PDF réel, `db.parametres.depots[].fichierId` → `gedVoir`/`gedDl`) → **doc avec fichier joint** (`gedVoir`/`gedDl`) → **doc** facture générée (`voirDoc`/`telechargerDoc`) → **facture d'achat** sans fichier (`voirFactureAchat`, aperçu seul). Libellé « 📎 Facture fourn./client N° ».
- Style `<style id="jrn-fac-mod">` (pastille bleue cliquable + bouton ⤓).

**Limites :** lien d'affichage/téléchargement (aucune écriture/montant modifié) ; les écritures sans facture (banque, O.D.) n'affichent rien. Validé : `node --check` (124 scripts). Badge → **v254 · journal facture liée**.

---

## 🟢 MAJ précédente — Journal comptable : clic droit sur une écriture → édition des comptes — v253
**Quoi :** dans le **module Journal comptable**, un **clic droit** sur une écriture ouvre l'**édition des comptes** (l'éditeur d'écritures façon Sage), positionné sur l'écriture cliquée — même mécanisme que la Consultation.

**Comment — `yada-addon135` + 1 attribut sur `.ecr` :**
- Bloc `.ecr` de `pageJournal` : ajout de `data-ecr` + `oncontextmenu="return jrnCtx(event, id)"`.
- `window.jrnCtx(ev,eid)` : menu contextuel `#jrn-ctx` (« ✎ Éditer l'écriture (édition des comptes) »).
- `window.jrnEditerEcr(eid)` : ouvre `ouvrirJournalEditable(e.journal, ym(e.date), e.id)` (éditeur filtré au journal + mois, défile/focus sur l'écriture) ; repli `ouvrirEcrituresCompte`.

**Limites :** ouverture de l'éditeur existant (aucune logique comptable ajoutée). Validé : `node --check` (123 scripts). Badge → **v253 · journal clic droit éditer**.

---

## 🟢 MAJ précédente — Journal comptable : un ONGLET par journal (BQ/HA/VT/OD/ODP/ODC/ODTVA) — v252
**Quoi :** la page **Journal comptable** affiche désormais une **barre d'onglets** — un onglet par journal (**Tous · BQ · HA · VT · OD · ODP · ODC · ODTVA**, avec compteur d'écritures) — qui **regroupe les écritures du journal sélectionné**. Remplace l'ancien menu déroulant qui mélangeait OD/ODP/ODTVA sous « OD ».

**Comment :**
- `jrnMatch` : filtrage en **journal exact** (`e.journal!==jrnFiltre`) → `OD` ≠ `ODP`/`ODC`/`ODTVA` (chaque onglet montre uniquement son journal).
- `pageJournal` (override) : le bloc « Filtrer par journal » (`<select>`) est remplacé par `.jrn-tabs` (boutons `.jrn-tab` avec compteur `.jrn-c`) ; tri par date + recherche conservés ; titre de carte = nom du journal sélectionné.
- `yada-addon134` : style `<style id="jrn-tabs-mod">` (onglets bleu nuit/Crystal, actif en dégradé, responsive mobile).

**Limites :** affichage/filtre uniquement (aucune écriture/montant modifié). Validé : `node --check` (122 scripts). Badge → **v252 · journal par onglets**.

---

## 🟢 MAJ précédente — Import de données → poussée cloud IMMÉDIATE (données importées toujours à jour partout) — v251
**Quoi :** après un **import de base** (Paramétrage → Transfert manuel → Importer), les données importées sont **poussées immédiatement vers le cloud** et deviennent la **version courante** sur tous les appareils — au lieu d'attendre le push différé (1,8 s) déclenché par `save()`.

**Pourquoi :** demande utilisateur — « chaque mise à jour de données importée doit toujours être actuelle ». La poussée immédiate supprime la fenêtre de latence et fixe l'horodatage local (`TSK`), donc **aucune ancienne copie cloud ne peut écraser** les données fraîchement importées au prochain pull.

**Comment — 1 édition chirurgicale d'`importJSON` :** après `save(); snapshotDB();`, ajout de `try{ if(typeof cloudPushNow==='function') cloudPushNow(); }catch(_e){}`. `cloudPushNow` (addon102) est **sans effet si la synchro n'est pas configurée** (`return Promise.resolve(false)`), donc 100% sûr hors-ligne / sans cloud.

**Prérequis multi-appareils :** la synchro cloud (Pantry) doit être **activée** pour propager ; sinon l'import reste local (et conservé) sur l'appareil. Validé : `node --check` (121 scripts). Badge → **v251 · import → cloud immédiat**.

---

## 🟢 MAJ précédente — Reclassement des journaux PRUDENT (les O.D. diverses restent en OD) — v250
**Quoi :** le reclassement des journaux (addon132) devient **prudent** pour ne plus déplacer par erreur des **O.D. diverses** qui contiennent simplement un compte 445/645/641. Les écritures déplacées à tort vers ODTVA/ODC/ODP sont **ramenées en OD**.

**Pourquoi :** la version v249 reclassait dès la **simple présence** d'un compte (ex. une O.D. avec une seule ligne 445 partait en ODTVA). Trop agressif → faux positifs.

**Comment — `cibleJournal` réécrit (libellé + signature structurelle, défaut = OD) :**
- **TVA → ODTVA** : libellé contient `TVA`, **ou** l'écriture est composée **uniquement** de comptes de TVA `445x` (déclaration CA3). Une O.D. avec une seule ligne 445 parmi d'autres **reste en OD**.
- **PAIE → ODP** : libellé paie, **ou** salaire brut `641` **ET** personnel `421` / cotisations `645` (signature complète).
- **CHARGES → ODC** : libellé charges, **ou** compte social classe 6 (`645/648/631`) **ET** organisme à payer (`431`/`437`).
- **Défaut = OD** : tout ce qui n'est ni TVA ni paie ni charges revient/reste en **OD** (répare les faux positifs de v249). Clôture/à-nouveaux/dotations/cessions/emprunts forcés en OD.

**Limites :** imputation descriptive (aucun montant/équilibre touché). Validé : `node --check` (121 scripts). Badge → **v250 · reclassement prudent**.

---

## 🟢 MAJ précédente — Reclassement étendu à la TVA : OD de TVA → journal ODTVA — v249
**Quoi :** le reclassement des journaux (addon132) s'applique désormais aussi à la **TVA** : les écritures de **TVA** (déclaration CA3, régularisation) placées à tort dans le journal **OD** sont reclassées dans le journal **ODTVA (OD TVA)** — comme la paie (→ODP) et les charges (→ODC).

**Comment — extension de `yada-addon132` :**
- `cibleJournal` : ajout d'une règle **TVA prioritaire** → `ODTVA` si le **libellé contient TVA** ou si une ligne porte un **compte de TVA `445x`** (44551/44562/44566/44567/44571…). Le journal `ODTVA` est ajouté à l'ensemble traité (corrige aussi les écritures mal placées en ODTVA).
- **Sécurité** : les à-nouveaux (qui reportent des soldes 445x) restent exclus via le libellé `NOUVEAU` ; les écritures **ACH/VTE** (qui contiennent de la TVA) ne sont jamais touchées (seules les O.D. le sont).
- `ensureJournaux` garantit aussi **ODTVA** dans `db.journaux`.

**Limites :** imputation descriptive (aucun montant/équilibre touché). Validé : `node --check` (121 scripts). Badge → **v249 · journaux TVA**.

---

## 🟢 MAJ précédente — Verrou anti-retour de version (no-downgrade) — v248
**Quoi :** dès qu'une version a été utilisée **sur l'appareil**, il devient **impossible de revenir sur une version plus ancienne**. Si une version inférieure se charge (cache périmé, onglet obsolète…), elle est **bloquée** par un voile non contournable et l'**enregistrement est désactivé** → toute modification se fait obligatoirement sur la dernière version.

**Pourquoi :** demande utilisateur — interdire le retour en arrière et garantir que les modifications portent toujours sur la nouvelle version.

**Comment — `yada-addon133` :**
- « Plancher » de version mémorisé dans `localStorage 'yada-ver-max'` (le plus haut numéro déjà exécuté, lu depuis le badge `#yada-ver`).
- Au démarrage : si `version courante ≥ plancher` → on relève le plancher ; sinon → **blocage** (overlay `#yada-ver-lock` plein écran + `window.save` neutralisé) avec bouton **« Charger la dernière version »** (`yadaForceUpdate` : `serviceWorker.update()` + reload « réseau d'abord » ; message si hors-ligne, sans vider le cache pour éviter tout blocage).
- Complète le SW « réseau d'abord » + la mise à jour auto (addon103) qui ramènent déjà la dernière version en ligne. `version.json` aligné sur 248.

**Limites :** le plancher est par **origine/appareil** (localStorage) — un fichier ouvert en `file://` (autre origine) ne partage pas ce plancher. Validé : `node --check` (121 scripts). Badge → **v248 · verrou de version**.

---

## 🟢 MAJ précédente — Reclassement des journaux : OD PAIE / OD CHARGES correctement imputées — v247
**Quoi :** correction des **erreurs d'imputation** : les écritures de **paie** placées à tort dans le journal **OD** sont reclassées en **ODP (OD PAIE)**, et les écritures de **charges (cotisations patronales)** en **ODC (OD CHARGES)**. Corrige aussi les échanges ODP↔ODC.

**Pourquoi :** d'anciennes écritures (versions antérieures, import FEC, etc.) restaient dans « OD » alors que la génération actuelle (`posterPaieMois`/`bpGenererODMois`) route déjà vers ODP/ODC. Les données existantes n'étaient pas corrigées.

**Comment — `yada-addon132` (détection par COMPTES + LIBELLÉ, prudente) :**
- **PAIE → ODP** : présence du compte **641** (salaire brut, classe 6) **ou** libellé `PAIE/SALAIRE/BULLETIN/RÉMUN`.
- **CHARGES → ODC** : présence d'un compte social de classe 6 (**645/648/631**) **ou** libellé `COTISATION/URSSAF/PATRONAL/CHARGES`.
- **Exclusions** (vraies O.D., jamais déplacées) : clôture/`RÉSULTAT`, à-nouveaux/`NOUVEAU`, dotations/amortissements, cessions, emprunts/intérêts/échéances, TVA.
- Migration unique tous-dossiers au chargement + reclassement à chaque `save` (couvre éditions, FEC, après synchro cloud) + au changement de dossier ; `ensureJournaux` garantit ODP/ODC dans `db.journaux`. `window.reclasserJournauxPaieCharges()` exposé.

**Limites :** le journal est une imputation descriptive (aucun montant/équilibre touché). Validé : `node --check` (120 scripts). Badge → **v247 · journaux paie/charges**.

---

## 🟢 MAJ précédente — Édition des comptes : libellé REPORTÉ depuis la Consultation — v246
**Quoi :** dans l'**éditeur d'écritures** (journal HA/VT/BQ/OD ouvert pour saisir/éditer), la colonne **Libellé** affiche désormais **exactement le même libellé que la Consultation des comptes / grand-livre** : le libellé de l'**écriture** (`e.libelle`, ex. « F2024-001 · DUPONT »).

**Pourquoi :** la Consultation affichait `e.libelle` alors que l'éditeur montrait le libellé de la **1re ligne** (`e.lignes[0].lib`, ex. « Fournisseur DUPONT ») → les deux ne correspondaient pas. Valable pour fournisseur, client, salarié, n'importe quelle écriture.

**Où / comment — `yada-addon131` + 1 édition chirurgicale :**
- `ecRender` (cellule `.ec-lb`) : `value=${ecAttr(e.libelle||'')}` et `onchange="ecSetLibelleEcr(id, v)"` (au lieu de `e.lignes[0].lib` / `ecSetLibAll`).
- `window.ecSetLibelleEcr(id,v)` : écrit `e.libelle=v` puis `ecRender()` → Consultation, journal de base et grand-livre restent synchronisés. La saisie d'un compte de tiers continue d'alimenter `e.libelle` via `ecSetLibAll`/`ecLibTiers` (addon125).

**Limites :** le libellé est descriptif (aucun montant/équilibre touché) ; `l.lib` reste en base mais n'est plus affiché dans l'éditeur (toutes les vues lisent `e.libelle`). Validé : `node --check` (119 scripts). Badge → **v246 · libellé journal**.

---

## 🟢 MAJ précédente — Paramétrage / Plan comptable séparés + transfert manuel + ajout direct fournisseur/client — v245
**Quoi :** la page « Paramétrage & plan comptable » est **scindée en deux entrées de menu** : **« Paramétrage (réglages) »** et **« Plan comptable »**. La page Paramétrage gagne une carte **« 📁 Transfert manuel (par fichier) »** (Télécharger la base / Importer). Les onglets **Fournisseur** et **Client** du plan comptable reçoivent un **formulaire d'ajout direct** de compte (401…/411…).

**Où / comment :**
- Nav : entrée `parametrage` renommée « Paramétrage (réglages) » + nouvelle entrée `plancomptable` ; dispatch `plancomptable:pagePlanComptable` (objet réévalué à chaque rendu).
- `pageParametrage` : retire `planComptableCard()`, ajoute `transfertManuelCard()` (réutilise `exportJSON`/`importJSON`, input `#param-imp`). Nouveau `pagePlanComptable()` = `head` + `planComptableCard()`.
- `planComptableCard` : l'`addRow` des onglets fournisseur/client affiche un champ nom + bouton « + Créer le compte 401…/411… » → `pcAjoutTiers(type)` (crée un `db.tiers` minimal, `compteAux` via `genAux`, comptes de contrepartie/TVA par défaut). Le module Tiers reste pour la fiche complète.
- Raccourci menu « Plan comptable… » → `current='plancomptable'`.

Validé : `node --check` (118 scripts), filet d'équilibre (d-ama/d-sci42), smoke Playwright (pages séparées, transfert manuel présent, onglets + ajout fournisseur `401TEST00` créé, 0 pageerror). Badge → **v245**.

---

## 🟢 MAJ précédente — Capture de facture : compte d'Honoraires 622600000 dans le menu des comptes de charges — v244
**Quoi :** lors de la **capture / comptabilisation d'une facture fournisseur** (et dans la fiche tiers, la saisie d'achat, les dépôts), le menu déroulant **« compte de charge »** propose désormais **« 622600 — Honoraires »**.

**Où / comment :** ajout de `'622600'` à `COMPTES_CHARGE` (liste du menu, utilisée par `optComptes` dans la fiche tiers `ti-contre`, la comptabilisation des dépôts d'achat et la saisie d'achat) + libellé `'622600':'Honoraires'` dans `COMPTES` (clé 6 chiffres). À la génération, `c9('622600')='622600000'`. Validé : `node --check` (118 scripts), filet d'équilibre (d-ama/d-sci42), smoke Playwright (option « 622600 — Honoraires » présente, c9 OK, 0 pageerror). Badge → **v244**.

---

## 🟢 MAJ précédente — Saisie : TOUS les comptes proposés en autocomplétion (charges classe 6 incluses) — v243
**Quoi :** dans l'éditeur d'écritures, l'**autocomplétion de compte** (`ecAllAccounts`) propose désormais **tout le Plan Comptable** — **tous les comptes de charges (classe 6)** et **tous les comptes** (classes 1 à 8), plus les tiers auxiliaires du dossier.

**Pourquoi :** `ecAllAccounts` se limitait à **`db.plan`** quand celui-ci était peuplé (au lieu du PCG complet) → des comptes de charges absents de `db.plan` n'étaient **jamais proposés**. De plus `familles()` restreignait aux classes 401/411/44/6/7.

**Ce qu'il fait :** la source des suggestions est désormais **`COMPTES` (= PCG_COMPLET fusionné, ~970 comptes) ∪ `db.plan`** (jamais `db.plan` seul), et `familles()` accepte **toutes les classes 1 à 8**. Filtré par préfixe saisi + 14 résultats max (inchangé).

**Où / comment :** édition chirurgicale de `familles()` et `ecAllAccounts()` (addon85). Validé : `node --check` (118 scripts), filet d'équilibre (d-ama/d-sci42), smoke Playwright (saisie « 606 »/« 615 » → comptes de charges proposés ; « 2 » → immobilisations ; 0 pageerror). Badge → **v243**.

---

## 🟢 MAJ précédente — TVA & factures : montants calculés sur TOUTES les écritures + concordance comptable — v242
**Quoi :** le **Module TVA (CA3)** calcule désormais la **TVA collectée et déductible sur toutes les écritures** (factures + import FEC + saisies), et les listes de factures **fournisseurs/clients** affichent la **concordance avec la comptabilité** (nombre d'écritures VTE/ACH).

**Pourquoi :** (1) `tvaDuMois` comparait des codes courts (`'44571'`) alors que les écritures stockent des comptes en **9 chiffres** (`445710000`, addon22) → il renvoyait **0** (le suivi annuel TVA était vide). (2) `tvaDetailMois` ne lisait que `db.factures` → les montants **importés du FEC** (présents en écritures sur les comptes de TVA mais sans `db.factures`) étaient **ignorés**.

**Ce qu'il fait :**
- `tvaDuMois(m)` : somme les **crédits sur 44571x** (collectée) et les **débits sur 44566x/44562x** (déductible), comparés en **`c9`** → capte FEC + manuel + factures. Le suivi annuel CA3 est désormais juste.
- `tvaDetailMois(m)` : **totaux autoritaires depuis les écritures** (`col`/`ded` = `tvaDuMois`), justification **par facture conservée** (ventilation par taux), et **part « autres » (FEC/écritures)** = `col − colFact` / `ded − dedFact`. Le tableau CA3 ajoute une ligne « Autres ventes/achats taxables (import FEC / écritures sur 44571 / 44566-44562) » pour réconcilier le total.
- **Suivi des factures de vente** : KPI « TVA collectée » + ligne de **concordance** « N écriture(s) VTE — concordance ✓ / G comptabilisée(s) sur N ». **Suivi des factures fournisseurs** : concordance « N écriture(s) ACH ».

**Où / comment :** éditions chirurgicales de `tvaDuMois`, `tvaDetailMois`, du tableau CA3 (`pageTVA`) et des sous-titres de `suiviFacturesVente`/`suiviFacturesAchat`. **Affichage/calcul seulement — aucune écriture modifiée.** Validé : `node --check` (118 scripts), filet d'équilibre (d-ama/d-sci42), smoke Playwright (`tvaDuMois` 2026-05 = col 820 / ded 184 — valait 0 avant ; CA3 rendu, 0 pageerror). Badge → **v242**.

**Reste à faire (signalé) :** lister dans les suivis les factures présentes **uniquement** en écritures (FEC) pour une parité de comptage stricte — la concordance les rend visibles ; la synthèse de lignes depuis les écritures est un chantier suivant.

---

## 🟢 MAJ précédente — Synchro : Pantry seul (méthode Supabase retirée de l'interface) — v241
**Quoi :** la carte de **Synchronisation** ne propose plus que **Pantry** (`getpantry.cloud`). Les sections **Supabase** (URL/clé/table, aide SQL) et **Serveur YADA** sont **retirées de l'interface** pour une configuration simple et sans confusion. À l'**enregistrement**, l'ancienne config Supabase est **effacée** (les champs absents repassent à vide → `url/key/server/token=''`).

**Ce qu'il fait :**
- `cloudCard` : titre « (Pantry) », section verte Pantry (identifiant + clé d'espace) + chiffrement + boutons + aide Pantry ; plus aucun champ Supabase/serveur affiché.
- `cloudSaveCfg` lit toujours les ids `cloud-url/key/table/server/token` mais, ces champs n'existant plus, ils valent `''` → **la méthode Supabase est effacée** au premier « Enregistrer la configuration ».
- **Le transport Pantry/Supabase/serveur reste inchangé côté code** (repli conservé) ; seule l'UI est simplifiée. Le chiffrement de bout en bout est toujours appliqué.

**Où / comment :** greffes chirurgicales dans `cloudCard` (addon102) — suppression des blocs Supabase avancé, Serveur YADA et aide SQL ; variable `sql` retirée. Validé : `node --check` (118 scripts), filet d'équilibre (d-ama/d-sci42), smoke Playwright (carte Pantry-only, 0 champ Supabase, effacement au save, 0 pageerror). Badge → **v241**.

---

## 🟢 MAJ précédente — Synchro : méthode simple « Pantry » (stockage JSON sans base SQL) — v240
**Quoi :** ajout d'un **3ᵉ mode de synchronisation, sans base SQL** — **Pantry** (`getpantry.cloud`). Aucune table, aucune RLS, aucun cache de schéma → **les erreurs Supabase de type `PGRST205` (« table introuvable ») sont impossibles**. Onboarding minimal : créer un Pantry (un e-mail), copier l'**identifiant** dans YADA. C'est le **mode recommandé** désormais (mis en avant dans la carte de Paramétrage), Supabase/serveur restant disponibles.

**Ce qu'il fait :**
- **Client** (addon102) : `cfg()` lit `pantry` ; helpers `pantryGet`/`pantryPut` (un « panier » nommé d'après la clé d'espace stocke `{data,ts,enc}` via `POST`/`GET` sur `getpantry.cloud/apiv1/pantry/<id>/basket/<espace>`). `cloudGetRows`/`cloudPut`/`cloudTest` routent vers Pantry **en priorité** quand l'identifiant est rempli, sinon serveur, sinon REST Supabase. Garde `cloudReady(c)` = `enabled && (pantry || server || (url&&key))`. **Le chiffrement de bout en bout reste appliqué avant l'envoi** (le stockage ne voit qu'un blob). Panier inexistant (HTTP 400/404) traité comme « vide ».
- **UI** : section verte **« 📦 Méthode simple — Pantry (recommandé, sans base SQL) »** en tête de la carte (champ identifiant + clé d'espace) ; les champs **Supabase** passent dans un `<details>` « Méthode avancée » ; aide pas-à-pas Pantry. `cloudSaveCfg` persiste `pantry` dans `localStorage 'yada-cloud'`.

**Où / comment :** greffes chirurgicales dans addon102 (transport Pantry + priorité, carte de réglage). Validé : `node --check` (118 scripts), filet d'équilibre (d-ama/d-sci42), smoke Playwright (routage Pantry `POST`/`GET` vers le bon panier + repli Supabase/serveur, 0 pageerror). Badge → **v240**.

**Limites :** Pantry est un service tiers gratuit (taille de panier ~1,4 Mo, disponibilité « best-effort ») ; convient à un dossier de petite/moyenne taille. Pour de gros volumes, préférer Supabase/serveur. L'envoi effectif dépend de la disponibilité de `getpantry.cloud` (non testable depuis l'environnement de build — réseau restreint).

---

## 🟢 MAJ précédente — Synchro : câblage du serveur YADA (`@supabase/server`) de bout en bout — v239
**Quoi :** la synchro cloud peut désormais **passer par un serveur** (proxy `@supabase/server`, dossier `server/`) au lieu d'appeler Supabase directement, pour que la **clé secrète reste côté serveur** (jamais dans le navigateur). 100% optionnel : champ **« Serveur YADA »** vide ⇒ mode Supabase direct inchangé (clé anon + chiffrement de bout en bout).

**Ce qu'il fait :**
- **Serveur** (`server/index.mjs`) : vrai proxy `withSupabase({ auth:'none' })` exposant `GET /health`, `GET /sync?espace=…`, `POST /sync` (upsert via `ctx.supabaseAdmin`, qui contourne la RLS avec la clé secrète). CORS gérée par le SDK ; jeton partagé optionnel `YADA_API_TOKEN`. Adaptateur Node http pour exécution autonome ; déployable aussi en Supabase Edge Function (`verify_jwt=false`). La clé secrète ne vit qu'en variable d'environnement (`.env` git-ignoré).
- **Client** (`precompta.html`, addon102) : `cfg()` lit `server`/`token` ; helpers `srvFetch`/`cloudGetRows`/`cloudPut` ; `cloudPushNow`/`cloudPull`/`cloudTest`/`cloudIntegrityCheck` routent vers `<server>/sync` quand une URL serveur est renseignée, sinon repli REST Supabase. Garde `cloudReady(c)` = `enabled && (server || (url && key))`. Le **chiffrement reste appliqué avant l'envoi** (le serveur ne voit qu'un blob). Carte Paramétrage : section **« 🖧 Serveur YADA (optionnel) »** (URL + jeton) ; `cloudSaveCfg` persiste `server`/`token` dans `localStorage 'yada-cloud'`.

**Où / comment :** greffes chirurgicales dans addon102 (transport branché serveur/direct) ; `server/` (index.mjs proxy, `.env.example`, README de déploiement Node/Edge). Validé : `node --check` (118 scripts + serveur), filet d'équilibre (d-ama/d-sci42), smokes Playwright (routage serveur **et** repli direct, 0 pageerror). Badge → **v239**.

**Limites :** le déploiement effectif du serveur (Render/Railway/Fly/Edge) requiert le compte Supabase de l'utilisateur ; le proxy n'est pas requis pour synchroniser (le mode direct fonctionne déjà).

---

## 🟢 MAJ précédente — Synchro cloud : SQL Supabase corrigé (colonne `enc`) — v238
**Quoi :** l aide SQL de la carte de Paramétrage créait la table `yada_sync` sans la colonne **`enc`**, alors que le PUSH envoie `enc` (0/1, chiffrement) → l upload échouait (« column enc does not exist »). Le script crée désormais `enc int default 0` (+ `add column if not exists` pour les tables déjà créées). Badge → **v238**.

---

## 🟢 Dernière mise à jour — Synchronisation multi-appareils : suivi continu + dossiers ADDITIFS (le travail du PC principal sur toutes les interfaces) — v237
**Quoi :** tout le **travail fait sur le PC principal** (dossiers créés, écritures, règles) est **suivi en continu** sur les autres appareils — **mêmes dossiers, mêmes données, mêmes règles**. (1) **PULL automatique** périodique (40 s) + au **retour au premier plan** (`visibilitychange`/`focus`) + à la **reconnexion** (`online`), en plus du push après chaque save (addon102) ; cloudPull n'applique que si le cloud est **plus récent** (horodatage, dernier gagnant). (2) **Dossiers ADDITIFS** : à la réception, le cloud (PC principal) l'emporte pour les dossiers partagés, mais **aucun dossier créé localement n'est perdu** (les dossiers présents seulement en local sont conservés puis repoussés → visibles partout).

**Où / comment :** `yada-addon130` — `setInterval(cloudPull(true), 40s)` + écouteurs `visibilitychange`/`focus`/`online` (garde : pas de pull si un overlay/modale est ouvert). `applyRemote` (addon102) **fusionne** `dossiersData` et `cabinet.dossiers` (union : cloud prioritaire pour l'existant, ajout des dossiers locaux manquants). **Prérequis** : la synchronisation cloud doit être **configurée et activée** (Paramétrage → URL/clé Supabase + clé d'espace) ; sinon inactif. 100% additif, aucune logique comptable modifiée. Badge → **v237**.

---

## 🟢 MAJ précédente — Éditions : balances fournisseurs/clients calculées sur les ÉCRITURES (FEC + manuel) — v236
**Quoi :** toutes les **Éditions** sont générées à partir de **tous les montants** — qu'ils proviennent de l'**import FEC** ou d'une **saisie manuelle**. La **balance générale**, le **grand-livre**, les **journaux**, le **bilan** et le **compte de résultat** itéraient déjà `db.ecritures` (FEC + manuel). Les **balances fournisseurs / clients** s'appuyaient en revanche sur `auxMvt(t)` (qui lit `db.factures`/`db.banque`) → elles **ignoraient les montants FEC** (présents en écritures mais sans `db.factures`). Désormais elles somment les **lignes d'écriture du compte de tiers** via `auxLignes(t)` → **FEC + manuel inclus**.

**Où / comment :** `balanceLignes(type)` — pour `fournisseurs`/`clients`, remplacement de `auxMvt(t,null)` par la somme `débit/crédit` de `auxLignes(t)` (lignes sur le compte auxiliaire + collectif rattaché), avec filtre des comptes non mouvementés. Aucune logique comptable modifiée (calcul d'affichage uniquement). Badge → **v236**.

---

## 🟢 MAJ précédente — Interface FIXE (cartes/modules sans mouvement) + boutons en transparence + « Montants sans facture » repliable (fermé) — v235
**Quoi :** (1) **tous les modules / sous-modules / cartes sont FIXES** — aucun mouvement ni animation au survol ou à l'entrée (plus de `transform`/`scale`/`translateY`/animation d'apparition), en mode **JOUR comme NUIT** ; (2) **seuls les BOUTONS** gardent un effet de **TRANSPARENCE** (opacité) au survol (`.82`) et au clic (`.62`), sans déplacement ; (3) dans les **Éditions** (Grand-livre), la carte **« Montants sans facture »** devient **repliable** (`<details>`), **FERMÉE par défaut** et **plus compacte** (un simple bandeau « ⚠ … — N ligne(s) · X € · ▸ ouvrir », cliquer pour déplier).

**Où / comment :** `yada-addon129` — `<style id="fixe-ui-mod">` (injecté en dernier) : `transition:none/animation:none` + `transform:none !important` (au survol) sur `.card/.kpi/.cp-k/.cf-org/.kv2/.dossier-card/.figer-card` avec préfixe `body[data-theme]` pour **battre** les règles noir/liquid (spécificité ≥ règles thème) ; boutons `.btn{transition:opacity;transform:none}` + `:hover/:active{opacity}` ; styles `.sf-details/.sf-sum` (marqueur custom `▸/▾`). `blocSansFacture` rend un `<details>` (sans attribut `open`). 100% CSS/markup additif, aucune logique modifiée. Badge → **v235**.

---

## 🟢 MAJ précédente — Toutes les éditions (Grand-livre, Bilan, Compte de résultat, Journaux…) : écritures en noir sur fond blanc légèrement bleuté — v234
**Quoi :** l'habillage de la Balance (v233) est **généralisé à toutes les éditions imprimables** (`.doc-page`) — **Grand-livre**, **Bilan**, **Compte de résultat**, **Journaux**, **centralisateur**, justificatifs : **écritures en NOIR** sur **fond BLANC légèrement bleuté** (en-têtes / lignes alternées / totaux en bleu clair, titre & filets bleus), **quel que soit le thème**. Les **factures** (`.inv-page`) ne sont pas touchées.

**Où / comment :** `yada-addon128` — `<style id="doc-edit-mod">` reprend les règles de la balance mais sur **`.doc-page`** (toutes les éditions). Pour battre la règle du thème noir `body[data-theme="noir"] .doc *{color:#1b1b1b !important}` (spécificité 0,2,1), les règles texte utilisent **`body[data-theme] .doc-page *`** (même spécificité, injectées en dernier → priorité) → texte `#111418`. 100% CSS additif, aucune donnée/logique modifiée. Badge → **v234**.

---

## 🟢 MAJ précédente — Édition de la Balance : écritures en noir sur fond blanc légèrement bleuté — v233
**Quoi :** l'**édition de la Balance** (Balance générale / fournisseurs / clients / personnel / immo / retenue, ouverte depuis Éditions → modale) est rendue **plus lisible** : **toutes les écritures en NOIR** (compte, libellé, montants) sur un **fond BLANC légèrement bleuté** (en-têtes bleu clair, lignes alternées bleu très clair, totaux teintés de bleu, titre & filets bleus), **quel que soit le thème** (corrige le faible contraste en mode nuit).

**Où / comment :** `balanceDoc` pose la classe **`bal-doc`** sur le `.doc-page` ; `yada-addon127` injecte `<style id="bal-edit-mod">` : `.bal-doc *{color:#111418}` (noir) + `background:#fff` + accents bleus (`th` `#eaf2fb`/`#0b346e`, lignes impaires `#f5f9ff`, totaux `sub/cls/tg` en bleu clair, titre `#0b346e` souligné `#0a64d6`). 100% CSS additif, aucune donnée ni logique modifiée. Badge → **v233**.

---

## 🟢 MAJ précédente — Consultation (grand-livre) : lettrage manuel inter-journaux (solder le tiers : Banque ↔ Vente / Achat) — v232
**Quoi :** dans la **Consultation des comptes**, en ouvrant le **grand-livre d'un tiers** (clic sur 411HABI00 / 401…, lecture seule), on peut désormais **lettrer manuellement** : **clic gauche** sélectionne les lignes à rapprocher — typiquement la **VENTE** (journal VT, débit) et son **ENCAISSEMENT** (journal BQ, crédit), ou l'**ACHAT** (HA, crédit) et son **PAIEMENT** (BQ, débit). Une **barre de lettrage** indique Σ Débit / Σ Crédit et **« équilibré ✓ »** ; le bouton **« Lettrer la sélection »** n'est actif que si **Débit = Crédit** → le **compte du tiers est soldé**. Boutons **Délettrer** / **Vider la sélection**. Le déplacement d'un compte (collectif 411000000 → auxiliaire 411HABI00) fait apparaître la ligne sur le tiers (recalcul des soldes), prête à lettrer.

**Où / comment :** `clLignesGeneral` expose `idx`/`key` (comme `auxLignes`) ; `clRender` rend les lignes **sélectionnables** (`data-k`, `onclick="clToggleSel"`, classe `cl-sel`) + barre `.cl-letbar` (Σ sélection, état). `yada-addon126` : `clToggleSel`/`clSelVider`/`clLettrerSel`/`clDelettrerSel` (réutilisent **`lzLettrer`/`lzDelettrer`**, contrôle Σdébit=Σcrédit) ; reset de `clSel` à la navigation/ouverture. Le clic droit (→ Journal) reste disponible. Aucune logique comptable modifiée (le lettrage ne touche pas aux montants). Badge → **v232**.

---

## 🟢 MAJ précédente — Consultation : libellé déversé par le compte (nom du tiers) + identique partout, et facture = nom + n° + moyen — v231
**Quoi :** (1) lors de la **saisie au journal**, quand on saisit un **compte de tiers** (401…/411…, ex. **401ALRC00**), le **libellé se remplit automatiquement** avec le **nom complet** du tiers (ex. **ALR CONSEIL**) ; (2) le libellé reste **identique partout** — même valeur dans la **saisie**, le **journal de base** (Consultation) et le **grand-livre** (toutes les lignes d'une écriture portent le même libellé) ; (3) pour une **facture enregistrée/générée**, le libellé est **« <nom du tiers> — <n° de facture> — <moyen de paiement> »**.

**Où / comment :** `posterFacture` pose le libellé **canonique** (`nom — numéro — modeReglement`) sur **toutes les lignes** + `e.libelle`. `ecSetLibAll` synchronise aussi `e.libelle` (« pièce · libellé ») pour que la Consultation et le grand-livre affichent le même libellé que l'éditeur. `yada-addon125` : `window.ecLibTiers(e,t)` (nom seul si saisie simple ; nom + n° + moyen si facture liée) + **wrap `ecSetLine`** (à la saisie d'un compte résolu en tiers via `ecResolveTiers`, déverse le libellé via `ecSetLibAll`). Aucune logique comptable modifiée. Badge → **v231**.

---

## 🟢 MAJ précédente — Module Client : carte « 🔁 Récurrence » (prestations de service facturées en plusieurs fois) — v230
**Quoi :** dans le **Module Client (Facturation)**, une carte **« 🔁 Récurrence — prestation de service »** crée une **prestation facturée en plusieurs fois** (ex. **Tenue Comptable** sur **12 mois**) : une **facture de prestation** est générée **pour chaque mois** (statut « à générer »), retrouvable dans **« Mes factures de vente »**. Champs : client, désignation (déf. « Tenue Comptable »), montant HT/mois, TVA, nombre de mois (déf. 12), date de 1ʳᵉ facture, conditions de paiement.

**Où / comment :** `yada-addon124` — `faRecCard()` (greffé en tête de la colonne « Créer / Déposer » de `pageFacturationClient`) ; `faRecGenerer()` boucle sur N mois (`addMonthsISO`), crée des `db.docs` (type facture, **ligne `nature:'prestation'`**, `qte:1`, `pu`=montant/mois), `numero` via `nextNumUnique('FAC')`, échéance via `faEcheanceFromCond`, libellé « <prestation> — <mois> », `recurrence:{groupe,index,total,designation}`, statut `valide` non comptabilisé. Les écritures se génèrent ensuite normalement (une par mois, VTE équilibrée). Aucune logique comptable modifiée. Badge → **v230**.

---

## 🟢 MAJ précédente — Tiers : détection de doublons par MOTS (pluriel + mots de liaison ignorés) — ex. « Résidence(s) Picardie » — v229
**Quoi :** la détection des doublons de tiers (v228) compare désormais aussi les **mots significatifs** : on **ignore les mots de liaison** (de, des, la, le, et…) et on **ramène au singulier** (RÉSIDENCES → RÉSIDENCE), de sorte que « **Résidences Picardie** », « Résidence Picardie », « Résidence DE Picardie », « SCI Résidence Picardie » sont reconnus comme **le même tiers** (surlignés jaune + fusionnables), **sans** confondre des entités distinctes qui partagent un mot (« Résidence Amiens » ≠ « Résidence Picardie »).

**Où / comment :** `yada-addon123` — `similaire(n1,n2)` enrichi : `tokens()` (majuscules, sans accents, sans formes juridiques ni mots STOP, singulier) + `tokenKey()` ; vrai si **mêmes mots significatifs** (token-set égal), sinon inclusion, sinon **Jaccard de tokens ≥ 0,6**, sinon Dice ≥ 0,80. Aucune logique comptable modifiée. Badge → **v229**.

---

## 🟢 MAJ précédente — Libellé reporté automatiquement (saisie journal) + Tiers : doublons par ressemblance (jaune) + fusion globale + anti-doublon — v228
**Quoi :** (1) **report automatique du libellé** dans la saisie au journal — une **nouvelle ligne** (clic droit « Insérer » ou « + Ajouter ») **hérite du libellé** de l'écriture (déjà identique sur toutes les lignes, v221) ; (2) **Tiers — doublons par RESSEMBLANCE** : les fournisseurs/clients dont la **dénomination se ressemble** (pas seulement identique) sont **détectés**, **surlignés en JAUNE** (tag **DOUBLON**) et regroupés ; un bouton **« ⚙️ Fusionner TOUS les doublons similaires »** regroupe chaque famille en un seul compte (SIRET différents laissés) ; à la **validation d'une fiche tiers**, si un tiers ressemblant existe déjà, on **propose de le rattacher** (anti-doublon) plutôt que d'en créer un nouveau.

**Où / comment :** `ecAddLine`/`ecInsertLine` héritent de `e.lignes[0].lib`. `yada-addon123` : `norm` (majuscules + suppression formes juridiques SARL/SAS… + alphanum), `dice` (bigrammes) + `similaire` (égalité / inclusion / Dice ≥ 0,82) ; `window.tiersSimilaireExistant` ; **override `scanDoublonsTiers`** (groupes flous via union-find → `dupTiersIds` jaune) ; **override `tiersConsoliderDoublons`** (auto-fusion seulement des noms STRICTEMENT identiques, prudent) ; `tiersFusionnerSimilaires` (fusion de toutes les familles ressemblantes, SIRET divergents laissés) ; greffe `blocDoublonsTiers` (bouton « Fusionner tous ») ; garde `ficheValider` (proposition de rattachement). Aucune logique comptable modifiée. Badge → **v228**.

---

## 🟢 MAJ précédente — Saisie Journal de Banque : éditeur Sage + dépôt / lecture du relevé bancaire → écritures — v227
**Quoi :** dans **Saisie journal Banque**, une carte **« 📒 Saisie & relevé de banque »** ajoute : (1) **« ✎ Saisir le journal de banque (éditeur Sage) »** qui ouvre **le même éditeur que les journaux** (`ouvrirJournalEditable('BQ', mois)` — saisie directe, clic droit, navigation clavier, copier/coller) ; (2) **dépôt d'un relevé bancaire PDF**, avec **⬇ Télécharger** et **👁 Voir (page à part)** (ouvre le PDF dans un nouvel onglet pour vérification) ; (3) **🧾 Lire le relevé → écritures** : lecture du PDF (décompression FlateDecode + décodage de la **police vectorisée**, auto-décalage), extraction des **opérations** (jour, libellé, **montant**), **aperçu de vérification** (modale : jour / libellé / compte / Débit / Crédit éditables) puis **génération des écritures BQ** via `posterBanque` (équilibrées).

**Où / comment :** `yada-addon122` — greffe `pageSaisieBq` (+`rbqCard`) ; dépôt dans `db.parametres.pieces` (cat `releve`) ; `rbqVoir`/`rbqTelecharger`/`rbqSupprimer` ; lecteur PDF autonome (`extractText` + `DecompressionStream`, `shiftStr`/`autoDecode` pour les polices CID à octets nuls + glyphes décalés, chiffres compris) ; `rbqParse` (ancres tolérantes aux accents, split par « EUR », montant en fin de segment) → `rbqOuvrirApercu` → `rbqGenerer` (`posterBanque`). 100% additif, aucune logique comptable modifiée. **Limite :** l'extraction est *best-effort* (vérification humaine obligatoire avant génération ; sens Débit/Crédit et compte à confirmer ; certains relevés vectorisent les chiffres → l'OCR connecté reste le repli). Badge → **v227**.

---

## 🟢 MAJ précédente — Consultation des journaux : HA / VT / BQ filtrés sur le SEUL mois sélectionné (fin du cumul) — v226
**Quoi :** dans la **Consultation des comptes**, quand on sélectionne un **mois** (janvier→décembre) dans la colonne des périodes, les journaux **HA (ACH)**, **VT (VTE)** et **BQ** affichent **uniquement les écritures de ce mois** (et plus le cumul depuis le début d'année). Tous les journaux se comportent désormais pareil (mois sélectionné uniquement) ; l'en-tête indique « — mois MM/AAAA ».

**Où / comment :** `sgJournalGrid` — `const cumul=(code==='ACH'||code==='VTE')` remplacé par `const cumul=false` → le filtre devient `ym(e.date)===per` pour tous les journaux. L'éditeur (`ecEcritures` en mode `ecJournalFiltre`) filtrait déjà au mois. Affichage seul, aucune logique comptable modifiée. Badge → **v226**.

---

## 🟢 MAJ précédente — Rapprochement bancaire : récap de tous les rapprochements + validation au mois + cadenas multi-comptes — v225
**Quoi :** dans le **Rapprochement bancaire**, (1) une bande **« Rapprochements bancaires effectués »** liste **tous les relevés** avec leur **état** (✓ soldé / 🔒 verrouillé / ● écart), cliquable pour ouvrir le rapprochement ; (2) un **cadenas 🔒** apparaît sur le **mois** (colonne des périodes) et sur la ligne du relevé quand c'est **verrouillé** ; (3) **validation au mois** : s'il y a **plusieurs comptes bancaires** mouvementés sur le mois, le mois n'est **« validé » (✓)** que lorsque **TOUS** sont rapprochés & soldés (sinon **◐ en attente** — aucune validation), mais le compte déjà rapproché **reste visible** dans son mois (colonne Journaux + récap).

**Où / comment :** `yada-addon121` — helpers `window.rapBanquesMois(m)` (comptes 512 ayant des mouvements ce mois), `window.rapMoisStatut(m)` (`{total,faits,soldes,verrouilles,valide,verrouille}` ; `valide = soldes===total`, `verrouille = valide && tous verrouillés`), `window.rapRecapHTML()`. Greffe `pageRappro` : badges 🔒/✓/◐ par mois (regex sur les items `.it` de `.rb-per`) + injection du récap avant `.rb-top`. Édition chirurgicale de la ligne « Relevé BQ au … » (🔒 si verrouillé, ✓ si soldé). Aucune logique comptable modifiée. Badge → **v225**.

---

## 🟢 MAJ précédente — Fenêtre plein écran au glisser-haut + saisie sur l'écriture cliquée + sélection multi-lignes copier/coller — v224
**Quoi :** trois améliorations de la saisie / des fenêtres : (1) **glisser une fenêtre (manipulable) vers le haut de l'écran → plein écran** (snap façon Windows, repère bleu en haut) ; (2) dans **tous les journaux**, le **clic droit « ✎ Saisir / éditer cette écriture »** ouvre l'éditeur **positionné sur l'écriture cliquée** (défilement + curseur sur la **saisie du compte** de la ligne sélectionnée, surbrillance temporaire) ; (3) **sélection multi-lignes** dans l'éditeur (glisser le pointeur sur la zone gauche/droite des lignes, ou **Maj+clic** ; **Échap** annule) puis **Ctrl/Cmd+C / Ctrl/Cmd+V** pour **copier / coller** les lignes (collées après la ligne active, et copiées en TSV dans le presse-papiers).

**Où / comment :** `addon89` — `dragMove`/`dragEnd` détectent le haut de l'écran (`#wm-topzone`) → `wmMaximize(k)` (dé-flotte / sort de `sg-reduit`). `sgJournalGrid` — lignes `data-ecr`/`data-cpt` ; `addon117` transmet l'id d'écriture ; `ouvrirJournalEditable(journal,mois,ecrId,cpt)` défile + focus `input.ec-cpt` (classe `ec-focus-ecr`). `yada-addon120` — sélection (`mousedown`/glisser sur cellules hors saisie, `.ec-rowsel`), `Ctrl+C`/`Ctrl+V` (`window.ecClip`, collage `e.lignes.splice`), actif hors mode compte (`!window.ecCode`, pour ne pas gêner le lettrage). Aucune logique comptable modifiée. Badge → **v224**.

---

## 🟢 MAJ précédente — Confirmations & saisies aux couleurs YADA (fin des `confirm()` / `prompt()` natifs) — v223
**Quoi :** toutes les **confirmations de suppression** et **invites de saisie** du logiciel s'affichent désormais dans des **modales soignées aux couleurs YADA (bleu nuit + bleu Crystal)** au lieu des boîtes `confirm()` / `prompt()` natives du navigateur (« …github.io indique »). Boutons **Annuler / Confirmer** (le bouton de suppression est en **rouge danger**), champ de saisie intégré pour les prompts ; **Échap / clic dehors = Annuler**, **Entrée = Confirmer / OK**. `window.alert` est aussi redirigé.

**Où / comment :** `yada-addon119` — `window.yadaConfirm(msg, onYes, opts)` et `window.yadaPrompt(msg, valeur, onOk, opts)` (callback, modale `.ya-ov`/`.ya-card`, réutilise le style de `yadaAlert`/addon118 + `<style id="ya-confirm-mod">`). **~49 confirmations** et **~15 saisies** converties (fire-and-forget → callback ; séquences de prompts imbriquées ; confirmations conditionnelles via fonction `_go`/`_gen`). **2 cas laissés en natif** (garde à retour synchrone) : `quitterRappro` (renvoie `false` pour bloquer la navigation) et la renumérotation de compte tiers dans `tiersEnregistrer` (garde au milieu d'un enregistrement synchrone). Aucune logique comptable modifiée. Badge → **v223**.

---

## 🟢 MAJ précédente — Messages d'alerte aux couleurs YADA (fin des `alert()` natifs) — v222
**Quoi :** le message « ⚠ Écriture non soldée » (affiché quand on tente de quitter l'éditeur avec une écriture déséquilibrée) — et plus largement les alertes — s'affichent désormais dans une **modale soignée aux couleurs YADA (bleu nuit + bleu Crystal)** au lieu de la **boîte `alert()` native** du navigateur (« …github.io indique »). En-tête avec titre + pastille **YADA**, corps lisible, bouton **OK** ; **Échap / Entrée / clic dehors** ferment. La modale passe **au-dessus** de l'éditeur et des listes (z-index élevé).

**Où / comment :** `yada-addon118` — `window.yadaAlert(msg, titre)` (création d'un overlay `#yada-alert`, `<style id="ya-alert-mod">`). `ecFermer` appelle `yadaAlert(msg,'⚠ Écriture non soldée')` (repli `alert`/`toast` si indisponible). Aucune logique modifiée (le blocage de fermeture v216 reste identique). Badge → **v222**.

---

## 🟢 MAJ précédente — Saisie au journal : clic droit pour saisir, en-têtes répétés par ligne, navigation clavier complète (flèches) — v221
**Quoi :** refonte de la **saisie au journal** (Consultation + éditeur `.ec-sage`) : (1) **plus de bouton « Éditer le journal du mois »** — on fait désormais **clic droit sur une écriture** du journal → « ✎ Saisir / éditer ce journal » (ouvre l'éditeur) ; (2) dans l'éditeur, le **journal**, la **pièce** et le **libellé** **suivent toutes les lignes** de l'écriture (journal + pièce + libellé affichés sur chaque ligne jusqu'au solde ; le **libellé est identique** sur toutes les lignes — édité sur la 1re ligne, répliqué via `ecSetLibAll`) ; (3) les **comptes de tiers 401000000 / 411000000** apparaissent **avec les comptes auxiliaires fournisseurs / clients** dans l'autocomplétion ; (4) **navigation clavier complète** : **↓/↑** choisissent le compte dans la liste (sinon cellule dessous/dessus), **→/←** passent au champ suivant/précédent (au bord du champ ; toujours sur les montants), **Tab/Maj+Tab** champ suivant/précédent, **Entrée** = « passer à la suite » (valide le compte sélectionné dans la liste puis avance).

**Où / comment :** `ecRender` (journal/pièce/libellé sur chaque ligne, `ec-ro` en lignes suivantes, `ecSetLibAll`) ; `addon85` (`ecSuggMove`/`ecSuggConfirm` + item actif `.act`) ; `addon114` réécrit (gestion Tab/Entrée/flèches + liste de comptes) ; `addon117` (clic droit `#sgj-ctx` sur `.sgj` → `ouvrirJournalEditable` ; styles `ec-ro`/`sgj-hint`) ; `sgJournalGrid` (bouton retiré, `data-jrn`/`data-per`). Aucune logique comptable modifiée. Badge → **v221**.

---

## 🟢 MAJ précédente — Consultation des journaux : défilement (molette) pour voir TOUTES les écritures — v220
**Quoi :** dans la **Consultation des comptes**, quand on sélectionne un **journal** (ACH, VTE, BQ, ODP, ODC, ODTVA, OD), la grille des écritures **défile désormais à la molette** pour voir **toutes les écritures**, même longues (ex. journal ACHATS de plusieurs centaines de lignes). Avant, le contenu **débordait** sous la fenêtre (rogné par `.sg-app{overflow:hidden}`) au lieu de défiler.

**Pourquoi / cause :** la zone de droite `.sg-right` est une **cellule de grille CSS** ; sans `min-height:0`, un enfant en `overflow:auto` ne peut pas défiler (la cellule grandit au-delà de la piste et déborde). 

**Où / comment :** `yada-addon116` — `<style id="sg-scroll-mod">` : `.sg-right{min-height:0}` + `.sgj-wrap{min-height:0}` + `.sgj-grid/.sg-grid{overflow:auto;min-height:0}` (+`overscroll-behavior:contain`). 100% CSS additif, aucune logique modifiée. Badge → **v220**.

---

## 🟢 MAJ précédente — Éditeur d'écritures : navigation clavier (Tab / Entrée) + retrait du bouton « + Ajouter une désignation » — v219
**Quoi :** (1) **navigation clavier façon tableur** dans l'éditeur d'écritures (`.ec-sage`) — **TAB / MAJ+TAB** = champ suivant / précédent (gauche→droite puis ligne suivante, avec bouclage) ; **ENTRÉE** = descend dans la **même colonne** (cellule du dessous), et en bas d'une écriture passe à la première ligne de l'écriture suivante. (2) **Retrait du bouton « + Ajouter une désignation »** (l'insertion se fait au **clic droit**, addon113) ; le bouton **« Solder l'écriture »** reste visible.

**Pourquoi :** la validation d'un champ relance `ecRender` (table reconstruite) → le Tab/Entrée natif perdait le focus. On re-cible le champ par ses **coordonnées** après reconstruction.

**Où / comment :** `yada-addon114` — écouteur `keydown` (capture) : sur Tab/Entrée dans un `input.ec-i` de `#ec-win`, `blur()` (valide) puis re-focus par coordonnées (`data-eid`/`data-li`/`cellIndex` via `cellInput`/`editInputs`/`ecrOrder`). `yada-addon115` — `<style id="ec-noadd-mod">` masque `.ec-act .ec-bt:not(.ec-bt-solde)`. Aucune logique comptable modifiée. Badge → **v219**.

---

## 🟢 MAJ précédente — Éditeur d'écritures : saisie directe « tableur » (champs plats, clic droit pour insérer, date sur toutes les lignes, colonnes fixes) — v218
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
