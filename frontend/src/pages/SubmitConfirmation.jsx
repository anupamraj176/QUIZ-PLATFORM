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
    <div className="min-h-screen bg-white text-black py-8 font-sans max-w-[60%] mx-auto">
      {/* Logo and Header */}
      <div className="w-[150px] h-[150px] mx-auto mt-4 mb-2 flex items-center justify-center">
        <img
          src="/public/assets/Indian_Institute_of_Information_Technology,_Bhagalpur_logo.png"
          alt="IIIT Bhagalpur Logo"
          className="max-w-full max-h-full"
        />
      </div>
      <h1 className="text-center text-[18px] font-bold mb-6">
        Indian Institute of Information Technology Bhagalpur
      </h1>

      {/* Candidate Information Box */}
      <div className="userDetailshow bg-[#dbd7d7] p-[10px] mb-6">
        <h2 className="text-[18px] font-bold mb-2">Candidate Details:</h2>
        <p className="text-[16px] my-1"><b>Name:</b> {candidate.name}</p>
        <p className="text-[16px] my-1"><b>Application No:</b> {candidate.applicationNo}</p>
        <p className="text-[16px] my-1"><b>Category:</b> {candidate.program}</p>
        <p className="text-[16px] my-1"><b>Stream:</b> {candidate.stream}</p>
        <p className="text-[16px] my-1"><b>Marks Obtained:</b> {candidate.marks !== undefined ? candidate.marks : 0}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="px-[20px] py-[8px] bg-gray-200 hover:bg-gray-300 border border-black cursor-pointer text-[16px] font-medium disabled:opacity-50"
        >
          {downloading ? "Generating..." : "Download Excel Response"}
        </button>
        <button
          onClick={() => navigate("/participants")}
          className="px-[20px] py-[8px] bg-gray-200 hover:bg-gray-300 border border-black cursor-pointer text-[16px] font-medium"
        >
          Back to List
        </button>
      </div>

      {/* Questions Review List */}
      <div className="space-y-8">
        {questions.map((q, idx) => {
          const userAns = answers.get(q.id);
          const hasAnswered = !!userAns;
          return (
            <div key={idx} className="mcq border-b-2 border-black pb-6">
              <h1 className="text-[18px] font-normal leading-snug mb-3">
                <span className="font-bold mr-1">{idx + 1}.</span>
                {q.question}
              </h1>

              {q.image && q.image.contentType && (
                <div className="my-3 max-w-full">
                  <img
                    src={`data:image/${q.image.contentType};base64,${arrayBufferToBase64(q.image.data.data)}`}
                    alt="question attachment"
                    className="max-w-full max-h-80 object-contain border border-gray-400"
                  />
                </div>
              )}

              <ul className="list-none p-0 my-4 space-y-1">
                {q.choice.map((choiceText, cIdx) => {
                  const letter = String.fromCharCode(65 + cIdx);
                  const isSelected = userAns && userAns.option === cIdx;
                  return (
                    <li
                      key={cIdx}
                      className={`text-[16px] py-1 px-2 ${
                        isSelected ? "bg-green-100 font-bold" : ""
                      }`}
                    >
                      <span>{letter}. </span>
                      {choiceText}
                    </li>
                  );
                })}
              </ul>

              {/* Status Box */}
              <div className="answerDelete bg-[#dbd7d7] p-[10px] text-[16px] space-y-1">
                <p><b>Correct Option:</b> {q.answer}</p>
                {hasAnswered ? (
                  <p>
                    <b>Candidate's Answer:</b> Option {String.fromCharCode(userAns.option + 65)} ({userAns.value})
                  </p>
                ) : (
                  <p className="text-red-700 font-semibold"><b>Candidate's Answer:</b> Not Answered</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <h1 className="text-center text-[18px] font-bold mt-12 mb-6">
        Indian Institute of Information Technology Bhagalpur
      </h1>
    </div>
  );
}

export default SubmitConfirmation;
