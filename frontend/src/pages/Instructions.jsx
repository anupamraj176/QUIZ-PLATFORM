import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Instructions() {
  const [candidate, setCandidate] = useState(null);
  const [timing, setTiming] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [buttonActive, setButtonActive] = useState(false);
  const [buttonText, setButtonText] = useState('Next');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    // Access candidate profile details
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
          if (!body.data.stream || body.data.stream.length === 0) {
            navigate('/data');
          } else {
            setCandidate(body.data);
          }
        } else {
          localStorage.removeItem('token');
          navigate('/');
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/');
      });

    // Check timings and countdown
    let timerId;
    const fetchTimings = () => {
      fetch('/time/timing')
        .then((res) => res.json())
        .then((res) => {
          setTiming(res);
          const compareDate = new Date(res.EDate);
          const startDate = new Date(res.SDate);
          const presentDate = new Date(res.presentDate);

          if (presentDate >= compareDate) {
            setButtonActive(false);
            setButtonText('Exam Ended');
            setTimeLeft('The exam has already ended.');
          } else if (presentDate >= startDate) {
            setButtonActive(true);
            setButtonText('Start Exam');
            setTimeLeft('The exam has started.');
          } else {
            setButtonActive(false);
            setButtonText('Next');
            
            // Calculate time left in seconds
            const diff = startDate.getTime() - presentDate.getTime();
            if (diff > 0) {
              const seconds = Math.floor(diff / 1000);
              const minutes = Math.floor(seconds / 60);
              const hours = Math.floor(minutes / 60);
              const days = Math.floor(hours / 24);

              const displayHours = hours + (days * 24);
              const displayMinutes = minutes % 60;
              const displaySeconds = seconds % 60;

              setTimeLeft(`${displayHours}h ${displayMinutes}m ${displaySeconds}s remaining`);
            }
          }
        })
        .catch(console.error);
    };

    fetchTimings();
    timerId = setInterval(fetchTimings, 1000);

    return () => clearInterval(timerId);
  }, [navigate]);

  const handleNext = () => {
    if (buttonActive) {
      navigate('/quiz');
    }
  };

  if (!candidate) return <div className="text-center p-12 text-slate-400">Loading...</div>;

  return (
    <div className="font-sans bg-slate-950 text-slate-200 min-h-screen flex flex-col items-center justify-start p-6 md:p-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900">
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between border-b border-slate-800 pb-6 mb-8 gap-4">
        <div className="flex items-center gap-4">
          <img src="/public/assets/Indian_Institute_of_Information_Technology,_Bhagalpur_logo.png" alt="IIIT Bhagalpur" className="h-16 w-auto object-contain" />
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">Indian Institute of Information Technology Bhagalpur</h3>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Examination Instruction Board</p>
          </div>
        </div>
        <div className="timer bg-slate-900/60 border border-slate-800 rounded-xl px-5 py-3 text-center min-w-[160px] backdrop-blur-md">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Time Remaining</div>
          <div className="text-white font-bold text-sm tracking-wider font-mono">{timeLeft}</div>
        </div>
      </div>

      <div className="w-full max-w-4xl bg-slate-900/40 border border-slate-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
        <h1 className="text-xl font-bold text-white border-b border-slate-800 pb-4 mb-6 uppercase tracking-wide">Instructions</h1>
        <ol className="space-y-4 text-sm text-slate-300 list-decimal pl-5 leading-relaxed">
          <li>Candidates should carry with them the Identity Card to the Examination Centre for establishing their identity, failing which they will not be allowed to enter the Examination Hall.</li>
          <li>All the questions are objective type and only one answer is correct. There is no negative marking for wrong answer.</li>
          <li>Only one question will be displayed on the Exam Window at a time.</li>
          <li>Countdown clock will start as per schedule of the examination and the same will be displayed on the top right-hand corner of the Exam Window for the remaining time available to a candidate for the Examination.</li>
          <li>Duration of the test will be of 120 minutes.</li>
          <li>Each question is followed by four alternative answers marked as A, B, C, and D. The candidate shall choose the most appropriate answer to each question and mark the same through <strong>click of mouse</strong> against the appropriate answer.</li>
          <li>To attempt next question, Click on <strong>next</strong> button.</li>
          <li>To attempt previous question, Click on <strong>previous</strong> button.</li>
          <li>Candidates can make changes in their answer already chosen/marked by simply clicking another answer option of their choice at any time before the end of examination or before clicking the "SUBMIT" Button.</li>
          <li><strong>After clicking on the Submit button, a confirmation will be taken from candidate and the candidate has to click the "Yes" button.</strong></li>
          <li>In case of restarting/shutdown of computer due to technical reasons, immediately report the same to the Invigilator on duty.</li>
          <li>Do not close the Exam Window or try to restart the system at the Examination Centre.</li>
          <li>A Rough Sheet will be provided to the candidates for carrying out rough work, calculations, etc. during the examination. Candidates are required to mention their Application No. and Name on the Rough Sheet.</li>
          <li>Rough Sheet needs to be returned to the Invigilator before leaving the Exam Hall. The candidate shall not be permitted to carry the rough sheets used/unused with them when they leave the Examination Hall.</li>
          <li>You are required to comply with the directions given by the invigilators.</li>
        </ol>
        
        <div className="flex justify-end border-t border-slate-800 mt-8 pt-6">
          <button
            type="button"
            className={`px-8 py-3.5 text-sm font-semibold rounded-lg transition-all duration-150 shadow-lg ${
              buttonActive
                ? 'bg-green-600 hover:bg-green-500 active:scale-95 text-white cursor-pointer shadow-green-900/20'
                : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
            }`}
            onClick={handleNext}
            disabled={!buttonActive}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Instructions;
