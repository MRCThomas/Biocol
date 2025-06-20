// src/store/favoritesSlice.js
import { createSlice } from '@reduxjs/toolkit';
// Import correct des fonctions de la base de données
import { saveFavorite, removeFavorite, getFavorites } from '../services/database';

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: {
    items: [], // Renommé 'favorites' en 'items' pour correspondre à la déstructuration dans FavoritesScreen
    loading: false,
  },
  reducers: {
    setFavorites: (state, action) => {
      state.items = action.payload; // Met à jour 'items'
    },
    addFavorite: (state, action) => {
      const exists = state.items.find(fav => fav.id === action.payload.id); // Vérifie dans 'items'
      if (!exists) {
        state.items.push(action.payload); // Ajoute à 'items'
        // Appel direct à la fonction de sauvegarde, à noter que pour des applications plus complexes,
        // l'utilisation de thunks est recommandée pour les effets de bord.
        saveFavorite(action.payload);
      }
    },
    // Correction du nom de l'action pour la suppression
    removeFavoriteFromState: (state, action) => {
      state.items = state.items.filter(fav => fav.id !== action.payload); // Filtre 'items'
      // Appel direct à la fonction de suppression, comme mentionné ci-dessus.
      removeFavorite(action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

// Export des actions corrigées
export const { setFavorites, addFavorite, removeFavoriteFromState, setLoading } = favoritesSlice.actions;
export default favoritesSlice.reducer;
