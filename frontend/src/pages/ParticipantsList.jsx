import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

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
        toast.error('Error: ' + err.message);
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

  if (!config) return <div className="min-h-screen bg-white text-center p-12 text-gray-500">Loading candidate index...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans pb-10">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 py-4 px-4 md:px-8 flex flex-col sm:flex-row justify-between items-center sticky top-0 z-50 shadow-sm shrink-0 gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 text-center sm:text-left">Candidate Database</h1>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={downloadAllResults}
            disabled={downloading}
            className="border border-gray-300 px-4 py-2 rounded-lg bg-black hover:bg-gray-900 text-white text-sm md:text-base font-semibold transition cursor-pointer disabled:opacity-50"
          >
            {downloading ? 'Downloading...' : 'Download Excel Results'}
          </button>
          <button
            onClick={() => navigate('/addquiz')}
            className="border border-gray-300 px-4 py-2 rounded-lg bg-white text-sm md:text-base hover:bg-gray-50 text-gray-700 font-semibold transition cursor-pointer"
          >
            Back to Questions
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="w-[95%] mx-auto mt-6 mb-6 flex flex-col gap-4 bg-white p-5 border border-gray-200 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap text-sm">
            <span className="font-bold text-gray-500 mr-2">Filter Stream:</span>
            {config && [config.CSEvalue, config.ECEvalue, config.MEAvalue, config.Mathvalue].map((s) => (
              <button
                key={s}
                onClick={() => setStream(s)}
                className={`px-4 py-2 text-xs font-semibold border rounded-lg cursor-pointer transition duration-150 ${
                  stream === s
                    ? 'bg-black text-white border-black'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-350 hover:bg-gray-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap text-sm">
            <span className="font-bold text-gray-500 mr-2">Program:</span>
            {['MTech', 'PhD'].map((p) => (
              <button
                key={p}
                onClick={() => setProgram(p)}
                className={`px-4 py-2 text-xs font-semibold border rounded-lg cursor-pointer transition duration-150 ${
                  program === p
                    ? 'bg-black text-white border-black'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-350 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Search candidates by name, stream, or application number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2.5 px-4 custom-input"
          />
        </div>
      </div>

      {/* Candidates Data Table */}
      <div className="w-[95%] mx-auto overflow-hidden border border-gray-200 rounded-2xl shadow-md bg-white mb-10">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">S.No.</th>
              <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Application No.</th>
              <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Name</th>
              <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Program</th>
              <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Department</th>
              <th className="p-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500">Marks Obtained</th>
              <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Submission</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredCandidates.map((c, idx) => (
              <tr key={c._id} className="hover:bg-gray-55/80 transition duration-150">
                <td className="p-4 text-sm text-gray-700">{idx + 1}</td>
                <td className="p-4 text-sm font-semibold text-gray-800">{c.applicationNo}</td>
                <td className="p-4 text-sm text-gray-700 font-medium">{c.name || "—"}</td>
                <td className="p-4 text-sm text-gray-600">{c.program}</td>
                <td className="p-4 text-sm text-gray-600">{c.stream}</td>
                <td className="p-4 text-sm font-bold text-center text-gray-800">{c.marks !== undefined ? c.marks : 0}</td>
                <td className="p-4 text-sm">
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); navigate(`/submitform?user=${c._id}`); }}
                    className="inline-block px-3 py-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition cursor-pointer"
                  >
                    View Response
                  </a>
                </td>
              </tr>
            ))}
            {filteredCandidates.length === 0 && (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-400 text-sm">
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
