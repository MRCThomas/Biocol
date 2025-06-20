// src/store/preferencesSlice.js
import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: {
    defaultAddress: '',
    defaultRadius: 20,
    defaultFilters: {
      filtrerVenteDetail: false,
      filtrerRestaurants: false,
      filtrerMagasinSpec: false,
    },
    useGeolocation: false,
  },
  reducers: {
    setPreferences: (state, action) => {
      return { ...state, ...action.payload };
    },
    updatePreference: (state, action) => {
      const { key, value } = action.payload;
      state[key] = value;
      AsyncStorage.setItem('preferences', JSON.stringify(state));
    },
  },
});

export const { setPreferences, updatePreference } = preferencesSlice.actions;
export default preferencesSlice.reducer;
