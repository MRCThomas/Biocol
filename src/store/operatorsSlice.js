// src/store/operatorsSlice.js (version corrigée)
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchOperators = createAsyncThunk(
  'operators/fetchOperators',
  async ({ lat, lng, nb = 20, debut = 0, filters = {} }) => {
    const params = new URLSearchParams();
    
    if (lat !== undefined && lat !== null) params.append('lat', lat);
    if (lng !== undefined && lng !== null) params.append('lng', lng);
    if (nb !== undefined && nb !== null) params.append('nb', nb);
    if (debut !== undefined && debut !== null) params.append('debut', debut);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    const response = await fetch(
      `https://opendata.agencebio.org/api/gouv/operateurs/?${params}`
    );
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    return response.json();
  }
);

const operatorsSlice = createSlice({
  name: 'operators',
  initialState: {
    data: [],
    loading: false,
    error: null,
    hasMore: true,
    nbTotal: 0,
  },
  reducers: {
    clearOperators: (state) => {
      state.data = [];
      state.hasMore = true;
      state.nbTotal = 0;
      state.error = null;
    },
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOperators.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOperators.fulfilled, (state, action) => {
        state.loading = false;
        state.nbTotal = action.payload.nbTotal || 0;
        
        if (action.meta.arg.debut === 0) {
          state.data = action.payload.items || [];
        } else {
          state.data.push(...(action.payload.items || []));
        }
        
        const itemsLength = action.payload.items?.length || 0;
        const currentTotal = state.data.length;
        state.hasMore = currentTotal < state.nbTotal && itemsLength === action.meta.arg.nb;
      })
      .addCase(fetchOperators.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Une erreur est survenue';
      });
  },
});

export const { clearOperators, resetError } = operatorsSlice.actions;
export default operatorsSlice.reducer;