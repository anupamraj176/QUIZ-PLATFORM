import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

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
        toast.error('Error downloading file: ' + err.message);
        setDownloading(false);
      });
  };

  const arrayBufferToBase64 = (buffer) => {
    var binary = '';
    var bytes = [].slice.call(new Uint8Array(buffer));
    bytes.forEach((b) => binary += String.fromCharCode(b));
    return window.btoa(binary);
  };

  if (error) return <div className="min-h-screen bg-white text-center p-12 text-red-650 font-bold">{error}</div>;
  if (!candidate || questions.length === 0) return <div className="min-h-screen bg-white text-center p-12 text-gray-500">Loading response sheets...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col pb-10">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 py-4 px-4 md:px-8 flex flex-col sm:flex-row justify-between items-center sticky top-0 z-50 shadow-sm shrink-0 gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 text-center sm:text-left">Candidate Response Sheet — {candidate.name}</h1>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="border border-gray-300 px-4 py-2 rounded bg-black hover:bg-gray-900 text-white text-sm md:text-base font-semibold transition cursor-pointer disabled:opacity-50"
          >
            {downloading ? 'Downloading...' : 'Download Excel Sheet'}
          </button>
          <button
            onClick={() => navigate('/participants')}
            className="border border-gray-300 px-4 py-2 rounded bg-white text-sm md:text-base hover:bg-gray-50 text-gray-700 font-semibold transition cursor-pointer"
          >
            Back
          </button>
        </div>
      </div>

      <div className="w-[95%] max-w-5xl mx-auto mt-8 space-y-6">
        {/* Candidate Details Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-150 pb-2">Candidate Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
            <div>
              <span className="text-gray-400 block">Name</span>
              <span className="font-semibold text-gray-800 text-base">{candidate.name}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Application No</span>
              <span className="font-semibold text-gray-800 text-base">{candidate.applicationNo}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Category</span>
              <span className="font-semibold text-gray-800 text-base">{candidate.program}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Department / Stream</span>
              <span className="font-semibold text-gray-800 text-base">{candidate.stream}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Marks Obtained</span>
              <span className="font-bold text-green-700 text-lg">{candidate.marks !== undefined ? candidate.marks : 0}</span>
            </div>
          </div>
        </div>

        {/* Questions Review List */}
        <div className="space-y-6">
          {questions.map((q, idx) => {
            const userAns = answers.get(q.id);
            const hasAnswered = !!userAns;
            return (
              <div key={q.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-gray-800 leading-snug">
                  {idx + 1}. {q.question}
                </h3>

                {q.image && q.image.contentType && (
                  <div className="my-2 max-w-full">
                    <img
                      src={`data:image/${q.image.contentType};base64,${arrayBufferToBase64(q.image.data.data)}`}
                      alt="attachment"
                      className="max-h-40 object-contain border border-gray-200"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2 my-4">
                  {q.choice.map((choiceText, cIdx) => {
                    const letter = String.fromCharCode(65 + cIdx);
                    const isSelected = userAns && userAns.option === cIdx;
                    return (
                      <div
                        key={cIdx}
                        className={`p-2.5 px-4 rounded-md text-sm border transition ${
                          isSelected
                            ? "bg-blue-50 border-blue-200 text-blue-800 font-medium"
                            : "bg-[#fafbfc] border-gray-100 text-gray-700"
                        }`}
                      >
                        <span className="font-semibold mr-2">{letter}.</span>
                        {choiceText}
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-100 items-center justify-between">
                  <div className="flex gap-3">
                    <div className="bg-[#e6f4ea] text-[#137333] px-3 py-1 rounded text-sm font-bold">
                      Correct Answer : {q.answer === "option1" ? q.choice[0] : q.answer === "option2" ? q.choice[1] : q.answer === "option3" ? q.choice[2] : q.choice[3]}
                    </div>
                    {hasAnswered ? (
                      <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded text-sm font-bold">
                        Candidate Answer : {String.fromCharCode(userAns.option + 65)} ({userAns.value})
                      </div>
                    ) : (
                      <div className="bg-red-50 text-red-700 px-3 py-1 rounded text-sm font-bold">
                        Candidate Answer : Not Answered
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SubmitConfirmation;
