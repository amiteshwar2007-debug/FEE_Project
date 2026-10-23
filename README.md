# QuizMaster (FEE-II PE-II)

Timed technical and aptitude practice quiz. Everything is stored in the browser (`localStorage`); there is no server.

```bash
npm install
npm run dev
```

## Syllabus map

| Topic | Where |
|---|---|
| Multi-page SPA, layout, routing | `src/App.jsx` (nested `Layout` + `<Outlet />`, `Protected` route, `NavLink`, `useSearchParams`) |
| Context API, global vs local state | `src/context/AuthContext.jsx` (logged-in user), `src/context/ThemeContext.jsx` (light/dark), `src/components/Toast.jsx` (notifications). Local state: form fields, quiz countdown |
| Redux Toolkit | `src/store/` (`quizSlice` with `createAsyncThunk`, `historySlice`, `store.js` saves history to `localStorage`) |
| Async state, loading and errors | `loadQuestions` thunk: loading spinner, offline fallback and warning banner in `Arena.jsx` |
| Forms and validation | `src/pages/Login.jsx` (validate on blur and submit), reusable `src/components/FormInput.jsx` |

## localStorage keys

`qm_users` (accounts), `qm_session` (logged-in user), `qm_history` (attempts per user), `qm_theme` (light or dark).
