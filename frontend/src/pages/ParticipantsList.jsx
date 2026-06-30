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

  if (!config) return <div className="min-h-screen bg-white text-center p-12 text-gray-500">Loading candidate index...</div>;

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-10">
      {/* Top Header */}
      <div className="flex justify-between items-center w-[95%] mx-auto py-4 border-b-2 border-black mb-6">
        <h1 className="text-[22px] font-bold">Candidate Database</h1>
        <div className="flex gap-3">
          <button
            onClick={downloadAllResults}
            disabled={downloading}
            className="px-[20px] py-[8px] bg-black text-white font-bold text-[14px] cursor-pointer disabled:opacity-50 hover:bg-gray-800"
          >
            {downloading ? 'Downloading...' : 'Download Excel Results'}
          </button>
          <button
            onClick={() => navigate('/addquiz')}
            className="px-[20px] py-[8px] bg-white text-black font-bold text-[14px] border border-black cursor-pointer hover:bg-gray-100"
          >
            Back to Questions
          </button>
        </div>
      </div>

      {/* Filter Stream Tabs */}
      <div className="w-[95%] mx-auto mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[14px] font-semibold text-gray-600 mr-2">Filter Stream:</span>
          {config && [config.CSEvalue, config.ECEvalue, config.MEAvalue, config.Mathvalue].map((s) => (
            <button
              key={s}
              onClick={() => setStream(s)}
              className={`px-[14px] py-[6px] text-[13px] font-medium border cursor-pointer transition ${
                stream === s
                  ? 'border-black bg-white text-black'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Candidates Data Table */}
      <div className="w-[95%] mx-auto overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="p-[10px] text-left text-[13px] font-bold uppercase tracking-wider text-gray-700">S.No.</th>
              <th className="p-[10px] text-left text-[13px] font-bold uppercase tracking-wider text-gray-700">Application No.</th>
              <th className="p-[10px] text-left text-[13px] font-bold uppercase tracking-wider text-gray-700">Name</th>
              <th className="p-[10px] text-left text-[13px] font-bold uppercase tracking-wider text-gray-700">Program</th>
              <th className="p-[10px] text-left text-[13px] font-bold uppercase tracking-wider text-gray-700">Department</th>
              <th className="p-[10px] text-left text-[13px] font-bold uppercase tracking-wider text-gray-700">Marks Obtained</th>
              <th className="p-[10px] text-left text-[13px] font-bold uppercase tracking-wider text-gray-700">Submission</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.map((c, idx) => (
              <tr key={c._id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-[10px] text-[14px]">{idx + 1}</td>
                <td className="p-[10px] text-[14px]">{c.applicationNo}</td>
                <td className="p-[10px] text-[14px]">{c.name}</td>
                <td className="p-[10px] text-[14px]">{c.program}</td>
                <td className="p-[10px] text-[14px]">{c.stream}</td>
                <td className="p-[10px] text-[14px] text-center">{c.marks !== undefined ? c.marks : 0}</td>
                <td className="p-[10px] text-[14px]">
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); navigate(`/submitform?user=${c._id}`); }}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    View Response
                  </a>
                </td>
              </tr>
            ))}
            {filteredCandidates.length === 0 && (
              <tr>
                <td colSpan="7" className="p-[20px] text-center text-gray-500 text-[14px]">
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
