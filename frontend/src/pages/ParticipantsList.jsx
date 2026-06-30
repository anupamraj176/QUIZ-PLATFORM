import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ParticipantsList() {
  const [candidates, setCandidates] = useState([]);
  const [stream, setStream] = useState('Computer Science Engineering');
  const [program, setProgram] = useState('MTech');
  const [search, setSearch] = useState('');
  const [config, setConfig] = useState(null);
  const [downloading, setDownloading] = useState(false);
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

    loadCandidates();
  }, [stream, program, navigate]);

  const loadCandidates = () => {
    const adminToken = localStorage.getItem('admintoken');
    fetch('/user/sendParticipant', {
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
          setCandidates(res.data);
        } else {
          localStorage.removeItem('admintoken');
          navigate('/admin');
        }
      });
  };

  const downloadAllResults = () => {
    const adminToken = localStorage.getItem('admintoken');
    setDownloading(true);

    fetch('/admin/result/downloadExcel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth_token': adminToken,
      },
      body: JSON.stringify({ stream, program }),
    })
      .then((res) => {
        if (res.status === 200) return res.blob();
        throw new Error('Excel conversion failed');
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Results_${stream.replace(/\s+/g, '_')}_${program}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setDownloading(false);
      })
      .catch((err) => {
        alert('Error: ' + err.message);
        setDownloading(false);
      });
  };

  const filteredCandidates = candidates.filter((c) => {
    const val = search.toLowerCase();
    return (
      c.applicationNo.toLowerCase().includes(val) ||
      c.name.toLowerCase().includes(val) ||
      (c.stream && c.stream.toLowerCase().includes(val))
    );
  });

  if (!config) return <div className="text-center p-12 text-slate-400">Loading candidate index...</div>;

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-10">
      {/* Top Header */}
      <div className="header flex justify-between items-center w-[95%] mx-auto py-4 border-b-2 border-black mb-6">
        <div className="heading">
          <h1 className="text-[28px] font-bold">Participants List</h1>
        </div>
        <div className="flex gap-4">
          <div className="bg-[#d6d4d2] px-[20px] py-[10px] cursor-pointer hover:bg-gray-300 border border-black">
            <a href="#" onClick={(e) => { e.preventDefault(); localStorage.removeItem('admintoken'); navigate('/admin'); }}>logout</a>
          </div>
          <div className="bg-[#d6d4d2] px-[20px] py-[10px] cursor-pointer hover:bg-gray-300 border border-black">
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/addquiz'); }}>Manage Questions</a>
          </div>
        </div>
      </div>

      {/* Toolbar Area */}
      <div className="w-[90%] mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <label className="font-bold text-[14px]">Stream:</label>
          <select
            value={stream}
            onChange={(e) => setStream(e.target.value)}
            className="p-[8px] border border-gray-400 bg-white text-black text-[16px]"
          >
            <option value={config.CSEvalue}>{config.CSEvalue}</option>
            <option value={config.ECEvalue}>{config.ECEvalue}</option>
            <option value={config.MEAvalue}>{config.MEAvalue}</option>
            <option value={config.Mathvalue}>{config.Mathvalue}</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-bold text-[14px]">Program:</label>
          <select
            value={program}
            onChange={(e) => setProgram(e.target.value)}
            className="p-[8px] border border-gray-400 bg-white text-black text-[16px]"
          >
            <option value="MTech">MTech</option>
            <option value="PhD">PhD</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-bold text-[14px]">Search Candidate:</label>
          <input
            type="text"
            placeholder="Search by ID, name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-[8px] border border-gray-400 bg-white text-black text-[16px]"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={downloadAllResults}
            disabled={downloading}
            className="w-full p-[10px] bg-gray-200 hover:bg-gray-300 border border-black text-[14px] font-bold cursor-pointer disabled:opacity-50"
          >
            {downloading ? 'Downloading...' : 'Export Results Excel'}
          </button>
        </div>
      </div>

      {/* Candidates Data Table */}
      <div id="participantsDatadesign" className="w-[90%] mx-auto overflow-x-auto my-6">
        <table className="border-2 border-black border-collapse w-full">
          <thead>
            <tr className="bg-gray-150">
              <th className="border-2 border-black p-[5px] px-[10px] text-left text-[16px] font-bold">Sl No</th>
              <th className="border-2 border-black p-[5px] px-[10px] text-left text-[16px] font-bold">Application No</th>
              <th className="border-2 border-black p-[5px] px-[10px] text-left text-[16px] font-bold">Name</th>
              <th className="border-2 border-black p-[5px] px-[10px] text-left text-[16px] font-bold">Category</th>
              <th className="border-2 border-black p-[5px] px-[10px] text-left text-[16px] font-bold">Stream</th>
              <th className="border-2 border-black p-[5px] px-[10px] text-left text-[16px] font-bold">Score</th>
              <th className="border-2 border-black p-[5px] px-[10px] text-center text-[16px] font-bold">Sheet Review</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.map((c, idx) => (
              <tr key={c._id} className="hover:bg-gray-50">
                <td className="border-2 border-black p-[5px] px-[10px] text-[16px]">{idx + 1}</td>
                <td className="border-2 border-black p-[5px] px-[10px] text-[16px] font-semibold">{c.applicationNo}</td>
                <td className="border-2 border-black p-[5px] px-[10px] text-[16px]">{c.name}</td>
                <td className="border-2 border-black p-[5px] px-[10px] text-[16px]">{c.program}</td>
                <td className="border-2 border-black p-[5px] px-[10px] text-[16px]">{c.stream}</td>
                <td className="border-2 border-black p-[5px] px-[10px] text-[16px] font-bold text-green-700">
                  {c.marks !== undefined ? c.marks : 0}
                </td>
                <td className="border-2 border-black p-[5px] px-[10px] text-center text-[16px]">
                  <button
                    onClick={() => navigate(`/submitform?user=${c._id}`)}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 border border-black text-[14px] cursor-pointer"
                  >
                    View Sheet
                  </button>
                </td>
              </tr>
            ))}
            {filteredCandidates.length === 0 && (
              <tr>
                <td colSpan="7" className="border-2 border-black p-[20px] text-center text-gray-500 text-[16px]">
                  No candidates found for the selected filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ParticipantsList;
