// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import operatorsReducer from './operatorsSlice';
import favoritesReducer from './favoritesSlice';
import preferencesReducer from './preferencesSlice';

export const store = configureStore({
  reducer: {
    operators: operatorsReducer,
    favorites: favoritesReducer,
    preferences: preferencesReducer,
  },
});
