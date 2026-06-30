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
    <div className="font-sans bg-slate-950 text-slate-200 min-h-screen p-6 md:p-12 max-w-7xl mx-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-center justify-between border-b border-slate-800 pb-6 mb-8 gap-4">
        <div className="flex items-center gap-4">
          <img src="/public/assets/Indian_Institute_of_Information_Technology,_Bhagalpur_logo.png" alt="IIIT Bhagalpur" className="h-16 w-auto object-contain" />
          <div>
            <h3 className="text-base md:text-lg font-bold text-white leading-tight">Indian Institute of Information Technology Bhagalpur</h3>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Admin Results & Candidates Manager</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/addquiz')}
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-xs font-semibold rounded-lg tracking-wide shadow-md transition cursor-pointer"
          >
            Manage Questions
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('admintoken');
              navigate('/admin');
            }}
            className="px-4 py-2 bg-red-650/10 hover:bg-red-650/20 text-red-400 border border-red-900/30 text-xs font-semibold rounded-lg tracking-wide shadow-md transition cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Toolbar Area */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Stream</label>
          <select
            value={stream}
            onChange={(e) => setStream(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
          >
            <option value={config.CSEvalue}>{config.CSEvalue}</option>
            <option value={config.ECEvalue}>{config.ECEvalue}</option>
            <option value={config.MEAvalue}>{config.MEAvalue}</option>
            <option value={config.Mathvalue}>{config.Mathvalue}</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Program</label>
          <select
            value={program}
            onChange={(e) => setProgram(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
          >
            <option value="MTech">MTech</option>
            <option value="PhD">PhD</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Search Candidate</label>
          <input
            type="text"
            placeholder="Search by ID, name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={downloadAllResults}
            disabled={downloading}
            className="w-full py-2.5 bg-white text-slate-950 hover:bg-slate-100 font-bold rounded-xl text-xs tracking-wider cursor-pointer shadow-md transition duration-150 disabled:opacity-50"
          >
            {downloading ? 'Downloading...' : 'Export Results Excel'}
          </button>
        </div>
      </div>

      {/* Candidates Data Table */}
      <div className="bg-slate-900/30 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="py-4 px-6">Sl No</th>
                <th className="py-4 px-6">Application No</th>
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Stream</th>
                <th className="py-4 px-6">Score</th>
                <th className="py-4 px-6 text-center">Sheet Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs md:text-sm font-sans">
              {filteredCandidates.map((c, idx) => (
                <tr
                  key={c._id}
                  className="hover:bg-slate-900/20 transition-colors"
                >
                  <td className="py-4 px-6 text-slate-400 font-medium">{idx + 1}</td>
                  <td className="py-4 px-6 text-white font-semibold">{c.applicationNo}</td>
                  <td className="py-4 px-6 text-slate-200">{c.name}</td>
                  <td className="py-4 px-6 text-slate-300">{c.program}</td>
                  <td className="py-4 px-6 text-slate-300">{c.stream}</td>
                  <td className="py-4 px-6">
                    <span className="bg-green-500/10 px-2.5 py-1 border border-green-500/20 text-green-400 font-bold rounded-md">
                      {c.marks !== undefined ? c.marks : 0}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => navigate(`/submitform?user=${c._id}`)}
                      className="px-4 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold rounded-lg tracking-wide transition cursor-pointer"
                    >
                      View Sheet
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCandidates.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500 font-medium">
                    No candidates found for the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ParticipantsList;
