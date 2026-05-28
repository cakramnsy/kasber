import React, { useState } from 'react';

export default function ProfilePage({ setIsProfileMode, activeUserKey, setUserProfile }) {
  const [adminName, setAdminName] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);

  const executeSaveProfile = () => {
    const profileData = {
      adminName,
      institutionName,
      academicYear
    };
    localStorage.setItem(`kasber_profile_${activeUserKey}`, JSON.stringify(profileData));
    localStorage.removeItem('kasber_in_profile_setup');
    
    setUserProfile(profileData);
    setIsProfileMode(false);
    setShowProfileModal(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#121212] antialiased flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-[32px] p-8 border border-gray-200/70 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-black">Isi Biodata dulu yuk!</h1>
          <p className="text-sm text-gray-400 mt-1">Lengkapi profil pengelolaan kas Anda</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); setShowProfileModal(true); }} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 tracking-wider block mb-1.5 pl-1">Nama Bendahara / Admin</label>
            <input
              type="text"
              placeholder="Masukkan nama Anda"
              maxLength="30"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-normal text-black focus:outline-none focus:border-black focus:border-2 focus:bg-white transition-all"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 tracking-wider block mb-1.5 pl-1">Nama Instansi</label>
            <input
              type="text"
              placeholder="Masukkan nama instansi"
              maxLength="30"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-normal text-black focus:outline-none focus:border-black focus:border-2 focus:bg-white transition-all"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 tracking-wider block mb-1.5 pl-1">Tahun Ajaran / Angkatan</label>
            <input
              type="text"
              placeholder="Contoh: 2026"
              maxLength="4"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-normal text-black focus:outline-none focus:border-black focus:border-2 focus:bg-white transition-all"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-black hover:bg-neutral-900 text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-sm mt-4 active:scale-[0.98]"
          >
            Lanjutkan
          </button>
        </form>
      </div>

      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowProfileModal(false)}></div>
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl border border-gray-100 z-10">
            <h4 className="text-sm font-semibold tracking-tight text-gray-950 mb-1">Apakah sudah benar?</h4>
            <p className="text-[11px] font-medium text-gray-400 mb-5">Pastikan data profil telah sesuai.</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                Belum
              </button>
              <button
                type="button"
                onClick={executeSaveProfile}
                className="w-full bg-black hover:bg-neutral-900 text-white py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all"
              >
                Sudah
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}