import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

function SubmitConfirmation() {
  const [searchParams] = useSearchParams();
  const userID = searchParams.get('user');
  const [candidate, setCandidate] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState(new Map()); // id -> { option, value }
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const adminToken = localStorage.getItem('admintoken');
    if (!adminToken) {
      navigate('/admin');
      return;
    }

    if (!userID) {
      setError('User ID parameter missing');
      return;
    }

    // Fetch candidate details
    fetch('/user/userDatatoAdmin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth_token': adminToken,
      },
      body: JSON.stringify({ id: userID }),
    })
      .then((res) => res.json())
      .then((body) => {
        if (body.status === 0) {
          setCandidate(body.data);
          
          // Preload answers
          const userAnsMap = new Map();
          if (body.data.answer) {
            body.data.answer.forEach(ans => {
              userAnsMap.set(ans.key, { option: Number(ans.option), value: ans.value });
            });
            setAnswers(userAnsMap);
          }

          // Fetch questions bank
          fetch('/question/sendAdminquestion', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'auth_token': adminToken,
            },
            body: JSON.stringify({
              stream: body.data.stream,
              program: body.data.program || 'MTech',
            }),
          })
            .then((r) => r.json())
            .then((res) => {
              if (res.status === 0) {
                setQuestions(res.data);
              }
            });
        } else {
          localStorage.removeItem('admintoken');
          navigate('/admin');
        }
      })
      .catch(() => setError('Error loading candidate records'));
  }, [userID, navigate]);

  useEffect(() => {
    // MathJax Typesetting
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
  }, [questions]);

  const handleDownload = () => {
    const adminToken = localStorage.getItem('admintoken');
    setDownloading(true);

    fetch(`/admin/result/downloadResponse/${userID}`, {
      method: 'GET',
      headers: {
        'auth_token': adminToken,
      },
    })
      .then((res) => {
        if (res.status === 200) return res.blob();
        throw new Error('Server calculation failed');
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `response_${userID}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setDownloading(false);
      })
      .catch((err) => {
        alert('Error downloading file: ' + err.message);
        setDownloading(false);
      });
  };

  const arrayBufferToBase64 = (buffer) => {
    var binary = '';
    var bytes = [].slice.call(new Uint8Array(buffer));
    bytes.forEach((b) => binary += String.fromCharCode(b));
    return window.btoa(binary);
  };

  if (error) return <div className="text-center p-12 text-red-400">{error}</div>;
  if (!candidate || questions.length === 0) return <div className="text-center p-12 text-slate-400">Loading response sheets...</div>;

  return (
    <div className="font-sans bg-slate-950 text-slate-200 p-6 md:p-12 max-w-4xl mx-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 min-h-screen">
      <div className="flex flex-col items-center justify-center mb-8 border-b border-slate-800 pb-6">
        <img className="h-16 w-auto object-contain filter drop-shadow-lg mb-4" src="/public/assets/Indian_Institute_of_Information_Technology,_Bhagalpur_logo.png" alt="IIIT Bhagalpur" />
        <h2 className="text-base font-bold text-white text-center">Indian Institute of Information Technology Bhagalpur</h2>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Response Submission Confirmed</p>
      </div>

      <div className="mb-8 p-6 bg-green-950/40 border border-green-900/60 rounded-2xl text-center shadow-lg backdrop-blur-md">
        <div className="w-12 h-12 rounded-full bg-green-600/10 border border-green-600/20 flex items-center justify-center mx-auto mb-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Submission Confirmed</h3>
        <p className="text-sm text-slate-300">Your exam responses have been successfully submitted and locked in the server.</p>
      </div>

      <div className="flex justify-center mb-8 gap-4">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="px-6 py-3 bg-white text-slate-950 hover:bg-slate-100 active:scale-95 text-sm font-semibold rounded-lg tracking-wide shadow-lg shadow-black/20 cursor-pointer transition duration-150 disabled:opacity-50"
        >
          {downloading ? 'Generating...' : 'Download Excel Response'}
        </button>
        <button
          onClick={() => navigate('/participants')}
          className="px-6 py-3 bg-slate-900 hover:bg-slate-850 text-white border border-slate-800 text-sm font-semibold rounded-lg tracking-wide shadow-lg cursor-pointer transition duration-150"
        >
          Back to List
        </button>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 mb-8 backdrop-blur-xl shadow-xl">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Candidate Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-350">
          <p><strong className="text-slate-400 font-medium">Application No:</strong> <span className="text-white font-semibold ml-1">{candidate.applicationNo}</span></p>
          <p><strong className="text-slate-400 font-medium">Name:</strong> <span className="text-white font-semibold ml-1">{candidate.name}</span></p>
          <p><strong className="text-slate-400 font-medium">Category:</strong> <span className="text-white font-semibold ml-1">{candidate.program}</span></p>
          <p><strong className="text-slate-400 font-medium">Stream:</strong> <span className="text-white font-semibold ml-1">{candidate.stream}</span></p>
          <p><strong className="text-slate-400 font-medium">Marks Obtained:</strong> <span className="text-white font-bold ml-1 bg-green-500/10 px-2 py-0.5 border border-green-500/20 rounded-md">{candidate.marks !== undefined ? candidate.marks : 0}</span></p>
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => {
          const userAns = answers.get(q.id);
          const hasAnswered = !!userAns;
          return (
            <div key={idx} className="mcq bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl space-y-4">
              <h1 className="text-base font-bold text-white leading-relaxed"><span className="text-slate-400 mr-1">{idx + 1}.</span> {q.question}</h1>
              
              {q.image && q.image.contentType && (
                <img
                  src={`data:image/${q.image.contentType};base64,${arrayBufferToBase64(q.image.data.data)}`}
                  alt="question attachment"
                  className="max-w-xs max-h-60 object-contain mt-3 rounded-lg border border-slate-800 shadow-lg"
                />
              )}

              <ul className="mcq-options-list space-y-3 mt-4 mb-6">
                {q.choice.map((choiceText, cIdx) => {
                  const letter = String.fromCharCode(65 + cIdx);
                  const isSelected = userAns && userAns.option === cIdx;
                  return (
                    <li
                      key={cIdx}
                      className={isSelected ? 'selectedOption' : ''}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mr-2 shrink-0 ${
                        isSelected
                          ? 'bg-green-950/40 border border-green-900/60 text-green-300'
                          : 'bg-slate-900 border border-slate-800 text-slate-500'
                      }`}>
                        {letter}
                      </span>
                      <span className="flex-grow">{choiceText}</span>
                    </li>
                  );
                })}
              </ul>
              
              <div className="mt-4 p-4 bg-slate-950/60 border border-slate-900/80 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs md:text-sm font-semibold">
                <div className="text-green-400 flex items-center gap-1.5"><span className="text-slate-500 font-normal">Correct Option: </span> {q.answer}</div>
                {hasAnswered ? (
                  <>
                    <p className="text-slate-350 font-medium">Your Answer: {String.fromCharCode(userAns.option + 65)}. {userAns.value}</p>
                    <p className="text-green-400 font-bold tracking-wider uppercase text-xs">Answered</p>
                  </>
                ) : (
                  <>
                    <p className="text-slate-500 font-medium">Your Answer: -</p>
                    <p className="text-red-400 font-bold tracking-wider uppercase text-xs">Not Answered</p>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SubmitConfirmation;
