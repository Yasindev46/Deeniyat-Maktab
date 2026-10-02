import { configureStore, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { request } from './api';

export const loadStudents = createAsyncThunk('portal/loadStudents', () => request('/students'));
export const loadFees = createAsyncThunk('portal/loadFees', () => request('/fees'));

const portalSlice = createSlice({
  name: 'portal',
  initialState: {
    students: [],
    fees: [],
    loadingStudents: false,
    loadingFees: false,
    error: '',
  },
  reducers: {
    clearError(state) {
      state.error = '';
    },
  },
  extraReducers(builder) {
    builder
      .addCase(loadStudents.pending, (state) => {
        state.loadingStudents = true;
        state.error = '';
      })
      .addCase(loadStudents.fulfilled, (state, action) => {
        state.loadingStudents = false;
        state.students = action.payload;
      })
      .addCase(loadStudents.rejected, (state, action) => {
        state.loadingStudents = false;
        state.error = action.error.message || 'Could not load student records.';
      })
      .addCase(loadFees.pending, (state) => {
        state.loadingFees = true;
        state.error = '';
      })
      .addCase(loadFees.fulfilled, (state, action) => {
        state.loadingFees = false;
        state.fees = action.payload;
      })
      .addCase(loadFees.rejected, (state, action) => {
        state.loadingFees = false;
        state.error = action.error.message || 'Could not load fee records.';
      });
  },
});

export const { clearError } = portalSlice.actions;

export const store = configureStore({
  reducer: { portal: portalSlice.reducer },
});
