import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function CandidateLogin() {
  const [appNo, setAppNo] = useState('');
  const [password, setPassword] = useState('');
  const [warning, setWarning] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/data');
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setWarning('');

    fetch('/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        applicationNo: appNo,
        password: password,
      }),
    })
      .then((res) => res.json())
      .then((body) => {
        if (body.status === 0) {
          localStorage.setItem('token', body.authtoken);
          if (body.stream && body.stream.length > 0) {
            navigate('/instruction');
          } else {
            navigate('/data');
          }
        } else if (body.status === 2) {
          setWarning('Already submitted / logged in');
        } else {
          setWarning('Invalid Credentials');
        }
      })
      .catch(() => {
        setWarning('Network error logging in');
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black py-10 px-4 font-sans flex flex-col justify-center">
      <div className="w-[140px] h-[140px] mx-auto p-[10px] flex items-center justify-center mb-2">
        <img
          src="/assets/Indian_Institute_of_Information_Technology,_Bhagalpur_logo.png"
          alt="IIIT Bhagalpur Logo"
          className="max-w-full max-h-full"
        />
      </div>
      <div className="w-fit mx-auto text-center mb-8">
        <h3 className="text-xl font-bold text-gray-800 tracking-wide">Indian Institute of Information Technology Bhagalpur</h3>
        <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-semibold">Online Examination Portal</p>
      </div>
      <div className="flex flex-col items-center justify-center">
        {warning && (
          <div className="text-red-650 font-bold mb-4 text-base bg-red-50 border-l-4 border-red-500 py-2 px-4 w-full max-w-[420px] rounded-r-lg">
            ⚠️ {warning}
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="border border-gray-200 p-8 w-full max-w-[420px] bg-white rounded-2xl shadow-lg space-y-6"
        >
          <h2 className="text-center font-bold text-gray-800 text-lg border-b border-gray-100 pb-3">Candidate Sign In</h2>
          <div>
            <label htmlFor="applicationNo" className="text-sm font-semibold text-gray-700 block mb-1">
              Application No:
            </label>
            <input
              id="applicationNo"
              type="text"
              className="w-full p-2.5 custom-input"
              value={appNo}
              onChange={(e) => setAppNo(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-semibold text-gray-700 block mb-1">
              Password:
            </label>
            <input
              type="password"
              id="password"
              className="w-full p-2.5 custom-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-black hover:bg-gray-900 text-white rounded-lg cursor-pointer font-bold text-sm transition duration-150 active:scale-[0.98]"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CandidateLogin;
