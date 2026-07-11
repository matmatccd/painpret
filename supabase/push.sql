-- ============================================================
--  PainPrêt — Abonnements aux notifications push (boulanger)
--  À coller dans : Supabase → SQL Editor → New query → Run
-- ============================================================

create table if not exists push_subscriptions (
  endpoint text primary key,
  p256dh text not null,
  auth text not null,
  cree_le timestamptz default now()
);

-- Seul le boulanger connecté peut enregistrer/mettre à jour son abonnement.
alter table push_subscriptions enable row level security;
create policy "boulanger gere ses push" on push_subscriptions
  for all to authenticated using (true) with check (true);
