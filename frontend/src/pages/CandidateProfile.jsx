import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function CandidateProfile() {
  const [name, setName] = useState('');
  const [program, setProgram] = useState('');
  const [stream, setStream] = useState('');
  const [config, setConfig] = useState(null);
  const [warning, setWarning] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    // Fetch details configuration
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch(() => setWarning('Error fetching department configurations'));

    // Check auth access
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
          if (body.data.stream && body.data.stream.length !== 0) {
            navigate('/instruction');
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
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setWarning('');

    const token = localStorage.getItem('token');
    fetch('/user/adddata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'auth_token': token,
      },
      body: new URLSearchParams({
        name: name,
        program: program,
        stream: stream,
      }),
    })
      .then((res) => res.json())
      .then((body) => {
        if (body.status === 0) {
          navigate('/instruction');
        } else {
          setWarning('Error saving details. Please try again.');
        }
      })
      .catch(() => {
        setWarning('Network error saving details');
      });
  };

  return (
    <div className="font-sans bg-slate-950 text-slate-100 flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900">
      <div className="w-full max-w-lg p-8 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-slate-700/80">
        <div className="flex justify-center mb-6">
          <img className="h-16 w-auto object-contain filter drop-shadow-lg" src="/public/assets/Indian_Institute_of_Information_Technology,_Bhagalpur_logo.png" alt="IIIT Bhagalpur" />
        </div>
        <div className="text-center mb-8 border-b border-slate-800/80 pb-6">
          <h3 className="text-base font-bold leading-snug tracking-tight text-white">Indian Institute of Information Technology Bhagalpur</h3>
          <p className="text-xs text-slate-400 mt-1 font-medium tracking-wide uppercase">Candidate Profile Form</p>
        </div>

        <div className="text-center text-sm font-semibold tracking-wider uppercase text-white mb-6">Candidate Details Form</div>
        
        {warning && (
          <div className="mb-5 p-3.5 bg-red-950/40 border border-red-900/60 rounded-lg text-red-400 text-sm font-medium text-center shadow-inner">
            {warning}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
            <input
              id="name"
              type="text"
              className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 transition duration-150"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="program" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Category of Post</label>
            <select
              id="program"
              className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 transition duration-150"
              value={program}
              onChange={(e) => {
                setProgram(e.target.value);
                setStream('');
              }}
              required
            >
              <option value="" className="bg-slate-900 text-slate-450">-- select category --</option>
              <option value="MTech" className="bg-slate-900 text-slate-100">MTech</option>
              <option value="PhD" className="bg-slate-900 text-slate-100">PhD</option>
            </select>
          </div>
          <div>
            <label htmlFor="stream" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Post applied for</label>
            <select
              id="stream"
              className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 transition duration-150"
              value={stream}
              onChange={(e) => setStream(e.target.value)}
              required
              disabled={!program}
            >
              <option value="" className="bg-slate-900 text-slate-400">-- select program/stream --</option>
              {program && config && (
                <>
                  <option value={config.CSEvalue} className="bg-slate-900 text-slate-100">{config.CSEvalue}</option>
                  <option value={config.ECEvalue} className="bg-slate-900 text-slate-100">{config.ECEvalue}</option>
                  <option value={config.MEAvalue} className="bg-slate-900 text-slate-100">{config.MEAvalue}</option>
                  <option value={config.Mathvalue} className="bg-slate-900 text-slate-100">{config.Mathvalue}</option>
                </>
              )}
            </select>
          </div>
          <button type="submit" className="w-full py-3 bg-white text-slate-950 hover:bg-slate-100 active:scale-[0.98] rounded-lg text-sm font-semibold tracking-wide cursor-pointer transition-all duration-150 shadow-lg shadow-black/20 mt-6">
            Continue to Exam
          </button>
        </form>
      </div>
    </div>
  );
}

export default CandidateProfile;
