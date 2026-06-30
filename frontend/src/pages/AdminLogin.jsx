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
    <div className="min-h-screen bg-white text-black py-20 px-4 font-sans flex flex-col items-center justify-center">
      {warning && (
        <div className="text-red-600 font-bold mb-3 text-[18px]">
          {warning}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="border-2 border-black p-[20px] w-full max-w-[450px]"
      >
        <h3 className="text-center text-[22px] font-bold mb-4">Admin Login</h3>
        <div className="m-[10px]">
          <label htmlFor="applicationNo" className="text-[18px] block mb-1">
            Admin Id:{" "}
          </label>
          <input
            id="applicationNo"
            type="text"
            className="w-[96%] text-[20px] border border-gray-400 px-2 py-1 focus:outline-none focus:border-black"
            value={appNo}
            onChange={(e) => setAppNo(e.target.value)}
            required
          />
        </div>
        <div className="m-[10px]">
          <label htmlFor="password" className="text-[18px] block mb-1">
            Password:{" "}
          </label>
          <input
            type="password"
            id="password"
            className="w-[96%] text-[20px] border border-gray-400 px-2 py-1 focus:outline-none focus:border-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="m-[10px] text-center mt-6">
          <input
            type="submit"
            value="Login"
            className="px-[20px] py-[8px] bg-gray-200 hover:bg-gray-300 border border-black cursor-pointer font-medium text-[16px]"
          />
        </div>
      </form>
    </div>
  );
}

export default AdminLogin;
