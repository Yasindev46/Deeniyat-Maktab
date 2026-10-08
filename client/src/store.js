import { configureStore, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { request } from './api';

export const loadStudents = createAsyncThunk('portal/loadStudents', () => request('/students'));
export const loadFees = createAsyncThunk('portal/loadFees', () => request('/fees'));
export const loadExpenses = createAsyncThunk('portal/loadExpenses', () => request('/expenses'));

const portalSlice = createSlice({
  name: 'portal',
  initialState: {
    students: [],
    fees: [],
    expenses: [],
    loadingStudents: false,
    loadingFees: false,
    loadingExpenses: false,
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
      })
      .addCase(loadExpenses.pending, (state) => {
        state.loadingExpenses = true;
        state.error = '';
      })
      .addCase(loadExpenses.fulfilled, (state, action) => {
        state.loadingExpenses = false;
        state.expenses = action.payload;
      })
      .addCase(loadExpenses.rejected, (state, action) => {
        state.loadingExpenses = false;
        state.error = action.error.message || 'Could not load expense records.';
      });
  },
});

export const { clearError } = portalSlice.actions;

export const store = configureStore({
  reducer: { portal: portalSlice.reducer },
});
