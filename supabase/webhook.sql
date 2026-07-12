-- PainPret - Declencheur: a chaque nouvelle commande, appeler la fonction
-- serveur (notification push + email). A coller dans SQL Editor -> Run.

create extension if not exists pg_net;

create or replace function public.notifier_nouvelle_commande()
returns trigger
language plpgsql
security definer
as $$
begin
  perform net.http_post(
    url := 'https://utxqtsasdygyrddyhogu.supabase.co/functions/v1/on-nouvelle-commande',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer sb_publishable_YuZN7MNNlsBpiKugzW07GA_fNXKoMa4"}'::jsonb,
    body := jsonb_build_object('type', 'INSERT', 'table', 'commandes', 'record', to_jsonb(NEW))
  );
  return NEW;
end;
$$;

drop trigger if exists on_nouvelle_commande on public.commandes;

create trigger on_nouvelle_commande
  after insert on public.commandes
  for each row
  execute function public.notifier_nouvelle_commande();
