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
    <div className="min-h-screen bg-white text-black font-sans pb-10">
      {/* Top Header */}
      <div className="header flex justify-between items-center w-[95%] mx-auto py-4 border-b-2 border-black mb-6">
        <div className="heading">
          <h1 className="text-[28px] font-bold">Question Panel</h1>
        </div>
        <div className="flex gap-4">
          <div className="bg-[#d6d4d2] px-[20px] py-[10px] cursor-pointer hover:bg-gray-300 border border-black">
            <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>logout</a>
          </div>
          <div className="bg-[#d6d4d2] px-[20px] py-[10px] cursor-pointer hover:bg-gray-300 border border-black">
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/participants'); }}>Participants</a>
          </div>
        </div>
      </div>

      {/* Configure Exam Timings Card */}
      <div className="max-w-[800px] mx-auto my-[20px] p-[20px] bg-[#f9f9f9] border border-[#e0e0e0] rounded-[8px] shadow-sm">
        <h3 className="mt-0 text-[16px] font-bold text-gray-800 mb-4">Configure Exam Timings (JEE Mode)</h3>
        <form onSubmit={handleSetTimers} className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label htmlFor="startTimeInput" className="font-bold text-[14px]">Start Date & Time:</label>
            <input
              type="datetime-local"
              id="startTimeInput"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="p-[8px] border border-gray-400 rounded bg-white text-black text-[14px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="endTimeInput" className="font-bold text-[14px]">End Date & Time:</label>
            <input
              type="datetime-local"
              id="endTimeInput"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="p-[8px] border border-gray-400 rounded bg-white text-black text-[14px]"
            />
          </div>
          <button
            type="submit"
            className="p-[10px] px-[20px] bg-blue-600 hover:bg-blue-700 text-white font-bold border border-black cursor-pointer rounded"
          >
            Save Timing
          </button>
        </form>
        {timeMessage && (
          <div className="mt-3 text-green-600 font-bold text-[14px]">{timeMessage}</div>
        )}
      </div>

      {/* Main Workspace Layout */}
      <div className="QuestionForm flex flex-col lg:flex-row w-[97%] mx-auto gap-8 justify-around mt-6">
        {/* Left Form Fill Panel */}
        <div className="formfill w-full lg:w-[40%] flex flex-col gap-6">
          <div className="border border-black p-[20px] bg-[#fafafa]">
            <h2 className="text-[20px] font-bold border-b border-black pb-2 mb-4">Select Workspace Scope</h2>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-bold">Stream</label>
                <select
                  value={stream}
                  onChange={(e) => setStream(e.target.value)}
                  className="p-[5px] border border-gray-400 bg-white text-black text-[16px]"
                >
                  <option value={config.CSEvalue}>{config.CSEvalue}</option>
                  <option value={config.ECEvalue}>{config.ECEvalue}</option>
                  <option value={config.MEAvalue}>{config.MEAvalue}</option>
                  <option value={config.Mathvalue}>{config.Mathvalue}</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-bold">Program</label>
                <select
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="p-[5px] border border-gray-400 bg-white text-black text-[16px]"
                >
                  <option value="MTech">MTech</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleCreateQuestion}
            id="question_txt"
            className="flex flex-col gap-3 border border-black p-[20px] bg-[#fafafa]"
            encType="multipart/form-data"
          >
            <h2 className="text-[20px] font-bold border-b border-black pb-2">Add New Question</h2>
            
            <div className="flex flex-col gap-1">
              <label htmlFor="ques" className="font-semibold">Question</label>
              <textarea
                name="ques"
                id="ques"
                placeholder="Enter Question text (supports Latex $...$)"
                className="w-[96%] p-[5px] border border-gray-400 bg-white text-black text-[16px] min-h-[80px]"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="image" className="font-semibold">Upload Image</label>
              <input type="file" name="img" id="image" className="text-[14px]" />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="option1" className="font-semibold">A</label>
              <input type="text" name="option1" id="option1" placeholder="Enter Option 1" required className="w-[96%] p-[5px] border border-gray-400 bg-white text-black text-[16px]" />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="option2" className="font-semibold">B</label>
              <input type="text" name="option2" id="option2" placeholder="Enter Option 2" required className="w-[96%] p-[5px] border border-gray-400 bg-white text-black text-[16px]" />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="option3" className="font-semibold">C</label>
              <input type="text" name="option3" id="option3" placeholder="Enter Option 3" required className="w-[96%] p-[5px] border border-gray-400 bg-white text-black text-[16px]" />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="option4" className="font-semibold">D</label>
              <input type="text" name="option4" id="option4" placeholder="Enter Option 4" required className="w-[96%] p-[5px] border border-gray-400 bg-white text-black text-[16px]" />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="answer" className="font-semibold">Answer</label>
              <select name="answer" id="answer" required className="w-[96%] p-[5px] border border-gray-400 bg-white text-black text-[16px]">
                <option value="">--select--</option>
                <option value="option1">A</option>
                <option value="option2">B</option>
                <option value="option3">C</option>
                <option value="option4">D</option>
              </select>
            </div>

            <div className="mt-4">
              <input
                type="submit"
                value="Add Question"
                id="add_question"
                className="px-[25px] py-[10px] bg-gray-200 hover:bg-gray-300 border border-black cursor-pointer text-[16px] font-bold"
              />
            </div>
          </form>

          {/* Bulk Import Box */}
          <div className="border border-black p-[20px] bg-[#fafafa]">
            <h2 className="text-[20px] font-bold border-b border-black pb-2 mb-4">Bulk Excel Import</h2>
            <form onSubmit={handleBulkUpload} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-bold">Select Excel File:</label>
                <input
                  type="file"
                  name="file"
                  accept=".xlsx, .xls"
                  required
                  className="text-[14px]"
                />
              </div>
              <div>
                <input
                  type="submit"
                  value="Upload Sheet"
                  className="px-[20px] py-[8px] bg-gray-200 hover:bg-gray-300 border border-black cursor-pointer text-[14px] font-bold"
                />
              </div>
            </form>
          </div>
        </div>

        {/* Right Questions List Panel Column */}
        <div className="display w-full lg:w-[55%] border-l-2 border-black pl-6 min-h-[80vh] overflow-y-auto">
          <div className="question">
            <h2 className="text-[22px] font-bold border-b border-black pb-2 mb-4">
              Questions Bank ({questions.length})
            </h2>
            
            {questions.length === 0 ? (
              <p className="text-gray-500 text-[16px]">No questions found for this stream/program.</p>
            ) : (
              <div className="space-y-6">
                {questions.map((q, idx) => {
                  const isEditing = editingQuestionId === q.id;
                  return (
                    <div key={q.id} className="mcq border-b-2 border-black pb-4 mb-4">
                      {isEditing ? (
                        <div className="flex flex-col gap-2">
                          <label className="font-bold">Edit Question Text:</label>
                          <textarea
                            value={editForm.question}
                            onChange={(e) => setEditForm(prev => ({ ...prev, question: e.target.value }))}
                            className="p-[5px] border border-gray-400 bg-white text-black text-[16px] min-h-[60px] w-full"
                          />
                        </div>
                      ) : (
                        <h1 className="text-[18px] font-normal leading-snug">
                          <span className="font-bold mr-1">{idx + 1}.</span> {q.question}
                        </h1>
                      )}

                      {q.image && q.image.contentType && (
                        <div className="my-2 max-w-full">
                          <img
                            src={`data:image/${q.image.contentType};base64,${arrayBufferToBase64(q.image.data.data)}`}
                            alt="attachment"
                            className="max-w-xs max-h-48 object-contain border border-gray-450"
                          />
                        </div>
                      )}

                      {isEditing && (
                        <div className="flex items-center gap-3 border border-gray-350 p-2 my-2 bg-gray-50">
                          <span className="font-bold text-[14px]">Change Image:</span>
                          <input
                            type="file"
                            onChange={(e) => setEditImageFile(e.target.files[0])}
                            className="text-[14px] flex-grow"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateImage(q.id)}
                            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 border border-black text-[14px] cursor-pointer"
                          >
                            Upload
                          </button>
                        </div>
                      )}

                      <ul className="list-none m-0 p-0 pt-[10px] pl-[5px] space-y-1">
                        {q.choice.map((choiceText, cIdx) => {
                          const letter = String.fromCharCode(65 + cIdx);
                          return (
                            <li key={cIdx} className="text-[16px] py-1 flex items-center gap-2">
                              <span className="font-bold">{letter}. </span>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editForm.choice[cIdx]}
                                  onChange={(e) => {
                                    const nextChoices = [...editForm.choice];
                                    nextChoices[cIdx] = e.target.value;
                                    setEditForm(prev => ({ ...prev, choice: nextChoices }));
                                  }}
                                  className="flex-grow p-1 border border-gray-400 bg-white text-black text-[16px]"
                                />
                              ) : (
                                <span>{choiceText}</span>
                              )}
                            </li>
                          );
                        })}
                      </ul>

                      <div className="answerDelete mt-4 bg-gray-100 p-3 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-[16px]">
                          <span><b>Correct Answer:</b></span>
                          {isEditing ? (
                            <select
                              value={editForm.answer}
                              onChange={(e) => setEditForm(prev => ({ ...prev, answer: e.target.value }))}
                              className="p-1 border border-gray-450 bg-white text-black"
                            >
                              <option value="option1">A</option>
                              <option value="option2">B</option>
                              <option value="option3">C</option>
                              <option value="option4">D</option>
                            </select>
                          ) : (
                            <span className="font-bold text-green-700">
                              {q.answer === "option1" ? "A" : q.answer === "option2" ? "B" : q.answer === "option3" ? "C" : "D"}
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => saveEdit(q.id)}
                                className="px-3 py-1 bg-green-200 hover:bg-green-300 border border-black text-[14px] cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingQuestionId(null)}
                                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 border border-black text-[14px] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => startEditing(q)}
                              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 border border-black text-[14px] cursor-pointer"
                            >
                              Update
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => deleteQuestion(q.id)}
                            className="px-3 py-1 bg-red-200 hover:bg-red-300 border border-black text-[14px] cursor-pointer text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
