import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function AdminDashboard() {
  const [stream, setStream] = useState('Computer Science Engineering');
  const [program, setProgram] = useState('MTech');
  const [config, setConfig] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editForm, setEditForm] = useState({ question: '', choice: ['', '', '', ''], answer: '' });
  const [editImageFile, setEditImageFile] = useState(null);
  
  // Timer configs
  const [startDay, setStartDay] = useState('');
  const [startHour, setStartHour] = useState('12');
  const [startMinute, setStartMinute] = useState('00');
  const [startPeriod, setStartPeriod] = useState('AM');

  const [endDay, setEndDay] = useState('');
  const [endHour, setEndHour] = useState('12');
  const [endMinute, setEndMinute] = useState('00');
  const [endPeriod, setEndPeriod] = useState('AM');
  const [timeMessage, setTimeMessage] = useState('');

  const navigate = useNavigate();

  const [sidebarWidth, setSidebarWidth] = useState(350);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [activeTab, setActiveTab] = useState('settings');
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
    const newWidth = mouseMoveEvent.clientX;
    if (newWidth > 260 && newWidth < 600) {
      setSidebarWidth(newWidth);
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
    const newWidth = touch.clientX;
    if (newWidth > 260 && newWidth < 600) {
      setSidebarWidth(newWidth);
    }
  };

  const handleTouchEnd = () => {
    isResizingRef.current = false;
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };

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
        const parseDateTime = (dStr) => {
          if (!dStr) return { date: '', hour: '12', minute: '00', period: 'AM' };
          const d = new Date(dStr);
          const pad = (n) => String(n).padStart(2, '0');
          
          const dateVal = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
          
          let hours = d.getHours();
          const period = hours >= 12 ? 'PM' : 'AM';
          hours = hours % 12;
          if (hours === 0) hours = 12;
          
          const hourVal = String(hours);
          const minuteVal = pad(d.getMinutes());
          
          return { date: dateVal, hour: hourVal, minute: minuteVal, period };
        };

        const startParsed = parseDateTime(res.SDate);
        setStartDay(startParsed.date);
        setStartHour(startParsed.hour);
        setStartMinute(startParsed.minute);
        setStartPeriod(startParsed.period);

        const endParsed = parseDateTime(res.EDate);
        setEndDay(endParsed.date);
        setEndHour(endParsed.hour);
        setEndMinute(endParsed.minute);
        setEndPeriod(endParsed.period);
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
          toast.success('Question added successfully');
          e.target.reset();
          loadQuestions();
        } else {
          toast.error('Error adding question');
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
          toast.success('Bulk questions added successfully');
          e.target.reset();
          loadQuestions();
        } else {
          toast.error('Error performing bulk upload');
        }
      });
  };

  const handleBulkCandidatesUpload = (e) => {
    e.preventDefault();
    const adminToken = localStorage.getItem('admintoken');
    const formData = new FormData(e.target);

    fetch('/user/uploadCandidates', {
      method: 'POST',
      headers: {
        'auth_token': adminToken,
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 0) {
          toast.success(data.message || 'Candidates uploaded successfully');
          e.target.reset();
        } else {
          toast.error(data.message || 'Error uploading candidates');
        }
      })
      .catch((err) => {
        toast.error('Upload failed: ' + err.message);
      });
  };

  const handleSetTimers = (e) => {
    e.preventDefault();
    const adminToken = localStorage.getItem('admintoken');
    
    const combineDateTime = (date, hour, minute, period) => {
      if (!date) return '';
      let h = parseInt(hour, 10);
      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      
      const [year, month, day] = date.split('-').map(Number);
      const m = parseInt(minute, 10);
      
      const localDate = new Date(year, month - 1, day, h, m);
      return localDate.toISOString();
    };

    const formattedStart = combineDateTime(startDay, startHour, startMinute, startPeriod);
    const formattedEnd = combineDateTime(endDay, endHour, endMinute, endPeriod);

    fetch('/time/settiming', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth_token': adminToken,
      },
      body: JSON.stringify({ startTime: formattedStart, endTime: formattedEnd }),
    })
      .then((res) => res.json())
      .then((body) => {
        if (body.status === 0) {
          toast.success('Timers updated successfully!');
        } else {
          toast.error('Error setting timers');
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
          toast.success('Question updated successfully');
        } else {
          toast.error('Error updating question text');
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
          toast.success('Image updated successfully');
          setEditImageFile(null);
          loadQuestions();
        } else {
          toast.error('Error updating question image');
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
          toast.success('Question deleted successfully');
        } else {
          toast.error('Error deleting question');
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

  if (!config) return <div className="min-h-screen bg-white text-center p-12 text-gray-500">Loading Console...</div>;

  return (
    <div className="h-screen bg-gray-50 text-gray-900 font-sans flex flex-col overflow-hidden">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 py-4 px-8 flex justify-between items-center sticky top-0 z-50 shadow-sm shrink-0">
        <h1 className="text-2xl font-bold text-gray-800">Admin Panel — Exam Portal</h1>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/participants')}
            className="border border-gray-300 px-5 py-2 rounded bg-white text-base hover:bg-gray-55 text-gray-700 font-semibold transition cursor-pointer"
          >
            Participants
          </button>
          <button
            onClick={handleLogout}
            className="border border-gray-300 px-5 py-2 rounded bg-white text-base hover:bg-gray-55 text-red-600 font-semibold transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      {isMobile && (
        <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2 text-center text-sm font-semibold rounded transition duration-150 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Settings & Add Question
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex-1 py-2 text-center text-sm font-semibold rounded transition duration-150 cursor-pointer ${
              activeTab === 'questions'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Questions List ({questions.length})
          </button>
        </div>
      )}

      {/* Workspace Containers */}
      <div className="flex flex-col lg:flex-row flex-grow w-full items-stretch overflow-hidden">
        {/* Left Control Panel Column */}
        {(!isMobile || activeTab === 'settings') && (
          <div
            className="w-full lg:w-[350px] bg-white shrink-0 p-6 flex flex-col gap-6 overflow-y-auto h-full"
            style={{ width: isMobile ? '100%' : `${sidebarWidth}px` }}
          >
          {/* Exam Schedule */}
          <div>
            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Exam Schedule</h3>
            <p className="text-xs text-gray-400 mb-3">Set timing for Online Examination</p>
            <form onSubmit={handleSetTimers} className="space-y-4">
              <div className="space-y-4">
                {/* Start Time Section */}
                <div className="border border-gray-200 rounded p-3 bg-gray-50 space-y-2">
                  <span className="text-xs font-bold text-gray-700 block">Exam Start Time</span>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] uppercase font-semibold text-gray-400 mb-0.5">Date</label>
                      <input
                        type="date"
                        value={startDay}
                        onChange={(e) => setStartDay(e.target.value)}
                        required
                        className="w-full p-2 border border-gray-300 rounded text-sm bg-white text-black focus:outline-none focus:border-gray-500"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-gray-400 mb-0.5">Hour</label>
                        <select
                          value={startHour}
                          onChange={(e) => setStartHour(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm bg-white text-black focus:outline-none"
                        >
                          {Array.from({ length: 12 }, (_, i) => String(i + 1)).map(h => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-gray-400 mb-0.5">Minute</label>
                        <select
                          value={startMinute}
                          onChange={(e) => setStartMinute(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm bg-white text-black focus:outline-none"
                        >
                          {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-gray-400 mb-0.5">AM/PM</label>
                        <select
                          value={startPeriod}
                          onChange={(e) => setStartPeriod(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm bg-white text-black focus:outline-none"
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* End Time Section */}
                <div className="border border-gray-200 rounded p-3 bg-gray-50 space-y-2">
                  <span className="text-xs font-bold text-gray-700 block">Exam End Time</span>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] uppercase font-semibold text-gray-400 mb-0.5">Date</label>
                      <input
                        type="date"
                        value={endDay}
                        onChange={(e) => setEndDay(e.target.value)}
                        required
                        className="w-full p-2 border border-gray-300 rounded text-sm bg-white text-black focus:outline-none focus:border-gray-500"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-gray-400 mb-0.5">Hour</label>
                        <select
                          value={endHour}
                          onChange={(e) => setEndHour(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm bg-white text-black focus:outline-none"
                        >
                          {Array.from({ length: 12 }, (_, i) => String(i + 1)).map(h => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-gray-400 mb-0.5">Minute</label>
                        <select
                          value={endMinute}
                          onChange={(e) => setEndMinute(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm bg-white text-black focus:outline-none"
                        >
                          {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-gray-400 mb-0.5">AM/PM</label>
                        <select
                          value={endPeriod}
                          onChange={(e) => setEndPeriod(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm bg-white text-black focus:outline-none"
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-black hover:bg-gray-900 text-white rounded text-sm font-bold transition duration-150 cursor-pointer"
              >
                Save Timing
              </button>
            </form>
            {timeMessage && (
              <div className="mt-2 text-green-600 font-semibold text-sm text-center">{timeMessage}</div>
            )}
          </div>

          {/* Bulk Import Questions */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Bulk Import Questions</h3>
            <p className="text-xs text-gray-400 mb-3">Upload questions from Excel or CSV sheet</p>
            <form onSubmit={handleBulkUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Stream</label>
                <select
                  value={stream}
                  onChange={(e) => setStream(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded text-sm bg-white focus:outline-none text-black"
                >
                  <option value={config.CSEvalue}>{config.CSEvalue}</option>
                  <option value={config.ECEvalue}>{config.ECEvalue}</option>
                  <option value={config.MEAvalue}>{config.MEAvalue}</option>
                  <option value={config.Mathvalue}>{config.Mathvalue}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Program</label>
                <select
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded text-sm bg-white focus:outline-none text-black"
                >
                  <option value="MTech">MTech</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">File (.xlsx, .xls, .csv)</label>
                <input
                  type="file"
                  name="file"
                  accept=".xlsx, .xls, .csv"
                  required
                  className="w-full text-sm text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border file:border-gray-300 file:bg-gray-50 file:text-xs file:font-semibold cursor-pointer"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 rounded text-sm font-bold transition duration-150 cursor-pointer"
              >
                Upload Questions
              </button>
            </form>
          </div>

          {/* Bulk Import Candidates */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Bulk Import Candidates</h3>
            <p className="text-xs text-gray-400 mb-3">Upload candidate logins from Excel sheet</p>
            <form onSubmit={handleBulkCandidatesUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">File (.xlsx, .xls, .csv)</label>
                <input
                  type="file"
                  name="candidatesFile"
                  accept=".xlsx, .xls, .csv"
                  required
                  className="w-full text-sm text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border file:border-gray-300 file:bg-gray-50 file:text-xs file:font-semibold cursor-pointer"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 rounded text-sm font-bold transition duration-150 cursor-pointer"
              >
                Upload Candidates
              </button>
            </form>
          </div>

          {/* Single Question Manual Insertion */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Add Single Question</h3>
            <p className="text-xs text-gray-400 mb-3">Add a single MCQ manual entry</p>
            <form onSubmit={handleCreateQuestion} className="space-y-3">
              <div>
                <textarea
                  name="ques"
                  placeholder="Enter Question text (supports Latex $...$)"
                  required
                  className="w-full p-2.5 border border-gray-300 rounded text-sm bg-white text-black min-h-[80px] focus:outline-none"
                />
              </div>
              <div>
                <input type="file" name="img" className="text-sm w-full cursor-pointer" />
              </div>
              <input type="text" name="option1" placeholder="Option A" required className="w-full p-2.5 border border-gray-300 rounded text-sm bg-white text-black focus:outline-none" />
              <input type="text" name="option2" placeholder="Option B" required className="w-full p-2.5 border border-gray-300 rounded text-sm bg-white text-black focus:outline-none" />
              <input type="text" name="option3" placeholder="Option C" required className="w-full p-2.5 border border-gray-300 rounded text-sm bg-white text-black focus:outline-none" />
              <input type="text" name="option4" placeholder="Option D" required className="w-full p-2.5 border border-gray-300 rounded text-sm bg-white text-black focus:outline-none" />
              <select name="answer" required className="w-full p-2.5 border border-gray-300 rounded text-sm bg-white text-black focus:outline-none">
                <option value="">--select answer--</option>
                <option value="option1">A</option>
                <option value="option2">B</option>
                <option value="option3">C</option>
                <option value="option4">D</option>
              </select>
              <button
                type="submit"
                className="w-full py-2.5 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 rounded text-sm font-bold transition duration-150 cursor-pointer"
              >
                Add Question
              </button>
            </form>
          </div>
        </div>
        )}

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

        {/* Right Questions List Column */}
        {(!isMobile || activeTab === 'questions') && (
          <div className="flex-grow p-8 bg-white overflow-y-auto h-full">
          {/* List Toolbar Filters */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Filter Questions</h2>
            <div className="flex gap-3">
              <select
                value={stream}
                onChange={(e) => setStream(e.target.value)}
                className="p-2.5 border border-gray-300 rounded text-sm bg-white focus:outline-none font-medium text-gray-700"
              >
                <option value={config.CSEvalue}>{config.CSEvalue}</option>
                <option value={config.ECEvalue}>{config.ECEvalue}</option>
                <option value={config.MEAvalue}>{config.MEAvalue}</option>
                <option value={config.Mathvalue}>{config.Mathvalue}</option>
              </select>
              <select
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="p-2.5 border border-gray-300 rounded text-sm bg-white focus:outline-none font-medium text-gray-700"
              >
                <option value="MTech">MTech</option>
                <option value="PhD">PhD</option>
              </select>
            </div>
          </div>

          {/* Question Cards Stack */}
          {questions.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-base">
              No questions found for this stream/program.
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((q, idx) => {
                const isEditing = editingQuestionId === q.id;
                return (
                  <div key={q.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4 hover:shadow-md transition duration-150">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Edit Question Text</label>
                          <textarea
                            value={editForm.question}
                            onChange={(e) => setEditForm(prev => ({ ...prev, question: e.target.value }))}
                            className="w-full p-2.5 border border-gray-300 rounded text-sm bg-white text-black min-h-[80px] focus:outline-none"
                          />
                        </div>

                        {q.image && q.image.contentType && (
                          <div className="my-2">
                            <img
                              src={`data:image/${q.image.contentType};base64,${arrayBufferToBase64(q.image.data.data)}`}
                              alt="attachment"
                              className="max-h-32 object-contain border border-gray-200"
                            />
                          </div>
                        )}

                        <div className="flex items-center gap-3 border border-gray-200 p-2 rounded bg-gray-50 text-sm">
                          <span className="font-bold text-gray-500">Change Image:</span>
                          <input
                            type="file"
                            onChange={(e) => setEditImageFile(e.target.files[0])}
                            className="text-sm flex-grow cursor-pointer"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateImage(q.id)}
                            className="px-3 py-1 bg-white hover:bg-gray-50 border border-gray-300 text-xs rounded font-medium cursor-pointer"
                          >
                            Upload
                          </button>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-400 uppercase">Edit Options</label>
                          {editForm.choice.map((choiceText, cIdx) => (
                            <input
                              key={cIdx}
                              type="text"
                              value={choiceText}
                              onChange={(e) => {
                                const nextChoices = [...editForm.choice];
                                nextChoices[cIdx] = e.target.value;
                                setEditForm(prev => ({ ...prev, choice: nextChoices }));
                              }}
                              className="w-full p-2.5 border border-gray-300 rounded text-sm bg-white text-black focus:outline-none"
                            />
                          ))}
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-bold text-gray-500">Answer Key:</span>
                            <select
                              value={editForm.answer}
                              onChange={(e) => setEditForm(prev => ({ ...prev, answer: e.target.value }))}
                              className="p-1 border border-gray-300 rounded text-sm bg-white text-black"
                            >
                              <option value="option1">A</option>
                              <option value="option2">B</option>
                              <option value="option3">C</option>
                              <option value="option4">D</option>
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => saveEdit(q.id)}
                              className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-semibold cursor-pointer transition"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingQuestionId(null)}
                              className="px-4 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded text-sm font-semibold cursor-pointer transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-base font-bold text-gray-800 leading-snug">
                          {idx + 1}. {q.question}
                        </h3>

                        {q.image && q.image.contentType && (
                          <div className="my-2">
                            <img
                              src={`data:image/${q.image.contentType};base64,${arrayBufferToBase64(q.image.data.data)}`}
                              alt="attachment"
                              className="max-h-40 object-contain border border-gray-200"
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-1 gap-2 my-4">
                          {q.choice.map((choiceText, cIdx) => (
                            <div key={cIdx} className="p-2.5 px-4 bg-[#fafbfc] border border-gray-100 rounded-md text-sm text-gray-700">
                              <span className="font-semibold mr-2">{String.fromCharCode(65 + cIdx)}.</span>
                              {choiceText}
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <div className="bg-[#e6f4ea] text-[#137333] px-3 py-1 rounded text-sm font-bold">
                            Answer : {q.answer === "option1" ? q.choice[0] : q.answer === "option2" ? q.choice[1] : q.answer === "option3" ? q.choice[2] : q.choice[3]}
                          </div>

                          <div className="flex gap-4">
                            <button
                              type="button"
                              onClick={() => startEditing(q)}
                              className="text-red-600 hover:underline text-sm font-semibold transition cursor-pointer"
                            >
                              Update
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteQuestion(q.id)}
                              className="text-red-600 hover:underline text-sm font-semibold transition cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
