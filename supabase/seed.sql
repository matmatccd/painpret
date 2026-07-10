-- Remplissage des produits + correctif sécurité (arrivée client)
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
  (1, 'La Pétrisane', 'pains', 'Pétrisane', 1.35, '300 g de plaisir à la saveur unique et au fondant incomparable. Elle accompagne tous vos repas, du petit déjeuner au dîner.', 'baguette-tradition', '🥖', ARRAY['Farine de blé T65', 'Eau', 'Levain naturel', 'Sel'], ARRAY['Gluten'], 10, 40, true, '2026-06-10T08:28:18.992Z'),
  (2, 'Pétrisane Bio', 'pains', 'Pétrisane', 1.35, '300 g de plaisir confectionnés exclusivement à partir de blé biologique. La Pétrisane version bio, au goût franc et authentique.', 'baguette-bio', '🥖', ARRAY['Farine de blé bio', 'Eau', 'Levain naturel', 'Sel'], ARRAY['Gluten'], 10, 25, false, '2026-06-10T08:28:18.992Z'),
  (3, 'La Pétrisane Graines', 'pains', 'Pétrisane', 1.35, 'La Pétrisane agrémentée de savoureuses graines de lin, de tournesol et de sésame, pour un croquant et des notes de noisette. 300 g.', 'baguette-graines', '🌾', ARRAY['Farine de blé', 'Graines de lin', 'Sésame', 'Tournesol', 'Levain', 'Sel'], ARRAY['Gluten', 'Sésame'], 10, 20, true, '2026-06-10T08:28:18.992Z'),
  (4, 'La Pétrisane Fibres', 'pains', 'Pétrisane', 1.35, 'Moelleuse, aux enveloppes de blé biologique, elle allie goût et bien-être. Riche en fibres, la complice du quotidien. 300 g.', 'baguette-fibres', '🥖', ARRAY['Farine de blé', 'Son de blé', 'Eau', 'Levain', 'Sel'], ARRAY['Gluten'], 10, 18, false, '2026-06-10T08:28:18.992Z'),
  (7, 'Baguette ordinaire', 'pains', 'Baguettes', 1.2, 'La classique de tous les jours : croûte fine et dorée, mie souple et légère. Simple et bien faite. 250 g.', 'baguette-ordinaire', '🥖', ARRAY['Farine de blé', 'Eau', 'Levure', 'Sel'], ARRAY['Gluten'], 10, 50, true, '2026-06-10T08:28:18.992Z'),
  (8, 'Pain Complet', 'pains-speciaux', 'Pains ronds', 2.7, 'Farine complète, mie généreuse et goût rustique de céréale. Se garde plusieurs jours — parfait en tartines. 310 g.', 'pain-complet', '🍞', ARRAY['Farine de blé complète', 'Eau', 'Levain', 'Sel'], ARRAY['Gluten'], 10, 14, false, '2026-06-10T08:28:18.992Z'),
  (9, 'Pain Noir', 'pains-speciaux', 'Pains ronds', 2.5, 'Seigle et graines torréfiées : une mie sombre, dense et parfumée, au caractère affirmé. L’allié des fromages et du saumon. 300 g.', 'pain-noir', '🍞', ARRAY['Farine de seigle', 'Farine de blé', 'Graines', 'Levain', 'Sel'], ARRAY['Gluten', 'Sésame'], 10, 10, false, '2026-06-10T08:28:18.992Z'),
  (10, 'Pavé Fibres', 'pains-speciaux', 'Pains ronds', 2.5, 'Croûte épaisse bien cuite, mie moelleuse et riche en fibres. Le pavé qui accompagne tous les repas. 300 g.', 'pave-fibres', '🍞', ARRAY['Farine de blé', 'Son de blé', 'Eau', 'Levain', 'Sel'], ARRAY['Gluten'], 10, 12, false, '2026-06-10T08:28:18.992Z'),
  (11, 'Brioche', 'pains-speciaux', 'Brioches', 4.5, 'Brioche pur beurre cuite dans son moule : mie filante, croûte dorée et parfum gourmand. Parfaite au petit déjeuner ou au goûter.', 'brioche', '🥮', ARRAY['Farine de blé', 'Œufs', 'Beurre', 'Sucre', 'Levure', 'Sel'], ARRAY['Gluten', 'Œufs', 'Lait'], 10, 8, false, '2026-07-09T08:28:18.992Z'),
  (12, 'Coca-Cola 33 cl', 'boissons', 'Sodas', 1.5, 'La canette classique, bien fraîche — le goût original.', 'coca-canette', '🥤', ARRAY[]::text[], ARRAY[]::text[], 10, 24, true, '2026-07-05T08:28:18.992Z'),
  (13, 'Coca-Cola Zéro 33 cl', 'boissons', 'Sodas', 1.5, 'Le goût Coca-Cola, zéro sucres — en canette fraîche.', 'coca-zero-canette', '🥤', ARRAY[]::text[], ARRAY[]::text[], 10, 24, false, '2026-07-05T08:28:18.992Z'),
  (14, 'Coca-Cola 50 cl', 'boissons', 'Sodas', 2, 'La bouteille 50 cl à emporter — goût original.', 'coca-bouteille', '🥤', ARRAY[]::text[], ARRAY[]::text[], 10, 18, false, '2026-07-05T08:28:18.992Z'),
  (15, 'Coca-Cola Zéro 50 cl', 'boissons', 'Sodas', 2, 'La bouteille 50 cl zéro sucres, sans calories.', 'coca-zero-bouteille', '🥤', ARRAY[]::text[], ARRAY[]::text[], 10, 18, false, '2026-07-05T08:28:18.992Z'),
  (16, 'Orangina 50 cl', 'boissons', 'Sodas', 2, 'La bulle à l’orange… et sa pulpe ! Bouteille 50 cl.', 'orangina', '🍊', ARRAY[]::text[], ARRAY[]::text[], 10, 15, false, '2026-07-05T08:28:18.992Z'),
  (17, 'Oasis Tropical 33 cl', 'boissons', 'Jus', 1.5, 'À l’eau de source et aux fruits, saveur tropicale. 33 cl.', 'oasis-tropical', '🌴', ARRAY[]::text[], ARRAY[]::text[], 10, 15, false, '2026-07-05T08:28:18.992Z'),
  (18, 'Lipton Ice Tea Pêche 50 cl', 'boissons', 'Sodas', 2, 'Thé glacé saveur pêche, faible en calories. Bouteille 50 cl.', 'lipton-peche', '🍑', ARRAY[]::text[], ARRAY[]::text[], 10, 15, false, '2026-07-05T08:28:18.992Z'),
  (19, 'Minute Maid Orange 33 cl', 'boissons', 'Jus', 1.5, 'Jus à teneur en fruits, riche en vitamine C. Canette 33 cl.', 'minute-maid', '🍊', ARRAY[]::text[], ARRAY[]::text[], 10, 15, false, '2026-07-05T08:28:18.992Z'),
  (20, 'Cristaline 50 cl', 'boissons', 'Eaux', 1, 'Eau de source à l’état naturel, fabriquée en France. 50 cl.', 'cristaline', '💧', ARRAY[]::text[], ARRAY[]::text[], 10, 30, false, '2026-07-05T08:28:18.992Z'),
  (21, 'San Pellegrino 50 cl', 'boissons', 'Eaux', 1.5, 'Eau minérale naturelle finement pétillante. Bouteille 50 cl.', 'san-pellegrino', '🫧', ARRAY[]::text[], ARRAY[]::text[], 10, 20, false, '2026-07-05T08:28:18.992Z');

-- 4) On recale le compteur d'id pour les prochains produits créés par le boulanger
select setval(pg_get_serial_sequence('produits', 'id'), (select max(id) from produits));
