-- ============================================================
--  PainPrêt — Sécurisation du parcours QR -> paiement
--  À coller dans Supabase -> SQL Editor -> Run (une seule fois).
--  Corrige :
--   1) le numéro de commande (qui finissait par bloquer le paiement)
--   2) l'accès public aux données personnelles (RGPD)
--   3) (rappel) écritures réservées au boulanger connecté
-- ============================================================

-- ---------- 1) NUMÉRO DE COMMANDE FIABLE ----------
-- AVANT : tiré au hasard entre B10 et B99 (90 numéros possibles). Comme les
-- commandes ne sont jamais supprimées, au-delà de ~90 commandes la recherche
-- d'un numéro libre tournait à l'infini -> le paiement ne créait plus rien
-- (client débité, aucune commande).
-- APRÈS : un compteur qui ne se répète jamais et ne bloque jamais.
create sequence if not exists numero_commande_seq;

-- On démarre au-dessus des commandes déjà passées (ex : B28) -> B100, B101, ...
select setval(
  'numero_commande_seq',
  greatest(
    100,
    coalesce((
      select max((regexp_replace(numero, '\D', '', 'g'))::int)
      from commandes
      where numero ~ '\d'
    ), 0) + 1
  ),
  false
);

-- La fonction de commande utilise désormais ce compteur (reste inchangé).
create or replace function passer_commande(
  p_client text,
  p_email text,
  p_telephone text,
  p_stripe_session text,
  p_creneau text,
  p_heure_retrait timestamptz,
  p_articles jsonb,
  p_total numeric
) returns commandes
language plpgsql
security definer
as $$
declare
  article jsonb;
  nouvelle commandes;
  v_numero text;
begin
  -- Anti-doublon : si ce paiement a déjà créé la commande, on la renvoie
  select * into nouvelle from commandes
    where stripe_session = p_stripe_session and p_stripe_session is not null
    limit 1;
  if found then return nouvelle; end if;

  -- Décompte du stock (échoue proprement si un produit est épuisé)
  for article in select * from jsonb_array_elements(p_articles) loop
    update produits
      set stock = stock - (article ->> 'quantite')::int
      where id = (article ->> 'produitId')::bigint
        and stock >= (article ->> 'quantite')::int;
    if not found then
      raise exception 'stock_insuffisant: %', article ->> 'nom';
    end if;
  end loop;

  -- Numéro GARANTI unique, sans jamais boucler
  v_numero := 'B' || nextval('numero_commande_seq');

  insert into commandes
    (numero, client, email, telephone, stripe_session, creneau, heure_retrait, articles, total)
  values
    (v_numero, p_client, p_email, p_telephone, p_stripe_session, p_creneau, p_heure_retrait, p_articles, p_total)
  returning * into nouvelle;

  return nouvelle;
end;
$$;

-- ---------- 2) RGPD : cacher les données perso au public ----------
-- AVANT : avec la clé publique du site, n'importe qui pouvait lire TOUTES les
-- commandes, y compris nom / e-mail / téléphone des clients.
-- APRÈS : le public (rôle « anon ») ne peut plus lire ces colonnes ; le
-- boulanger connecté (« authenticated ») garde l'accès complet.
revoke select on commandes from anon;
grant select
  (id, numero, creneau, heure_retrait, statut, articles, total, arrive, remboursee, stripe_session, cree_le)
  on commandes to anon;
grant select on commandes to authenticated;

-- Le temps réel ne diffuse plus les colonnes perso non plus.
-- (Si cette ligne renvoie une erreur, ce n'est pas grave : les protections
--  ci-dessus sont déjà en place. Passer à la suite.)
alter publication supabase_realtime set table commandes
  (id, numero, creneau, heure_retrait, statut, articles, total, arrive, remboursee, stripe_session, cree_le);

-- ---------- 3) Écritures réservées au boulanger (rappel) ----------
-- (déjà en place si seed.sql a été passé — on le ré-affirme par sécurité)
drop policy if exists "signaler arrivee" on commandes;
drop policy if exists "boulanger modifie commandes" on commandes;
create policy "boulanger modifie commandes" on commandes
  for update to authenticated using (true) with check (true);
