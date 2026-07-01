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
    <div className="min-h-screen bg-gray-50 text-black py-10 px-4 font-sans flex flex-col justify-center">
      <div className="w-[120px] h-[120px] mx-auto p-[10px] flex items-center justify-center mb-1">
        <img
          src="/assets/Indian_Institute_of_Information_Technology,_Bhagalpur_logo.png"
          alt="IIIT Bhagalpur Logo"
          className="max-w-full max-h-full"
        />
      </div>
      <div className="w-fit mx-auto text-center mb-8">
        <h3 className="text-xl font-bold text-gray-800 tracking-wide">IIIT Bhagalpur</h3>
        <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-semibold">Setup Examination Profile</p>
      </div>
      <div className="flex flex-col items-center justify-center">
        {warning && (
          <div className="text-red-650 font-bold mb-4 text-base bg-red-50 border-l-4 border-red-500 py-2 px-4 w-full max-w-[460px] rounded-r-lg">
            ⚠️ {warning}
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="border border-gray-200 p-8 w-full max-w-[460px] bg-white rounded-2xl shadow-lg space-y-5"
        >
          <h2 className="text-center text-lg font-bold text-gray-800 border-b border-gray-100 pb-3">Complete Profile Details</h2>
          
          <div className="flex flex-col">
            <label htmlFor="name" className="text-sm font-semibold text-gray-700 mb-1">Full Name</label>
            <input
              id="name"
              type="text"
              className="w-full p-2.5 custom-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="program" className="text-sm font-semibold text-gray-700 mb-1">Category of Post</label>
            <select
              id="program"
              className="w-full custom-select"
              value={program}
              onChange={(e) => {
                setProgram(e.target.value);
                setStream('');
              }}
              required
            >
              <option value="">--select--</option>
              <option value="MTech">MTech</option>
              <option value="PhD">PhD</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="stream" className="text-sm font-semibold text-gray-700 mb-1">Post applied for</label>
            <select
              id="stream"
              className="w-full custom-select"
              value={stream}
              onChange={(e) => setStream(e.target.value)}
              required
              disabled={!program}
            >
              <option value="">--select--</option>
              {program && config && (
                <>
                  <option value={config.CSEvalue}>{config.CSEvalue}</option>
                  <option value={config.ECEvalue}>{config.ECEvalue}</option>
                  <option value={config.MEAvalue}>{config.MEAvalue}</option>
                  <option value={config.Mathvalue}>{config.Mathvalue}</option>
                </>
              )}
            </select>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3 bg-black hover:bg-gray-900 text-white rounded-lg cursor-pointer font-bold text-sm transition duration-150 active:scale-[0.98]"
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CandidateProfile;
