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
    <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-[420px]">
        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="h-px w-8 bg-[#D9D4C7]" />
          <span className="text-[11px] tracking-[0.2em] uppercase text-[#8B8579] font-medium">
            Administration
          </span>
          <span className="h-px w-8 bg-[#D9D4C7]" />
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E3DFD3] relative">
          <div className="h-[3px] bg-[#7A2230]" />

          <div className="px-8 sm:px-10 py-10">
            {/* Seal mark */}
            <div className="flex justify-center mb-5">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" stroke="#7A2230" strokeWidth="1.25" />
                <circle cx="20" cy="20" r="13" stroke="#7A2230" strokeWidth="1" />
                <path d="M20 11 L20 29 M11 20 L29 20" stroke="#7A2230" strokeWidth="1" />
              </svg>
            </div>

            <h1 className="text-center font-serif text-[24px] font-semibold text-[#1C1B19] leading-tight">
              Administrator Sign In
            </h1>
            <p className="text-center text-[13px] text-[#8B8579] mt-2 mb-7">
              Enter your credentials to manage quizzes and content.
            </p>

            {warning && (
              <div
                role="alert"
                aria-live="polite"
                className="flex items-start gap-2.5 border-l-2 border-[#7A2230] bg-[#7A2230]/[0.04] px-3.5 py-2.5 mb-6"
              >
                <svg
                  className="mt-[2px] shrink-0"
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <circle cx="8" cy="8" r="7" stroke="#7A2230" strokeWidth="1.3" />
                  <path d="M8 4.5V8.5" stroke="#7A2230" strokeWidth="1.3" strokeLinecap="round" />
                  <circle cx="8" cy="11" r="0.8" fill="#7A2230" />
                </svg>
                <span className="text-[13.5px] text-[#5A2024] leading-snug">{warning}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-5">
                <label
                  htmlFor="applicationNo"
                  className="block text-[13px] font-medium text-[#1C1B19] mb-1.5"
                >
                  Admin ID
                </label>
                <input
                  id="applicationNo"
                  type="text"
                  autoComplete="username"
                  className="w-full text-[15px] border border-[#D9D4C7] px-3 py-2.5 bg-white focus:outline-none focus:border-[#7A2230] focus:ring-1 focus:ring-[#7A2230]/25 transition-colors"
                  value={appNo}
                  onChange={(e) => setAppNo(e.target.value)}
                  required
                />
              </div>

              <div className="mb-7">
                <label
                  htmlFor="password"
                  className="block text-[13px] font-medium text-[#1C1B19] mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="w-full text-[15px] border border-[#D9D4C7] px-3 py-2.5 pr-10 bg-white focus:outline-none focus:border-[#7A2230] focus:ring-1 focus:ring-[#7A2230]/25 transition-colors"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-0 top-0 h-full px-3 text-[#8B8579] hover:text-[#1C1B19] transition-colors"
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M3 3l18 18M10.6 10.6a3 3 0 004.24 4.24M9.5 5.2A10.7 10.7 0 0112 5c5 0 9 4 10 7-.4 1.2-1.2 2.6-2.4 3.9M6.3 6.7C4.2 8.1 2.7 10 2 12c1 3 5 7 10 7 1.3 0 2.6-.3 3.7-.7"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1C1B19] text-[#FAF8F3] py-2.75 text-[14px] font-medium tracking-wide hover:bg-[#7A2230] disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading && (
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeOpacity="0.25"
                    />
                    <path
                      d="M21 12a9 9 0 00-9-9"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                {isLoading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-[11.5px] text-[#8B8579] mt-6 tracking-wide">
          Restricted to authorized college staff
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;