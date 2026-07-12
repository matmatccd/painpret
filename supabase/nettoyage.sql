-- Nettoyage avant lancement : efface les commandes de test
-- (toutes celles en base sont des tests). Repart d'une ardoise propre.
delete from commandes;

-- Permet au boulanger connecte de supprimer une commande a l'avenir
drop policy if exists "boulanger supprime commande" on commandes;
create policy "boulanger supprime commande" on commandes
  for delete to authenticated using (true);
