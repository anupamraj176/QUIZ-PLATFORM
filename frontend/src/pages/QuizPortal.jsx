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

  const [paletteWidth, setPaletteWidth] = useState(320);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showPaletteDrawer, setShowPaletteDrawer] = useState(false);
  const isResizingRef = useRef(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startResizing = (mouseDownEvent) => {
    mouseDownEvent.preventDefault();
    isResizingRef.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (mouseMoveEvent) => {
    if (!isResizingRef.current) return;
    const newWidth = window.innerWidth - mouseMoveEvent.clientX;
    if (newWidth > 240 && newWidth < 500) {
      setPaletteWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const startResizingTouch = (touchStartEvent) => {
    isResizingRef.current = true;
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleTouchMove = (touchMoveEvent) => {
    if (!isResizingRef.current) return;
    const touch = touchMoveEvent.touches[0];
    const newWidth = window.innerWidth - touch.clientX;
    if (newWidth > 240 && newWidth < 500) {
      setPaletteWidth(newWidth);
    }
  };

  const handleTouchEnd = () => {
    isResizingRef.current = false;
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };

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

  if (!candidate || questions.length === 0) return <div className="min-h-screen bg-white text-center p-12 text-gray-500">Loading Exam Engine...</div>;

  const currentQues = questions[activeIndex];
  const choiceMap = answers.get(currentQues.id);

  // Stats for palette summary
  const answeredCount = answers.size;
  const notAnsweredCount = Array.from(visited).filter(v => !answers.has(v) && !markedReview.has(v)).length;
  const reviewCount = markedReview.size;
  const notVisitedCount = questions.length - visited.size;

  return (
    <div className="min-h-screen bg-[#f0f0f0] text-black font-sans flex flex-col select-none">
      {/* ===== TOP HEADER BAR ===== */}
      <div className="bg-white border-b-2 border-gray-300 px-4 py-2 flex justify-between items-center">
        <div>
          <h1 className="text-[16px] font-bold m-0">{candidate.name}</h1>
          <p className="text-[12px] text-gray-600 m-0">
            Application No : {candidate.applicationNo}, &nbsp; Program : {candidate.program}, &nbsp; Department : {candidate.stream}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="border border-gray-400 px-4 py-2 bg-gray-50 text-right">
            <span className="text-[11px] text-red-600 font-bold uppercase tracking-wider">Time Left To Finish</span>
            <div className="text-[18px] font-bold text-black font-mono tracking-wide">{timeLeft}</div>
          </div>
        </div>
      </div>

      {/* ===== SECTION TABS ===== */}
      <div className="bg-[#e8e8e8] border-b border-gray-400 px-4 flex items-center">
        <div
          className="px-6 py-2 text-[13px] font-bold cursor-pointer bg-white border-t-2 border-l border-r border-blue-600 text-blue-800 -mb-px"
        >
          {candidate.stream || 'General'}
        </div>
      </div>

      {/* ===== MAIN BODY ===== */}
      <div className="flex flex-grow overflow-hidden">
        {/* LEFT: Question Area */}
        <div className="flex-grow flex flex-col bg-white">
          {/* Question Header */}
          <div className="bg-[#e8e8e8] border-b border-gray-400 px-6 py-2 flex justify-between items-center">
            <span className="text-[13px] font-bold">Question No. {activeIndex + 1}</span>
            <div className="flex items-center gap-4 text-[12px] text-gray-600">
              <span>Marks for correct answer: <b className="text-green-700">1</b></span>
              <span>Negative marks: <b className="text-red-600">0</b></span>
            </div>
          </div>

          {/* Question Body */}
          <div className="flex-grow overflow-y-auto p-6" ref={mathRef}>
            {/* Question Text */}
            <div className="text-[15px] leading-relaxed mb-6">
              <span className="font-bold mr-1">Q.{activeIndex + 1}</span>
              {currentQues.question}
            </div>

            {/* Question Image */}
            {currentQues.image && currentQues.image.contentType && (
              <div className="mb-6">
                <img
                  src={`data:image/${currentQues.image.contentType};base64,${arrayBufferToBase64(currentQues.image.data.data)}`}
                  alt="question attachment"
                  className="max-w-full max-h-64 object-contain border border-gray-300"
                />
              </div>
            )}

            {/* Options with Radio Buttons */}
            <div className="space-y-3">
              {currentQues.choice.map((choiceText, cIdx) => {
                const letter = String.fromCharCode(65 + cIdx);
                const isSelected = choiceMap && choiceMap.option === cIdx;
                return (
                  <label
                    key={cIdx}
                    onClick={() => setChoice(currentQues.id, cIdx, choiceText)}
                    className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition duration-100 ${
                      isSelected
                        ? 'bg-blue-50 border-blue-400'
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q_${currentQues.id}`}
                      checked={isSelected}
                      readOnly
                      className="w-4 h-4 accent-blue-600 cursor-pointer"
                    />
                    <span className="text-[14px]">
                      <span className="font-semibold mr-1">{letter}.</span>
                      {choiceText}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* ===== BOTTOM ACTION BAR ===== */}
          <div className="bg-[#e8e8e8] border-t border-gray-400 px-6 py-3 flex justify-between items-center flex-wrap gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  toggleMarkReview(currentQues.id);
                  if (activeIndex < questions.length - 1) selectQuestion(activeIndex + 1);
                }}
                className="px-4 py-2 bg-[#4a90d9] hover:bg-[#3a7fc8] text-white text-[12px] font-bold border border-[#3a7fc8] cursor-pointer rounded-sm"
              >
                Mark for Review & Next
              </button>
              <button
                type="button"
                onClick={() => clearChoice(currentQues.id)}
                className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 text-[12px] font-bold border border-gray-400 cursor-pointer rounded-sm"
              >
                Clear Response
              </button>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => activeIndex > 0 && selectQuestion(activeIndex - 1)}
                disabled={activeIndex === 0}
                className="px-5 py-2 bg-white hover:bg-gray-100 text-gray-700 text-[12px] font-bold border border-gray-400 cursor-pointer rounded-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                &lt;&lt; Previous
              </button>
              <button
                type="button"
                onClick={() => {
                  if (activeIndex < questions.length - 1) selectQuestion(activeIndex + 1);
                }}
                disabled={activeIndex === questions.length - 1}
                className="px-5 py-2 bg-[#4caf50] hover:bg-[#43a047] text-white text-[12px] font-bold border border-[#43a047] cursor-pointer rounded-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Save & Next &gt;&gt;
              </button>
            </div>
          </div>
        </div>

        {/* Divider / Resizer bar */}
        {!isMobile && (
          <div
            onMouseDown={startResizing}
            onTouchStart={startResizingTouch}
            className="hidden lg:flex w-[8px] cursor-col-resize self-stretch relative select-none items-center justify-center z-30 group"
            style={{ touchAction: 'none' }}
            title="Drag to resize panels"
          >
            <div className="w-[1.5px] h-full bg-gray-200 group-hover:bg-blue-500 transition-colors duration-150"></div>
          </div>
        )}

        {/* RIGHT: Question Palette */}
        {!isMobile && (
          <div
            className="w-[280px] shrink-0 bg-white flex flex-col"
            style={{ width: `${paletteWidth}px` }}
          >
          {/* Palette Header */}
          <div className="bg-[#e8e8e8] border-b border-gray-400 px-4 py-2">
            <span className="text-[13px] font-bold uppercase">Navigate To Any Question</span>
          </div>

          {/* Question Grid */}
          <div className="flex-grow overflow-y-auto p-4">
            <div className="flex flex-wrap gap-1">
              {questions.map((q, idx) => {
                let bgColor = 'bg-gray-400'; // Not visited
                let textColor = 'text-white';
                if (markedReview.has(q.id)) {
                  bgColor = 'bg-purple-600';
                } else if (answers.has(q.id)) {
                  bgColor = 'bg-green-600';
                } else if (visited.has(q.id)) {
                  bgColor = 'bg-red-500';
                }

                const isActive = activeIndex === idx;

                return (
                  <div
                    key={idx}
                    onClick={() => selectQuestion(idx)}
                    className={`w-[36px] h-[36px] rounded text-[12px] font-bold flex items-center justify-center cursor-pointer ${bgColor} ${textColor} transition ${
                      isActive ? 'ring-2 ring-black ring-offset-1 scale-105' : 'hover:opacity-80'
                    }`}
                  >
                    {idx + 1}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="border-t border-gray-300 p-4 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-[20px] h-[20px] rounded bg-green-600 inline-block"></span>
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-[20px] h-[20px] rounded bg-red-500 inline-block"></span>
                <span>Not Answered ({notAnsweredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-[20px] h-[20px] rounded bg-gray-400 inline-block"></span>
                <span>Not Visited ({notVisitedCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-[20px] h-[20px] rounded bg-purple-600 inline-block"></span>
                <span>Review ({reviewCount})</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="border-t border-gray-300 p-4">
            <button
              type="button"
              onClick={() => submitExam()}
              className="w-full py-3 bg-[#1565c0] hover:bg-[#0d47a1] text-white text-[13px] font-bold border-none cursor-pointer rounded-sm uppercase tracking-wider"
            >
              Submit Exam
            </button>
          </div>
        </div>
        )}
      </div>

      {/* Mobile Palette Floating Button */}
      {isMobile && (
        <button
          onClick={() => setShowPaletteDrawer(true)}
          className="fixed bottom-20 right-4 z-40 bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5 py-3 shadow-xl flex items-center justify-center border border-blue-400 focus:outline-none transition duration-150 active:scale-95 cursor-pointer"
        >
          <span className="text-[13px] font-bold flex items-center gap-1.5">
            📋 View Palette ({answeredCount}/{questions.length})
          </span>
        </button>
      )}

      {/* Mobile Drawer Overlay */}
      {isMobile && showPaletteDrawer && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 flex justify-end"
          onClick={() => setShowPaletteDrawer(false)}
        >
          <div
            className="h-full w-[80vw] max-w-[320px] bg-white shadow-2xl flex flex-col z-50 animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header with Close Button */}
            <div className="bg-[#e8e8e8] border-b border-gray-400 px-4 py-3 flex justify-between items-center">
               <span className="text-[13px] font-bold uppercase">Question Palette</span>
               <button
                 onClick={() => setShowPaletteDrawer(false)}
                 className="text-black font-bold text-lg p-1 hover:text-red-600 focus:outline-none cursor-pointer"
               >
                 ✕
               </button>
            </div>

            {/* Question Grid */}
            <div className="flex-grow overflow-y-auto p-4">
              <div className="flex flex-wrap gap-1">
                {questions.map((q, idx) => {
                  let bgColor = 'bg-gray-400'; // Not visited
                  let textColor = 'text-white';
                  if (markedReview.has(q.id)) {
                    bgColor = 'bg-purple-600';
                  } else if (answers.has(q.id)) {
                    bgColor = 'bg-green-600';
                  } else if (visited.has(q.id)) {
                    bgColor = 'bg-red-500';
                  }

                  const isActive = activeIndex === idx;

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        selectQuestion(idx);
                        setShowPaletteDrawer(false);
                      }}
                      className={`w-[36px] h-[36px] rounded text-[12px] font-bold flex items-center justify-center cursor-pointer ${bgColor} ${textColor} transition ${
                        isActive ? 'ring-2 ring-black ring-offset-1 scale-105' : 'hover:opacity-80'
                      }`}
                    >
                      {idx + 1}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="border-t border-gray-300 p-4 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-[20px] h-[20px] rounded bg-green-600 inline-block"></span>
                   <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-[20px] h-[20px] rounded bg-red-500 inline-block"></span>
                  <span>Not Answered ({notAnsweredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-[20px] h-[20px] rounded bg-gray-400 inline-block"></span>
                  <span>Not Visited ({notVisitedCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-[20px] h-[20px] rounded bg-purple-600 inline-block"></span>
                  <span>Review ({reviewCount})</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t border-gray-300 p-4">
              <button
                type="button"
                onClick={() => {
                  setShowPaletteDrawer(false);
                  submitExam();
                }}
                className="w-full py-3 bg-[#1565c0] hover:bg-[#0d47a1] text-white text-[13px] font-bold border-none cursor-pointer rounded-sm uppercase tracking-wider"
              >
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== SUCCESS MODAL ===== */}
      {successModal && (
        <div style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.7)', zIndex: 10000, justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#ffffff', border: '2px solid black', width: '90%', maxWidth: '450px', padding: '40px 30px', textAlign: 'center', fontFamily: 'Verdana, sans-serif' }} className="text-black">
            <div style={{ width: '72px', height: '72px', background: 'lightgreen', border: '1px solid black', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '12px' }}>Exam Submitted!</h2>
            <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '28px' }}>Your responses have been successfully recorded. Thank you for taking the examination.</p>
            <button onClick={logout} style={{ background: 'lightgray', color: 'black', border: '1.5px solid black', padding: '12px 30px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', width: '100%', outline: 'none' }}>
              Close and Exit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizPortal;
