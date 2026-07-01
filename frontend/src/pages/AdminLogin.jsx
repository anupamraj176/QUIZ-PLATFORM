import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const [appNo, setAppNo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [warning, setWarning] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('admintoken')) {
      navigate('/addquiz');
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setWarning('');
    setIsLoading(true);

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
          setWarning('This application has already been submitted.');
        } else {
          setWarning('Incorrect admin ID or password.');
          setPassword('');
        }
      })
      .catch(() => {
        setWarning('Could not reach the server. Check your connection and try again.');
      })
      .finally(() => setIsLoading(false));
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
        <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-semibold">Administrative Control Panel</p>
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
          <h2 className="text-center font-bold text-gray-800 text-lg border-b border-gray-100 pb-3">Administrator Sign In</h2>
          <div>
            <label htmlFor="applicationNo" className="text-sm font-semibold text-gray-700 block mb-1">
              Admin ID
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
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="w-full p-2.5 pr-10 custom-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-black hover:bg-gray-900 text-white rounded-lg cursor-pointer font-bold text-sm transition duration-150 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading && (
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;