-- Pause du fournil (bouton "Pause 30 min" de l'espace boulanger).
-- A coller dans Supabase -> SQL Editor -> Run.
alter table reglages add column if not exists pause_jusqua timestamptz;
