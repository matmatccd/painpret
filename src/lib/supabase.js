import { createClient } from '@supabase/supabase-js'

// ============================================================
//  Connexion à Supabase (la vraie base de données en ligne)
//  ------------------------------------------------------------
//  Les deux clés viennent du fichier .env.local (jamais publié) :
//    VITE_SUPABASE_URL=...      (adresse du projet)
//    VITE_SUPABASE_ANON_KEY=... (clé publique de lecture)
//  Tant qu'elles n'existent pas, le site fonctionne en mode
//  démonstration (données locales, comme avant).
// ============================================================

const url = import.meta.env.VITE_SUPABASE_URL
const cle = import.meta.env.VITE_SUPABASE_ANON_KEY

// null = mode démo ; sinon = client connecté à la vraie base
export const supabase = url && cle ? createClient(url, cle) : null

// Pratique pour afficher un badge "démo" ou brancher le vrai code
export const modeReel = supabase !== null
