// ============================================================
//  Images des produits & catégories
//  ------------------------------------------------------------
//  Les données (démo OU base Supabase) ne stockent qu'une "clé"
//  d'image (ex : "baguette-tradition"). Ici, on relie chaque clé
//  à la vraie photo importée. Une image téléversée par le boulanger
//  est stockée directement (data:... ou http...) et affichée telle quelle.
// ============================================================

import baguetteOrdinaire from '../assets/photos/baguette-ordinaire.jpg'
import baguetteTradition from '../assets/photos/baguette-tradition.jpg'
import baguetteBio from '../assets/photos/baguette-bio.jpg'
import baguetteGraines from '../assets/photos/baguette-graines.jpg'
import baguetteFibres from '../assets/photos/baguette-fibres.jpg'
import painComplet from '../assets/photos/pain-complet.jpg'
import painNoir from '../assets/photos/pain-noir.jpg'
import paveFibres from '../assets/photos/pave-fibres.jpg'
import brioche from '../assets/photos/brioche.jpg'
import cocaCanette from '../assets/photos/coca-canette.jpg'
import cocaZeroCanette from '../assets/photos/coca-zero-canette.jpg'
import cocaBouteille from '../assets/photos/coca-bouteille.jpg'
import cocaZeroBouteille from '../assets/photos/coca-zero-bouteille.jpg'
import orangina from '../assets/photos/orangina.jpg'
import oasisTropical from '../assets/photos/oasis-tropical.jpg'
import liptonPeche from '../assets/photos/lipton-peche.jpg'
import minuteMaid from '../assets/photos/minute-maid.jpg'
import cristaline from '../assets/photos/cristaline.jpg'
import sanPellegrino from '../assets/photos/san-pellegrino.jpg'

export const IMAGES = {
  'baguette-ordinaire': baguetteOrdinaire,
  'baguette-tradition': baguetteTradition,
  'baguette-bio': baguetteBio,
  'baguette-graines': baguetteGraines,
  'baguette-fibres': baguetteFibres,
  'pain-complet': painComplet,
  'pain-noir': painNoir,
  'pave-fibres': paveFibres,
  brioche,
  'coca-canette': cocaCanette,
  'coca-zero-canette': cocaZeroCanette,
  'coca-bouteille': cocaBouteille,
  'coca-zero-bouteille': cocaZeroBouteille,
  orangina,
  'oasis-tropical': oasisTropical,
  'lipton-peche': liptonPeche,
  'minute-maid': minuteMaid,
  cristaline,
  'san-pellegrino': sanPellegrino,
}

// Transforme la valeur stockée en une vraie source d'image affichable.
// - vide       -> null (dégradé + emoji de repli)
// - data:/http -> photo téléversée, utilisée telle quelle
// - une clé    -> la photo importée correspondante
export function resolveImage(valeur) {
  if (!valeur) return null
  if (valeur.startsWith('data:') || valeur.startsWith('http') || valeur.startsWith('/')) {
    return valeur
  }
  return IMAGES[valeur] ?? null
}
