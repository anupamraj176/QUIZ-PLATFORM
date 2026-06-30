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
    <div className="min-h-screen bg-white text-black font-sans pb-10">
      {/* Top Header */}
      <div className="w-[95%] mx-auto mt-[15px] mb-[50px] pb-[3px] border-b-[3px] border-black flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="detail">
          <h1 className="text-[27px] font-bold m-0 p-0">Name: {candidate.name}</h1>
          <div className="flex flex-wrap text-[20px] font-normal mt-1 text-gray-800">
            <h4 className="mr-[15px]">Application No: {candidate.applicationNo},</h4>
            <h4 className="mr-[15px]">Program: {candidate.program},</h4>
            <h4>Department: {candidate.stream}</h4>
          </div>
        </div>
        <div className="timer text-right text-[18px] text-gray-500">
          Time left to finish
          <div id="timer" className="inline-block">
            <span className="text-[22px] text-black font-bold ml-3 font-mono">{timeLeft}</span>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="main flex flex-col lg:flex-row w-[95%] mx-auto gap-8">
        {/* Left MCQ Panel */}
        <div className="quiz w-full lg:w-[70%] mb-10" ref={mathRef}>
          <div className="mcq w-[90%] md:w-[80%] mx-auto">
            <h1 className="text-[24px] font-normal leading-snug mb-2">
              <span className="font-bold text-[22px] mr-1">{activeIndex + 1}.</span>
              {currentQues.question}
            </h1>

            {currentQues.image && currentQues.image.contentType && (
              <div className="my-3">
                <img
                  src={`data:image/${currentQues.image.contentType};base64,${arrayBufferToBase64(currentQues.image.data.data)}`}
                  alt="question attachment"
                  className="max-w-full max-h-80 object-contain border border-gray-400"
                />
              </div>
            )}

            <h3 className="border-t-2 border-black mt-[15px] pt-2 text-[18px] font-normal">Choose option below</h3>
            
            <ul className="list-none m-0 p-0 pt-[10px] pl-[5px] space-y-1">
              {currentQues.choice.map((choiceText, cIdx) => {
                const letter = String.fromCharCode(65 + cIdx);
                const isSelected = choiceMap && choiceMap.option === cIdx;
                return (
                  <li
                    key={cIdx}
                    id={`${currentQues.id}_option${cIdx}`}
                    onClick={() => setChoice(currentQues.id, cIdx, choiceText)}
                    className={`text-[20px] p-[10px] pl-[15px] border-b border-gray-100 cursor-pointer select-none transition duration-150 ${
                      isSelected
                        ? "bg-[#4091d7] text-white hover:bg-[#4091d7]"
                        : "bg-white text-black hover:bg-[#90bc85]"
                    }`}
                  >
                    <span>{letter}. </span>
                    {choiceText}
                  </li>
                );
              })}
            </ul>

            <span
              className="clearvalues text-[16px] underline cursor-pointer text-blue-600 inline-block mt-4 select-none"
              onClick={() => clearChoice(currentQues.id)}
            >
              Clear all
            </span>

            {/* Navigation Buttons */}
            <div className="differentquestion mt-[30px] flex justify-between items-center">
              <button
                type="button"
                className="px-[20px] py-[8px] bg-gray-200 hover:bg-gray-300 border border-black cursor-pointer text-[16px] font-medium disabled:opacity-50 disabled:cursor-not-allowed select-none"
                onClick={() => activeIndex > 0 && selectQuestion(activeIndex - 1)}
                disabled={activeIndex === 0}
              >
                Previous
              </button>

              <button
                type="button"
                className="px-[20px] py-[8px] bg-gray-200 hover:bg-gray-300 border border-black cursor-pointer text-[16px] font-medium select-none"
                onClick={() => toggleMarkReview(currentQues.id)}
              >
                {markedReview.has(currentQues.id) ? "Mark as Unreview" : "Mark as Review"}
              </button>

              <button
                type="button"
                className="px-[20px] py-[8px] bg-gray-200 hover:bg-gray-300 border border-black cursor-pointer text-[16px] font-medium disabled:opacity-50 disabled:cursor-not-allowed select-none"
                onClick={() => activeIndex < questions.length - 1 && selectQuestion(activeIndex + 1)}
                disabled={activeIndex === questions.length - 1}
              >
                Next
              </button>
            </div>

            {/* Submit Button on the last question */}
            {activeIndex === questions.length - 1 && (
              <div className="submitbutton text-center mt-6">
                <button
                  type="button"
                  className="px-[30px] py-[10px] bg-blue-600 hover:bg-blue-700 text-white border border-black cursor-pointer font-bold text-[16px] select-none"
                  onClick={() => submitExam()}
                >
                  Submit
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Nav */}
        <div className="question w-full lg:w-[30%]">
          <h1 className="text-[20px] font-normal ml-[10px] mb-3">Navigate to any question</h1>
          
          <div className="questionShow flex flex-wrap border-2 border-black p-[10px] rounded-[5px] min-h-[120px] bg-white">
            {questions.map((q, idx) => {
              let cellColor = "bg-gray-500"; // unvisited
              if (markedReview.has(q.id)) {
                cellColor = "bg-purple-600";
              } else if (answers.has(q.id)) {
                cellColor = "bg-green-600";
              } else if (visited.has(q.id)) {
                cellColor = "bg-red-600";
              }

              const isActive = activeIndex === idx;

              return (
                <div
                  key={idx}
                  onClick={() => selectQuestion(idx)}
                  className={`w-[25px] h-[25px] rounded-full text-[16px] font-semibold m-[5px] text-white flex items-center justify-center cursor-pointer hover:bg-black hover:text-white select-none ${cellColor} ${
                    isActive ? "ring-2 ring-black ring-offset-2 scale-110" : ""
                  }`}
                >
                  {idx + 1}
                </div>
              );
            })}
          </div>

          {/* Status Legend */}
          <div className="mt-8 pl-[10px]">
            <div className="showinfo flex items-center justify-start text-[16px] my-1">
              <div className="w-[30px] h-[30px] bg-purple-600 border border-black rounded-full m-[5px]"></div>
              <p className="ml-2 select-none">Mark as review</p>
            </div>
            
            <div className="showinfo flex items-center justify-start text-[16px] my-1">
              <div className="w-[30px] h-[30px] bg-red-600 border border-black rounded-full m-[5px]"></div>
              <p className="ml-2 select-none">Not answered</p>
            </div>
            
            <div className="showinfo flex items-center justify-start text-[16px] my-1">
              <div className="w-[30px] h-[30px] bg-green-600 border border-black rounded-full m-[5px]"></div>
              <p className="ml-2 select-none">Answered</p>
            </div>
            
            <div className="showinfo flex items-center justify-start text-[16px] my-1">
              <div className="w-[30px] h-[30px] bg-gray-500 border border-black rounded-full m-[5px]"></div>
              <p className="ml-2 select-none">Not Visited</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
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
