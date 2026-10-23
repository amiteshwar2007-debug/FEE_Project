import { configureStore } from '@reduxjs/toolkit';
import quiz from './quizSlice';
import history from './historySlice';

export const store = configureStore({ reducer: { quiz, history } });

// All data stays on this device: save history to localStorage whenever it changes.
store.subscribe(() => localStorage.setItem('qm_history', JSON.stringify(store.getState().history)));
