import { createSlice } from '@reduxjs/toolkit';

// Quiz attempts grouped by user id: { [userId]: [attempt, ...] }.
// store.js saves this to localStorage after every change.
const historySlice = createSlice({
  name: 'history',
  initialState: JSON.parse(localStorage.getItem('qm_history') || '{}'),
  reducers: {
    addAttempt: (state, { payload }) => {
      const { userId, ...attempt } = payload;
      (state[userId] ||= []).unshift({ id: Date.now(), date: new Date().toLocaleDateString('en-GB'), ...attempt });
    },
    clearHistory: (state, { payload: userId }) => {
      delete state[userId];
    },
  },
});

export const { addAttempt, clearHistory } = historySlice.actions;
export default historySlice.reducer;
