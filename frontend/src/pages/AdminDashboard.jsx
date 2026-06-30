import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [stream, setStream] = useState('Computer Science Engineering');
  const [program, setProgram] = useState('MTech');
  const [config, setConfig] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editForm, setEditForm] = useState({ question: '', choice: ['', '', '', ''], answer: '' });
  const [editImageFile, setEditImageFile] = useState(null);
  
  // Timer configs
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeMessage, setTimeMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const adminToken = localStorage.getItem('admintoken');
    if (!adminToken) {
      navigate('/admin');
      return;
    }

    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => setConfig(data));

    // Get current timers
    fetch('/time/timing')
      .then((res) => res.json())
      .then((res) => {
        // Format to datetime-local compatible string: YYYY-MM-DDTHH:MM
        const formatDate = (dStr) => {
          if (!dStr) return '';
          const d = new Date(dStr);
          const pad = (n) => String(n).padStart(2, '0');
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        };
        setStartDate(formatDate(res.SDate));
        setEndDate(formatDate(res.EDate));
      });

    loadQuestions();
  }, [stream, program, navigate]);

  useEffect(() => {
    // Render math content
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

  const loadQuestions = () => {
    const adminToken = localStorage.getItem('admintoken');
    fetch('/question/sendAdminquestion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth_token': adminToken,
      },
      body: JSON.stringify({ stream, program }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.status === 0) {
          setQuestions(res.data);
        } else {
          localStorage.removeItem('admintoken');
          navigate('/admin');
        }
      });
  };

  const handleCreateQuestion = (e) => {
    e.preventDefault();
    const adminToken = localStorage.getItem('admintoken');
    const formData = new FormData(e.target);
    formData.append('stream', stream);
    formData.append('program', program);

    fetch('/question/addquestion', {
      method: 'POST',
      headers: {
        'auth_token': adminToken,
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 0) {
          alert('Question added successfully');
          e.target.reset();
          loadQuestions();
        } else {
          alert('Error adding question');
        }
      });
  };

  const handleBulkUpload = (e) => {
    e.preventDefault();
    const adminToken = localStorage.getItem('admintoken');
    const formData = new FormData(e.target);
    formData.append('stream', stream);
    formData.append('program', program);

    fetch('/question/addbulkquestion', {
      method: 'POST',
      headers: {
        'auth_token': adminToken,
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 0) {
          alert('Bulk questions added successfully');
          e.target.reset();
          loadQuestions();
        } else {
          alert('Error performing bulk upload');
        }
      });
  };

  const handleSetTimers = (e) => {
    e.preventDefault();
    const adminToken = localStorage.getItem('admintoken');
    fetch('/time/settime', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth_token': adminToken,
      },
      body: JSON.stringify({ SDate: startDate, EDate: endDate }),
    })
      .then((res) => res.json())
      .then((body) => {
        if (body.status === 0) {
          setTimeMessage('Timers updated successfully!');
          setTimeout(() => setTimeMessage(''), 3000);
        } else {
          alert('Error setting timers');
        }
      });
  };

  const startEditing = (q) => {
    setEditingQuestionId(q.id);
    setEditForm({
      question: q.question,
      choice: [...q.choice],
      answer: q.answer,
    });
  };

  const saveEdit = (qId) => {
    const adminToken = localStorage.getItem('admintoken');
    fetch('/question/updatequestionText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth_token': adminToken,
        'id': qId,
        'stream': stream,
        'program': program,
      },
      body: JSON.stringify({
        question: editForm.question,
        choice: editForm.choice,
        answer: editForm.answer,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 0) {
          setEditingQuestionId(null);
          loadQuestions();
        } else {
          alert('Error updating question text');
        }
      });
  };

  const handleUpdateImage = (qId) => {
    if (!editImageFile) return;
    const adminToken = localStorage.getItem('admintoken');
    const formData = new FormData();
    formData.append('img', editImageFile);

    fetch('/question/updatequestionImage', {
      method: 'POST',
      headers: {
        'auth_token': adminToken,
        'id': qId,
        'stream': stream,
        'program': program,
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 0) {
          alert('Image updated successfully');
          setEditImageFile(null);
          loadQuestions();
        } else {
          alert('Error updating question image');
        }
      });
  };

  const deleteQuestion = (qId) => {
    if (!window.confirm('Delete this question permanently?')) return;
    const adminToken = localStorage.getItem('admintoken');
    fetch('/question/deletequestion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth_token': adminToken,
        'id': qId,
        'stream': stream,
        'program': program,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 0) {
          loadQuestions();
        } else {
          alert('Error deleting question');
        }
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('admintoken');
    navigate('/admin');
  };

  const arrayBufferToBase64 = (buffer) => {
    var binary = '';
    var bytes = [].slice.call(new Uint8Array(buffer));
    bytes.forEach((b) => binary += String.fromCharCode(b));
    return window.btoa(binary);
  };

  if (!config) return <div className="text-center p-12 text-slate-400">Loading Console...</div>;

  return (
    <div className="font-sans bg-slate-950 text-slate-200 min-h-screen p-6 md:p-12 max-w-7xl mx-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-center justify-between border-b border-slate-800 pb-6 mb-8 gap-4">
        <div className="flex items-center gap-4">
          <img src="/public/assets/Indian_Institute_of_Information_Technology,_Bhagalpur_logo.png" alt="IIIT Bhagalpur" className="h-16 w-auto object-contain" />
          <div>
            <h3 className="text-base md:text-lg font-bold text-white leading-tight">Indian Institute of Information Technology Bhagalpur</h3>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Admin Question Management Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/participants')}
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-xs font-semibold rounded-lg tracking-wide shadow-md transition cursor-pointer"
          >
            Participants List
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-650/10 hover:bg-red-650/20 text-red-400 border border-red-900/30 text-xs font-semibold rounded-lg tracking-wide shadow-md transition cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Control Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Filters Card */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Stream / Class Filters</h2>
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wide mb-1.5">Stream</label>
                <select
                  value={stream}
                  onChange={(e) => setStream(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                >
                  <option value={config.CSEvalue}>{config.CSEvalue}</option>
                  <option value={config.ECEvalue}>{config.ECEvalue}</option>
                  <option value={config.MEAvalue}>{config.MEAvalue}</option>
                  <option value={config.Mathvalue}>{config.Mathvalue}</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wide mb-1.5">Program</label>
                <select
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                >
                  <option value="MTech">MTech</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Timers Config Card */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Exam Schedule</h2>
            {timeMessage && (
              <div className="mb-4 p-2.5 bg-green-950/40 border border-green-900/60 rounded-lg text-green-400 text-xs font-semibold text-center">
                {timeMessage}
              </div>
            )}
            <form onSubmit={handleSetTimers} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wide mb-1.5">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wide mb-1.5">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                  required
                />
              </div>
              <button type="submit" className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-100 font-semibold rounded-lg cursor-pointer transition">
                Update Schedule
              </button>
            </form>
          </div>

          {/* Bulk Import Card */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Bulk Excel Import</h2>
            <form onSubmit={handleBulkUpload} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wide mb-1.5">Select Excel File</label>
                <input
                  type="file"
                  name="file"
                  accept=".xlsx, .xls"
                  className="w-full text-slate-350 cursor-pointer"
                  required
                />
              </div>
              <button type="submit" className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-100 font-semibold rounded-lg cursor-pointer transition">
                Upload Sheet
              </button>
            </form>
          </div>
        </div>

        {/* Right Questions Panel Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Single Question Insertion Form */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Add New Question</h2>
            <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wide mb-1.5">Question Text</label>
                <textarea
                  name="ques"
                  placeholder="Type the question content here (Latex supported via $$...$$ or $...$)"
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-200 focus:outline-none min-h-[60px]"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wide mb-1.5">Option A</label>
                  <input type="text" name="option1" className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-200 focus:outline-none" required />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wide mb-1.5">Option B</label>
                  <input type="text" name="option2" className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-200 focus:outline-none" required />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wide mb-1.5">Option C</label>
                  <input type="text" name="option3" className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-200 focus:outline-none" required />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wide mb-1.5">Option D</label>
                  <input type="text" name="option4" className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-200 focus:outline-none" required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wide mb-1.5">Answer Key</label>
                  <select name="answer" className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-200 focus:outline-none" required>
                    <option value="option1">A</option>
                    <option value="option2">B</option>
                    <option value="option3">C</option>
                    <option value="option4">D</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wide mb-1.5">Attach Image (Optional)</label>
                  <input type="file" name="img" className="w-full text-slate-350 cursor-pointer" />
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 bg-white text-slate-950 hover:bg-slate-100 font-bold rounded-lg cursor-pointer transition shadow-md">
                Add Question
              </button>
            </form>
          </div>

          {/* Questions Bank List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Questions Bank ({questions.length})</h2>
            </div>
            
            {questions.map((q, idx) => {
              const isEditing = editingQuestionId === q.id;
              return (
                <div key={q.id} className="mcq bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl space-y-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Edit Question Text</label>
                      <textarea
                        value={editForm.question}
                        onChange={(e) => setEditForm(prev => ({ ...prev, question: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none min-h-[60px]"
                      />
                    </div>
                  ) : (
                    <h1 className="text-base font-bold text-white leading-relaxed">
                      <span className="text-slate-400 mr-1">{idx + 1}.</span> {q.question}
                    </h1>
                  )}

                  {q.image && q.image.contentType && (
                    <img
                      src={`data:image/${q.image.contentType};base64,${arrayBufferToBase64(q.image.data.data)}`}
                      alt="attachment"
                      className="max-w-xs max-h-60 object-contain mt-3 rounded-lg border border-slate-800 shadow-lg"
                    />
                  )}

                  {isEditing && (
                    <div className="flex items-center gap-3 bg-slate-950/40 border border-slate-800 p-4 rounded-xl mt-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Change Image:</span>
                      <input
                        type="file"
                        onChange={(e) => setEditImageFile(e.target.files[0])}
                        className="text-xs text-slate-300 flex-grow"
                      />
                      <button
                        onClick={() => handleUpdateImage(q.id)}
                        className="px-4 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-md text-xs font-semibold cursor-pointer"
                      >
                        Upload
                      </button>
                    </div>
                  )}

                  <ul className="mcq-options-list space-y-3 mt-4 mb-6">
                    {q.choice.map((choiceText, cIdx) => {
                      const letter = String.fromCharCode(65 + cIdx);
                      return (
                        <li key={cIdx} className="!cursor-default">
                          <span className="w-6 h-6 rounded-full bg-slate-950/80 border border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 mr-2 shrink-0">
                            {letter}
                          </span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.choice[cIdx]}
                              onChange={(e) => {
                                const nextChoices = [...editForm.choice];
                                nextChoices[cIdx] = e.target.value;
                                setEditForm(prev => ({ ...prev, choice: nextChoices }));
                              }}
                              className="flex-grow px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none"
                            />
                          ) : (
                            <span className="flex-grow">{choiceText}</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>

                  <div className="mt-4 p-4 bg-slate-950/60 border border-slate-900/80 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm font-semibold font-sans">
                    <div className="flex items-center gap-2">
                      <div className="text-green-400"><span className="text-slate-500 font-normal">Answer Key: </span> {q.answer}</div>
                      {isEditing && (
                        <select
                          value={editForm.answer}
                          onChange={(e) => setEditForm(prev => ({ ...prev, answer: e.target.value }))}
                          className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-md text-xs text-slate-300"
                        >
                          <option value="option1">A</option>
                          <option value="option2">B</option>
                          <option value="option3">C</option>
                          <option value="option4">D</option>
                        </select>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => saveEdit(q.id)}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-md text-xs font-semibold transition cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingQuestionId(null)}
                            className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-400 rounded-md text-xs font-semibold transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => startEditing(q)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-md text-xs font-semibold transition cursor-pointer"
                        >
                          Update
                        </button>
                      )}
                      <button
                        onClick={() => deleteQuestion(q.id)}
                        className="px-3 py-1.5 bg-red-650/10 hover:bg-red-650/20 text-red-400 border border-red-900/30 rounded-md text-xs font-semibold transition cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
