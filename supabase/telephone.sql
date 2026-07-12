-- Ajoute le telephone aux commandes + met a jour la fonction passer_commande.
-- A coller dans SQL Editor -> Run.

alter table commandes add column if not exists telephone text default '';

drop function if exists passer_commande(text, text, text, timestamptz, jsonb, numeric);

create or replace function passer_commande(
  p_client text,
  p_email text,
  p_telephone text,
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
  if (select boutique_fermee from reglages where id = 1) then
    raise exception 'boutique_fermee';
  end if;

  for article in select * from jsonb_array_elements(p_articles) loop
    update produits
      set stock = stock - (article ->> 'quantite')::int
      where id = (article ->> 'produitId')::bigint
        and stock >= (article ->> 'quantite')::int;
    if not found then
      raise exception 'stock_insuffisant: %', article ->> 'nom';
    end if;
  end loop;

  v_numero := 'B' || lpad((floor(random() * 90) + 10)::text, 2, '0');
  while exists (select 1 from commandes where numero = v_numero) loop
    v_numero := 'B' || lpad((floor(random() * 90) + 10)::text, 2, '0');
  end loop;

  insert into commandes (numero, client, email, telephone, creneau, heure_retrait, articles, total)
    values (v_numero, p_client, p_email, p_telephone, p_creneau, p_heure_retrait, p_articles, p_total)
    returning * into nouvelle;

  return nouvelle;
end;
$$;
