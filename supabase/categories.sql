-- ============================================================
--  PainPrêt — Table des catégories (partagées entre appareils)
--  À coller dans : Supabase → SQL Editor → New query → Run
--  (Aucun accent ici : les noms seront remplis par un script.)
-- ============================================================

create table if not exists categories (
  id text primary key,
  nom text not null,
  emoji text default '',
  couleur_from text default '#e9b872',
  couleur_to text default '#c98a3a',
  image text,
  sous_categories text[] default '{}',
  ordre int default 0,
  cree_le timestamptz default now()
);

-- Sécurité : tout le monde lit, seul le boulanger connecté modifie
alter table categories enable row level security;
create policy "categories visibles" on categories for select using (true);
create policy "boulanger gere categories" on categories
  for all to authenticated using (true) with check (true);

-- Mises à jour en temps réel
alter publication supabase_realtime add table categories;
