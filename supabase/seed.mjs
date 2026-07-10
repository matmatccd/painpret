// Génère le SQL de remplissage (produits) + un petit correctif de sécurité.
// Usage : node supabase/seed.mjs  → écrit supabase/seed.sql
import { productsInitiaux } from '../src/data/bakery.js'
import { writeFileSync } from 'node:fs'

const q = (s) => `'${String(s).replace(/'/g, "''")}'`
const arr = (a) => (a && a.length ? `ARRAY[${a.map(q).join(', ')}]` : `ARRAY[]::text[]`)
const iso = (ms) => `'${new Date(ms ?? Date.now()).toISOString()}'`

const lignes = productsInitiaux
  .map((p) => {
    const vals = [
      p.id,
      q(p.nom),
      q(p.categorie),
      p.sousCategorie ? q(p.sousCategorie) : 'null',
      p.prix,
      q(p.description || ''),
      p.image ? q(p.image) : 'null',
      q(p.emoji || '🥖'),
      arr(p.ingredients),
      arr(p.allergenes),
      p.delaiPreparation ?? 10,
      p.stock ?? 0,
      p.populaire ? 'true' : 'false',
      iso(p.creeLe),
    ]
    return `  (${vals.join(', ')})`
  })
  .join(',\n')

const sql = `-- Remplissage des produits + correctif sécurité (arrivée client)
-- À coller dans Supabase → SQL Editor → Run

-- 1) Fonction "signaler_arrivee" : le client peut se déclarer arrivé (sans tout pouvoir modifier)
create or replace function signaler_arrivee(p_numero text)
returns void language sql security definer as $$
  update commandes set arrive = true where numero = p_numero;
$$;

-- 2) On resserre : seul le boulanger connecté peut modifier une commande
drop policy if exists "signaler arrivee" on commandes;
drop policy if exists "boulanger modifie commandes" on commandes;
create policy "boulanger modifie commandes" on commandes
  for update to authenticated using (true) with check (true);

-- 3) Les produits (on vide puis on remplit, pour pouvoir relancer sans doublon)
delete from produits;
insert into produits
  (id, nom, categorie, sous_categorie, prix, description, image, emoji, ingredients, allergenes, delai_preparation, stock, populaire, cree_le)
values
${lignes};

-- 4) On recale le compteur d'id pour les prochains produits créés par le boulanger
select setval(pg_get_serial_sequence('produits', 'id'), (select max(id) from produits));
`

writeFileSync(new URL('./seed.sql', import.meta.url), sql)
console.log('seed.sql généré :', productsInitiaux.length, 'produits')
