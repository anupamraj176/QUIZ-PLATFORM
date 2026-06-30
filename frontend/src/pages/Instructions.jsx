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

  if (!candidate) return <div className="min-h-screen bg-white text-center p-12 text-gray-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-white text-black py-4 font-sans flex flex-col items-center">
      <div className="w-[100px] h-[100px] mx-auto p-[10px] flex items-center justify-center">
        <img
          src="/public/assets/Indian_Institute_of_Information_Technology,_Bhagalpur_logo.png"
          alt="IIIT Bhagalpur Logo"
          className="max-w-full max-h-full"
        />
      </div>
      <div className="w-fit mx-auto text-center mb-6">
        <h3 className="text-[20px] font-normal">Indian Institute of Information Technology Bhagalpur</h3>
      </div>
      <div className="w-[70%] flex flex-col items-center">
        <div className="text-center text-[18px] text-gray-500 mb-4" id="timer">
          Time Remaining
          <span className="text-[22px] text-black font-bold ml-3 font-mono">{timeLeft}</span>
        </div>
        <h1 className="text-[28px] font-bold my-4">Instruction</h1>
        <ol className="list-decimal text-[20px] space-y-2 mb-8 leading-relaxed text-justify">
          {candidate.program === 'Teaching' ? (
            <>
              <li>Candidates should carry with them the Identity Card to the Examination Centre for establishing their identity, failing which they will not be allowed to enter the Examination Hall.</li>
              <li>There will be 100 objective type questions. Question No.-01 to 30 will be general aptitude and Question No.-31 to 100 will be Departmental Core Subjects.</li>
              <li>Only one question will be displayed on the Exam Window at a time.</li>
              <li>Countdown clock will start as per schedule of the examination and the same will be displayed on the top right-hand corner of the Exam Window for the remaining time available to a candidate for the Examination.</li>
              <li>Duration of the test will be of 120 minutes (From 10:00 AM to 12:00 PM).</li>
              <li>Each question is followed by four alternative answer marked as A, B, C and D. The candidate shall choose the most appropriate answer to each question and mark the same through <b>click of mouse</b> against the appropriate answer.</li>
              <li>To attempt next question, Click on <b>next</b> button.</li>
              <li>To attempt previous question, Click on <b>previous</b> button.</li>
              <li>Candidates can make changes in their answer already chosen/marked by simply clicking then other answer option of their choice at any time before end of examination or before clicking “SUBMIT” Button.</li>
              <li><b>After click on Submit button, a confirmation will be taken from candidate and Candidate have to click "Yes" button</b></li>
              <li>In case of restarting /shut down of computer due to technical reasons, immediately report the same to the Invigilator on duty.</li>
              <li>If you have done login before 10:00 AM, you will not be able to start the test. At 10:00 AM you will be able to start the test by clicking the “NEXT” button.</li>
              <li>Do not close the Exam Window or try to restart the system at the Examination Centre.</li>
              <li>A Rough Sheet will be provided to the candidates for carrying out rough work, calculations, etc. during the examination. Candidates are required to mention their Application No. and Name on the Rough Sheet.</li>
              <li>Rough Sheet needs to be returned to the Invigilator before leaving the Exam Hall. The candidate shall not be permitted to carry the rough sheets used/unused with them when they leave the Examination Hall.</li>
              <li>You are required to comply with the directions given by the invigilators.</li>
            </>
          ) : (
            <>
              <li>Candidates should carry with them the Identity Card to the Examination Centre for establishing their identity, failing which they will not be allowed to enter the Examination Hall.</li>
              <li>All the questions are objective type and only one answer is correct. There is no negative marking for wrong answer.</li>
              <li>There will be 100 objective type questions.</li>
              <li>Only one question will be displayed on the Exam Window at a time.</li>
              <li>Countdown clock will start as per schedule of the examination and the same will be displayed on the top right-hand corner of the Exam Window for the remaining time available to a candidate for the Examination</li>
              <li>Duration of the test will be of 120 minutes (From 10:00 AM to 12:00 PM).</li>
              <li>Each question is followed by four alternative answer marked as A, B, C and D. The candidate shall choose the most appropriate answer to each question and mark the same through <b>click of mouse</b> against the appropriate answer.</li>
              <li>To attempt next question, Click on <b>next</b> button.</li>
              <li>To attempt previous question, Click on <b>previous</b> button.</li>
              <li>Candidates can make changes in their answer already chosen/marked by simply clicking then other answer option of their choice at any time before end of examination or before clicking “SUBMIT” Button.</li>
              <li><b>After click on Submit button, a confirmation will be taken from candidate and Candidate have to click "Yes" button</b></li>
              <li>In case of restarting /shut down of computer due to technical reasons, immediately report the same to the Invigilator on duty.</li>
              <li>If you have done login before 10:00 AM, you will not be able to start the test. At 10:00 AM you will be able to start the test by clicking the “NEXT” button.</li>
              <li>Do not close the Exam Window or try to restart the system at the Examination Centre.</li>
              <li>A Rough Sheet will be provided to the candidates for carrying out rough work, calculations, etc. during the examination. Candidates are required to mention their Application No. and Name on the Rough Sheet.</li>
              <li>Rough Sheet needs to be returned to the Invigilator before leaving the Exam Hall. The candidate shall not be permitted to carry the rough sheets used/unused with them when they leave the Examination Hall.</li>
              <li>You are required to comply with the directions given by the invigilators.</li>
            </>
          )}
        </ol>
        <button
          type="button"
          id="nextbutton"
          onClick={handleNext}
          disabled={!buttonActive}
          className={`px-[20px] py-[8px] text-[20px] border border-black cursor-pointer font-medium mb-12 ${
            buttonActive ? 'bg-gray-450 text-black hover:bg-gray-300' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}

export default Instructions;
