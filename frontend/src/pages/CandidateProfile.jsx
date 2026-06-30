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
    <div className="min-h-screen bg-white text-black py-6 font-sans">
      <div className="w-[100px] h-[100px] mx-auto p-[10px] flex items-center justify-center">
        <img
          src="/assets/Indian_Institute_of_Information_Technology,_Bhagalpur_logo.png"
          alt="IIIT Bhagalpur Logo"
          className="max-w-full max-h-full"
        />
      </div>
      <div className="w-fit mx-auto text-center mb-6">
        <h3 className="text-[20px] font-normal">IIIT Bhagalpur</h3>
      </div>
      <div className="flex flex-col items-center justify-center">
        {warning && (
          <div className="text-red-600 font-bold mb-3 text-[16px]">
            {warning}
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="border-2 border-black p-[20px] w-full max-w-[60%] min-w-[300px]"
        >
          <h2 className="text-center text-[24px] font-bold mb-4">Fill your details</h2>
          
          <div className="m-[10px] flex flex-col">
            <label htmlFor="name" className="text-[16px] mb-1 font-semibold">Name: </label>
            <input
              id="name"
              type="text"
              className="w-[96%] text-[16px] border border-gray-400 p-[5px] focus:outline-none focus:border-black"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="m-[10px] flex flex-col">
            <label htmlFor="program" className="text-[16px] mb-1 font-semibold">Category of Post: </label>
            <select
              id="program"
              className="w-[96%] text-[16px] border border-gray-400 p-[5px] focus:outline-none focus:border-black bg-white"
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

          <div className="m-[10px] flex flex-col">
            <label htmlFor="stream" className="text-[16px] mb-1 font-semibold">Post applied for: </label>
            <select
              id="stream"
              className="w-[96%] text-[16px] border border-gray-400 p-[5px] focus:outline-none focus:border-black bg-white"
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

          <div className="m-[10px] text-center mt-6">
            <input
              type="submit"
              value="Next"
              className="px-[20px] py-[8px] bg-gray-200 hover:bg-gray-300 border border-black cursor-pointer text-[16px]"
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export default CandidateProfile;
