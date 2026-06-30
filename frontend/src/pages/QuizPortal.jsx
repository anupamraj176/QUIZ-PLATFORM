import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function QuizPortal() {
  const [candidate, setCandidate] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState(new Map()); // id -> { option, value }
  const [visited, setVisited] = useState(new Set());
  const [markedReview, setMarkedReview] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState('');
  const [successModal, setSuccessModal] = useState(false);
  const navigate = useNavigate();
  const mathRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    // Access candidate details
    fetch('/user/access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth_token': token,
      },
    })
      .then((res) => res.json())
      .then((body) => {
        if (body.status === 0) {
          setCandidate(body.data);
          
          // Preload existing answers if any
          const preloadedAnswers = new Map();
          if (body.data.answer) {
            body.data.answer.forEach(ans => {
              preloadedAnswers.set(ans.key, { option: Number(ans.option), value: ans.value });
            });
            setAnswers(preloadedAnswers);
          }
          if (body.data.visited) {
            setVisited(new Set(body.data.visited));
          }
          if (body.data.markReview) {
            setMarkedReview(new Set(body.data.markReview));
          }

          // Fetch questions
          fetch('/question/sendquestion', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'auth_token': token,
            },
            body: JSON.stringify({
              stream: body.data.stream,
              program: body.data.program,
            }),
          })
            .then((r) => r.json())
            .then((res) => {
              if (res.status === 0) {
                setQuestions(res.data);
                if (res.data.length > 0) {
                  setVisited(prev => {
                    const nextSet = new Set(prev);
                    nextSet.add(res.data[0].id);
                    return nextSet;
                  });
                }
              }
            });
        } else {
          localStorage.removeItem('token');
          navigate('/');
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/');
      });

    // Timing timer
    let timerId;
    const fetchTimings = () => {
      fetch('/time/timing')
        .then((res) => res.json())
        .then((res) => {
          const compareDate = new Date(res.EDate);
          const presentDate = new Date(res.presentDate);

          if (presentDate >= compareDate) {
            submitExam(true);
            clearInterval(timerId);
          } else {
            const diff = compareDate.getTime() - presentDate.getTime();
            if (diff > 0) {
              const seconds = Math.floor(diff / 1000);
              const minutes = Math.floor(seconds / 60);
              const hours = Math.floor(minutes / 60);
              const displayMinutes = minutes % 60;
              const displaySeconds = seconds % 60;
              setTimeLeft(`${hours}h ${displayMinutes}m ${displaySeconds}s`);
            }
          }
        });
    };

    fetchTimings();
    timerId = setInterval(fetchTimings, 1000);

    return () => clearInterval(timerId);
  }, [navigate]);

  useEffect(() => {
    // Typeset Math formulas on index change
    if (questions.length > 0) {
      if (window.renderMathInElement) {
        window.renderMathInElement(document.body, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true }
          ],
          throwOnError: false
        });
      }
      if (window.MathJax && window.MathJax.typeset) {
        window.MathJax.typeset();
      }
    }
  }, [activeIndex, questions]);

  const selectQuestion = (idx) => {
    setActiveIndex(idx);
    const targetQues = questions[idx];
    if (targetQues) {
      setVisited(prev => {
        const nextSet = new Set(prev);
        nextSet.add(targetQues.id);
        uploadProgress(nextSet, answers, markedReview);
        return nextSet;
      });
    }
  };

  const setChoice = (quesId, optionIdx, optionVal) => {
    setAnswers(prev => {
      const nextMap = new Map(prev);
      nextMap.set(quesId, { option: optionIdx, value: optionVal });
      uploadProgress(visited, nextMap, markedReview);
      return nextMap;
    });
  };

  const clearChoice = (quesId) => {
    setAnswers(prev => {
      const nextMap = new Map(prev);
      nextMap.delete(quesId);
      uploadProgress(visited, nextMap, markedReview);
      return nextMap;
    });
  };

  const toggleMarkReview = (quesId) => {
    setMarkedReview(prev => {
      const nextSet = new Set(prev);
      if (nextSet.has(quesId)) {
        nextSet.delete(quesId);
      } else {
        nextSet.add(quesId);
      }
      uploadProgress(visited, answers, nextSet);
      return nextSet;
    });
  };

  const uploadProgress = (visitedSet, answersMap, reviewSet) => {
    const token = localStorage.getItem('token');
    const answersArr = [];
    answersMap.forEach((val, key) => {
      answersArr.push({ key, option: String(val.option), value: val.value });
    });

    fetch('/user/uploadAnswer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth_token': token,
      },
      body: JSON.stringify({
        answer: answersArr,
        visited: Array.from(visitedSet),
        markReview: Array.from(reviewSet),
      }),
    }).catch(console.error);
  };

  const submitExam = (auto = false) => {
    if (!auto && !window.confirm("Are you sure you want to submit the exam?")) {
      return;
    }
    setSuccessModal(true);
    setTimeout(() => {
      logout();
    }, 5000);
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const arrayBufferToBase64 = (buffer) => {
    var binary = '';
    var bytes = [].slice.call(new Uint8Array(buffer));
    bytes.forEach((b) => binary += String.fromCharCode(b));
    return window.btoa(binary);
  };

  if (!candidate || questions.length === 0) return <div className="text-center p-12 text-slate-400">Loading Exam Engine...</div>;

  const currentQues = questions[activeIndex];
  const choiceMap = answers.get(currentQues.id);

  return (
    <div className="font-sans bg-slate-950 text-slate-200 min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 selection:bg-slate-800 selection:text-white">
      {/* Top Header */}
      <div className="bg-slate-900/80 border-b border-slate-800/80 py-4 px-6 flex flex-col sm:flex-row items-center justify-between sticky top-0 z-50 backdrop-blur-md gap-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-slate-300 font-medium">
          <p><span className="text-slate-500 mr-1">Application No:</span> <span className="text-white font-semibold">{candidate.applicationNo}</span></p>
          <p><span className="text-slate-500 mr-1">Name:</span> <span className="text-white font-semibold">{candidate.name}</span></p>
          <p><span className="text-slate-500 mr-1">Category:</span> <span className="text-white font-semibold">{candidate.program}</span></p>
          <p><span className="text-slate-500 mr-1">Stream:</span> <span className="text-white font-semibold">{candidate.stream}</span></p>
        </div>
        <div className="timer bg-slate-950/60 border border-slate-800/80 rounded-xl px-5 py-2.5 flex items-center gap-3 text-center backdrop-blur-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time Remaining:</span>
          <span className="text-white font-bold tracking-wider font-mono text-sm">{timeLeft}</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 flex-grow">
        {/* Left MCQ Panel */}
        <div className="lg:col-span-8 bg-slate-900/30 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-xl flex flex-col min-h-[500px]" ref={mathRef}>
          <div className="mcq space-y-4 flex-grow">
            <h1 className="text-base md:text-lg font-bold text-white leading-relaxed">
              <span className="text-slate-400 mr-1">{activeIndex + 1}.</span> {currentQues.question}
            </h1>
            
            {currentQues.image && currentQues.image.contentType && (
              <img
                src={`data:image/${currentQues.image.contentType};base64,${arrayBufferToBase64(currentQues.image.data.data)}`}
                alt="question attachment"
                className="max-w-xs max-h-60 object-contain mt-3 rounded-lg border border-slate-800 shadow-lg"
              />
            )}

            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-5 mb-2">Select your answer:</h3>
            <ul className="mcq-options-list space-y-3 mt-4 mb-6">
              {currentQues.choice.map((choiceText, cIdx) => {
                const letter = String.fromCharCode(65 + cIdx);
                const isSelected = choiceMap && choiceMap.option === cIdx;
                return (
                  <li
                    key={cIdx}
                    id={`${currentQues.id}_option${cIdx}`}
                    onClick={() => setChoice(currentQues.id, cIdx, choiceText)}
                    className={isSelected ? 'selectedOption' : ''}
                  >
                    <span className="w-6 h-6 rounded-full bg-slate-950/80 border border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 mr-2 shrink-0">
                      {letter}
                    </span>
                    <span className="flex-grow">{choiceText}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Action Bar */}
          <div className="flex justify-between items-center border-t border-slate-800 mt-6 pt-5">
            <p
              className="text-xs text-slate-400 hover:text-slate-300 underline cursor-pointer transition-colors"
              onClick={() => clearChoice(currentQues.id)}
            >
              Clear Choice
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className={`px-5 py-2.5 rounded-lg text-xs font-semibold tracking-wide cursor-pointer transition duration-150 ${
                  activeIndex > 0
                    ? 'bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-100 hover:text-white active:scale-95'
                    : 'bg-slate-950 border border-slate-900/50 text-slate-600 cursor-not-allowed'
                }`}
                onClick={() => activeIndex > 0 && selectQuestion(activeIndex - 1)}
                disabled={activeIndex === 0}
              >
                Previous
              </button>
              
              <button
                type="button"
                className="px-5 py-2.5 bg-purple-600/10 border border-purple-900/30 hover:bg-purple-650/20 active:scale-95 text-purple-400 rounded-lg text-xs font-semibold tracking-wide cursor-pointer transition duration-150 shadow-inner"
                onClick={() => toggleMarkReview(currentQues.id)}
              >
                {markedReview.has(currentQues.id) ? 'Unmark Review' : 'Mark for Review'}
              </button>

              {activeIndex < questions.length - 1 ? (
                <button
                  type="button"
                  className="px-5 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 active:scale-95 text-slate-100 hover:text-white rounded-lg text-xs font-semibold tracking-wide cursor-pointer transition duration-150"
                  onClick={() => selectQuestion(activeIndex + 1)}
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  className="px-8 py-2.5 bg-green-600 hover:bg-green-500 active:scale-95 text-white rounded-lg text-xs font-bold tracking-wider cursor-pointer shadow-lg shadow-green-950/25 transition duration-150"
                  onClick={() => submitExam()}
                >
                  Submit Exam
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar Nav */}
        <div className="lg:col-span-4 bg-slate-900/30 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl flex flex-col h-fit gap-6">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Questions Navigation</h2>
            <div className="grid grid-cols-5 gap-3 max-h-[250px] overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                let cellState = '';
                if (markedReview.has(q.id)) {
                  cellState = 'state-review';
                } else if (answers.has(q.id)) {
                  cellState = 'state-answered';
                } else if (visited.has(q.id)) {
                  cellState = 'state-visited';
                }
                return (
                  <div
                    key={idx}
                    onClick={() => selectQuestion(idx)}
                    className={`short ${cellState} ${activeIndex === idx ? 'ring-2 ring-white/50' : ''}`}
                  >
                    {idx + 1}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Legend */}
          <div className="border-t border-slate-800 pt-5 space-y-3">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status Legend</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded bg-purple-600 shadow-md shadow-purple-900/10"></div>
                <span className="text-slate-350 font-medium">Marked for Review</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded bg-red-650 shadow-md shadow-red-950/10"></div>
                <span className="text-slate-350 font-medium">Not Answered</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded bg-green-650 shadow-md shadow-green-950/10"></div>
                <span className="text-slate-350 font-medium">Answered</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded bg-slate-900 border border-slate-800"></div>
                <span className="text-slate-350 font-medium">Not Visited</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {successModal && (
        <div style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: 100 + '%', height: 100 + '%', background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)', zIndex: 10000, justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', width: '90%', maxWidth: '450px', padding: '40px 30px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ width: '72px', height: '72px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', marginBottom: '12px' }}>Exam Submitted!</h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '28px' }}>Your responses have been successfully recorded. Thank you for taking the examination.</p>
            <button onClick={logout} style={{ background: '#ffffff', color: '#0f172a', border: 'none', padding: '12px 30px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', width: '100%', outline: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}>
              Close and Exit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizPortal;
