import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const [appNo, setAppNo] = useState('');
  const [password, setPassword] = useState('');
  const [warning, setWarning] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('admintoken')) {
      navigate('/addquiz');
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setWarning('');

    fetch('/admin/adminlogin', {
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
          localStorage.setItem('admintoken', body.authtoken);
          navigate('/addquiz');
        } else if (body.status === 2) {
          setWarning('Already submitted');
        } else {
          setWarning('Invalid Credentials');
        }
      })
      .catch(() => {
        setWarning('Network error signing in');
      });
  };

  return (
    <div className="font-sans bg-slate-950 text-slate-100 flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900">
      <div className="w-full max-w-md p-8 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-slate-700/80">
        <div className="flex justify-center mb-6">
          <img className="h-20 w-auto object-contain filter drop-shadow-lg" src="/public/assets/Indian_Institute_of_Information_Technology,_Bhagalpur_logo.png" alt="IIIT Bhagalpur" />
        </div>
        <div className="text-center mb-8">
          <h3 className="text-lg font-bold leading-snug tracking-tight text-white">Indian Institute of Information Technology Bhagalpur</h3>
          <p className="text-xs text-slate-400 mt-1 font-medium tracking-wide uppercase">Admin Console Login</p>
        </div>
        
        {warning && (
          <div className="mb-5 p-3.5 bg-red-950/40 border border-red-900/60 rounded-lg text-red-400 text-sm font-medium text-center shadow-inner">
            {warning}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="applicationNo" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Admin ID</label>
            <input
              id="applicationNo"
              type="text"
              className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 transition duration-150"
              placeholder="Enter admin credentials"
              value={appNo}
              onChange={(e) => setAppNo(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 transition duration-150"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full py-3 bg-white text-slate-950 hover:bg-slate-100 active:scale-[0.98] rounded-lg text-sm font-semibold tracking-wide cursor-pointer transition-all duration-150 shadow-lg shadow-black/20 mt-6">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
