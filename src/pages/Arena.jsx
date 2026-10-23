import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaCheck } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { loadQuestions, submitQuiz, answer, goTo } from '../store/quizSlice';

export default function Arena() {
  // Settings come from the URL set by QuizConfig
  const [params] = useSearchParams();
  const subject = params.get('subject') || 'mixed';
  const difficulty = params.get('difficulty') || 'mixed';
  const count = Number(params.get('question_count')) || 20;
  const perQuestion = params.get('timer_mode') !== 'total_test';
  const seconds = perQuestion ? Number(params.get('per_q_time') ?? 60) : (Number(params.get('total_test_time')) || 25) * 60;

  // Quiz data is in Redux; the countdown is local state because only this page needs it
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { status, questions, answers, current, warning, result } = useSelector((s) => s.quiz);
  const [timeLeft, setTimeLeft] = useState(seconds);

  // 1. Load questions when the page opens
  useEffect(() => { dispatch(loadQuestions({ subject, difficulty, count })); }, [dispatch, subject, difficulty, count]);

  // 2. Tick once per second while the quiz is running
  useEffect(() => {
    if (status !== 'ready' || !seconds) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [status, seconds]);

  // 3. Change question; the per-question clock restarts each time
  const go = (index) => { dispatch(goTo(index)); if (perQuestion) setTimeLeft(seconds); };

  // 4. When time runs out: move on, or submit on the last question
  useEffect(() => {
    if (status !== 'ready' || !seconds || timeLeft > 0) return;
    if (perQuestion && current < questions.length - 1) go(current + 1);
    else dispatch(submitQuiz(user));
  }, [timeLeft]);

  if (status === 'idle' || status === 'loading') {
    return <main className="container center"><div className="spinner" /><h3>Preparing your assessment</h3><p className="muted">Fetching online questions and the offline bank.</p></main>;
  }

  if (status === 'finished') {
    return (
      <main className="container">
        <section className="card center">
          <h1>{result.score} / {result.total} ({result.percentage}%)</h1>
          <p className="muted">{result.percentage >= 80 ? 'Excellent work.' : result.percentage >= 50 ? 'Good attempt. Review the answers below.' : 'Keep practising. Review the answers below.'}</p>
          <div className="row">
            <Link to="/history" className="btn btn-primary">View history</Link>
            <Link to="/quiz" className="btn btn-outline">Start a new quiz</Link>
          </div>
        </section>
        {questions.map((q, i) => {
          const correct = answers[i] === q.answer;
          return (
            <article key={i} className={`card review ${correct ? 'review-ok' : 'review-bad'}`}>
              <h3>{i + 1}. {q.question}</h3>
              <p>Your answer: {answers[i] === null ? 'Not answered' : q.options[answers[i]]}</p>
              {!correct && <p>Correct answer: {q.options[q.answer]}</p>}
              <p className="muted">{q.explanation}</p>
            </article>
          );
        })}
      </main>
    );
  }

  const q = questions[current];
  const clock = !seconds ? 'Untimed' : `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`;

  return (
    <div>
      <div className="progress-bar"><div className="progress-fill" style={{ width: `${((current + 1) / questions.length) * 100}%` }} /></div>
      <main className="container">
        {warning && <div className="notice">{warning}</div>}
        <div className="arena-layout">
          <article className="card">
            <div className="arena-header">
              <div>
                <span className="badge">{q.category} • {q.difficulty}</span>
                <div className="muted">Question {current + 1} of {questions.length}</div>
              </div>
              <div className={`timer-pill ${seconds && timeLeft <= 10 ? 'timer-danger' : ''}`}>{clock}</div>
            </div>
            <h2 className="question-title">{q.question}</h2>
            <div className="options-list" role="radiogroup">
              {q.options.map((opt, i) => (
                <button key={i} type="button" className={`option-btn ${answers[current] === i ? 'selected' : ''}`} onClick={() => dispatch(answer(i))}>
                  {'ABCD'[i]}. {opt}
                </button>
              ))}
            </div>
            <div className="row between">
              <button type="button" className="btn btn-outline" disabled={current === 0} onClick={() => go(current - 1)}>Previous</button>
              {current === questions.length - 1
                ? <button type="button" className="btn btn-primary" onClick={() => dispatch(submitQuiz(user))}>Submit <FaCheck /></button>
                : <button type="button" className="btn btn-primary" onClick={() => go(current + 1)}>Next</button>}
            </div>
          </article>
          <aside className="palette-card">
            <h4>Question palette</h4>
            <div className="palette-grid">
              {questions.map((_, i) => (
                <button key={i} type="button" className={`palette-btn ${i === current ? 'active' : ''} ${answers[i] !== null ? 'answered' : ''}`} onClick={() => go(i)}>{i + 1}</button>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
