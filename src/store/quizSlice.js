import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getManualQuestions } from '../quizquestions';
import { addAttempt } from './historySlice';

const shuffle = (list) => list.map((x) => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);
const decode = (text) => new DOMParser().parseFromString(text, 'text/html').documentElement.textContent;
const CATEGORY = { html: 18, css: 18, javascript: 18, react: 18, oops: 18, logic_reasoning: 19, gadgets: 30, general: 9 };

// Async thunk: half the questions come from Open Trivia DB, the rest from the offline bank.
// If the network call fails we still start the quiz and show a warning (error handling).
export const loadQuestions = createAsyncThunk(
  'quiz/load',
  async ({ subject, difficulty, count }) => {
    let online = [];
    let warning = '';
    try {
      const category = CATEGORY[subject] ? `&category=${CATEGORY[subject]}` : '';
      const level = difficulty !== 'mixed' ? `&difficulty=${difficulty}` : '';
      const res = await fetch(`https://opentdb.com/api.php?amount=${Math.floor(count / 2)}${category}${level}`);
      const data = await res.json();
      if (data.response_code !== 0) throw new Error('No online questions');
      online = data.results.map((q) => {
        const correct = decode(q.correct_answer);
        const options = q.type === 'boolean' ? ['True', 'False'] : shuffle([correct, ...q.incorrect_answers.map(decode)]);
        return { question: decode(q.question), options, answer: options.indexOf(correct), category: decode(q.category), difficulty: q.difficulty.toUpperCase(), explanation: `Correct answer: ${correct}` };
      });
    } catch {
      warning = 'Online questions are unavailable, so this quiz uses the offline question bank.';
    }
    const offline = getManualQuestions({ subject, difficulty, count: count - online.length });
    return { questions: shuffle([...online, ...offline]), warning };
  },
  // Ignore a second request while one is already loading (React StrictMode runs effects twice in dev)
  { condition: (_, { getState }) => getState().quiz.status !== 'loading' },
);

const initialState = { status: 'idle', questions: [], answers: [], current: 0, warning: '', result: null, subject: '', difficulty: '' };

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    reset: () => initialState,
    answer: (state, { payload }) => { state.answers[state.current] = payload; },
    goTo: (state, { payload }) => { state.current = payload; },
    finish: (state) => {
      const score = state.questions.filter((q, i) => state.answers[i] === q.answer).length;
      state.result = { score, total: state.questions.length, percentage: Math.round((score / (state.questions.length || 1)) * 100) };
      state.status = 'finished';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadQuestions.pending, (state, { meta }) => ({ ...initialState, status: 'loading', subject: meta.arg.subject, difficulty: meta.arg.difficulty }))
      .addCase(loadQuestions.fulfilled, (state, { payload }) => {
        state.status = 'ready';
        state.questions = payload.questions;
        state.warning = payload.warning;
        state.answers = Array(payload.questions.length).fill(null);
      });
  },
});

export const { reset, answer, goTo } = quizSlice.actions;

// Thunk: score the quiz, then save the attempt. The status check blocks double submits (e.g. timer + click).
export const submitQuiz = (user) => (dispatch, getState) => {
  if (getState().quiz.status !== 'ready') return;
  dispatch(quizSlice.actions.finish());
  const { result, subject, difficulty } = getState().quiz;
  dispatch(addAttempt({ userId: user.id, name: user.name, subject: `${subject.replace('_', ' ')}`.toUpperCase(), difficulty: difficulty.toUpperCase(), ...result }));
};

export default quizSlice.reducer;
