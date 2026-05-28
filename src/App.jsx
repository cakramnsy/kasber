import React, { useState, useEffect } from 'react';

export default function App() {

  // --- STATE OTENTIKASI (LOGIN) ---
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('kasber_logged_in') === 'true';
  });

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [loginError, setLoginError] = useState(''); 
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); 

  // --- STATE BIODATA PROFIL ---
  const [isProfileMode, setIsProfileMode] = useState(() => {
    return localStorage.getItem('kasber_in_profile_setup') === 'true';
  });
  const [adminName, setAdminName] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Ambil email user yang sedang aktif login untuk dijadikan kunci unik di localStorage
  const [activeUserKey, setActiveUserKey] = useState(() => {
    const user = localStorage.getItem('kasber_user');
    return user ? JSON.parse(user).email : 'admin@kasber.com';
  });

  // Ambil profil user aktif dari localStorage jika sudah pernah diisi
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem(`kasber_profile_${activeUserKey}`);
    return saved ? JSON.parse(saved) : null;
  });

  // --- STATE MODAL SALDO AWAL ---
  const [initialAmount, setInitialAmount] = useState('');
  const [showInitialBalanceModal, setShowInitialBalanceModal] = useState(false);

  // --- STATE TRANSAKSI & INPUT UTAMA ---
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('Makan');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false); 
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [showCommitModal, setShowCommitModal] = useState(false);

  // --- STATE TRANSAKSI UTAMA ---
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem(`kasber_tx_${activeUserKey}`);
    return saved ? JSON.parse(saved) : [];
  });

  // --- EFEK UNTUK MENGUBAH JUDUL TAB BROWSER ---
  useEffect(() => {
    document.title = "KASBER - Kas Bersama (Beta)";
  }, []);

  // Efek untuk mendeteksi kelayakan memunculkan modal saldo awal secara tepat waktu
  useEffect(() => {
    if (isLoggedIn && !isProfileMode) {
      const hasProfile = localStorage.getItem(`kasber_profile_${activeUserKey}`);
      const hasSetInitial = localStorage.getItem(`kasber_initial_balance_set_${activeUserKey}`);
      
      if (hasProfile && hasSetInitial !== 'true') {
        setShowInitialBalanceModal(true);
      }
    }
  }, [isLoggedIn, isProfileMode, activeUserKey]);

  // Sinkronisasi data transaksi berdasarkan user yang aktif ke localStorage
  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem(`kasber_tx_${activeUserKey}`, JSON.stringify(transactions));
    }
  }, [transactions, activeUserKey, isLoggedIn]);

  // Efek dinamis untuk memperbarui transaksi dan profil ketika user key berubah (ganti akun)
  useEffect(() => {
    const savedProfile = localStorage.getItem(`kasber_profile_${activeUserKey}`);
    const parsedProfile = savedProfile ? JSON.parse(savedProfile) : null;
    setUserProfile(parsedProfile);

    const savedTx = localStorage.getItem(`kasber_tx_${activeUserKey}`);
    setTransactions(savedTx ? JSON.parse(savedTx) : []);
    
    // Reset form profil internal agar tidak membawa data user sebelumnya
    if (parsedProfile) {
      setAdminName(parsedProfile.adminName || '');
      setInstitutionName(parsedProfile.institutionName || '');
      setAcademicYear(parsedProfile.academicYear || '');
    } else {
      setAdminName('');
      setInstitutionName('');
      setAcademicYear('');
    }
  }, [activeUserKey]);

  // --- FUNGSI LOGIN & DAFTAR ---
  const handleLogin = (e) => {
    e.preventDefault();
    const allUsers = JSON.parse(localStorage.getItem('kasber_users_list')) || [];
    
    // Cek akun master default bawaan sistem jika daftar user masih kosong
    if (allUsers.length === 0 && username === 'admin@kasber.com' && password === 'admin123') {
      const defaultEmail = 'admin@kasber.com';
      localStorage.setItem('kasber_user', JSON.stringify({ email: defaultEmail }));
      localStorage.setItem('kasber_logged_in', 'true');
      
      setActiveUserKey(defaultEmail);
      setIsLoggedIn(true);
      setLoginError('');
      return;
    }

    const matchedUser = allUsers.find(user => user.email.toLowerCase() === username.toLowerCase() && user.password === password);

    if (matchedUser) {
      localStorage.setItem('kasber_user', JSON.stringify({ email: matchedUser.email }));
      localStorage.setItem('kasber_logged_in', 'true');
      
      // Update key pemicu sebelum mengubah state login untuk mencegah data bocor lintas akun
      setActiveUserKey(matchedUser.email);
      
      const hasProfile = localStorage.getItem(`kasber_profile_${matchedUser.email}`);
      if (!hasProfile) {
        localStorage.setItem('kasber_in_profile_setup', 'true');
        setIsProfileMode(true);
      } else {
        localStorage.removeItem('kasber_in_profile_setup');
        setIsProfileMode(false);
      }
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Email atau password salah.');
    }
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    if (!username || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setLoginError('Password dan konfirmasi password tidak cocok.');
      return;
    }

    const allUsers = JSON.parse(localStorage.getItem('kasber_users_list')) || [];
    const isEmailExist = allUsers.some(user => user.email.toLowerCase() === username.toLowerCase());
    if (isEmailExist) {
      setLoginError('Email sudah terdaftar! Gunakan email lain.');
      return;
    }

    const newUser = { email: username, password: password };
    allUsers.push(newUser);
    localStorage.setItem('kasber_users_list', JSON.stringify(allUsers));
    
    localStorage.setItem('kasber_user', JSON.stringify({ email: username }));
    localStorage.setItem('kasber_logged_in', 'true');
    localStorage.setItem('kasber_in_profile_setup', 'true');
    
    // Paksa transaksi langsung kosong untuk user baru sebelum siklus effect memuat data lama
    setTransactions([]); 
    setActiveUserKey(username);
    setIsProfileMode(true); 
    setIsLoggedIn(true);
    
    setLoginError('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleGoogleAuth = () => {
    const googleUserEmail = "user.google@gmail.com"; 
    
    const allUsers = JSON.parse(localStorage.getItem('kasber_users_list')) || [];
    const isEmailExist = allUsers.some(user => user.email.toLowerCase() === googleUserEmail.toLowerCase());

    if (!isEmailExist) {
      const newUser = { email: googleUserEmail, password: 'google_oauth_account' };
      allUsers.push(newUser);
      localStorage.setItem('kasber_users_list', JSON.stringify(allUsers));
    }

    localStorage.setItem('kasber_user', JSON.stringify({ email: googleUserEmail }));
    localStorage.setItem('kasber_logged_in', 'true');
    
    setTransactions([]);
    setActiveUserKey(googleUserEmail);

    const hasProfile = localStorage.getItem(`kasber_profile_${googleUserEmail}`);
    if (!hasProfile) {
      localStorage.setItem('kasber_in_profile_setup', 'true');
      setIsProfileMode(true);
    } else {
      localStorage.removeItem('kasber_in_profile_setup');
      setIsProfileMode(false);
    }
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('kasber_logged_in');
    localStorage.removeItem('kasber_in_profile_setup');
    
    setIsLoggedIn(false);
    setIsProfileMode(false);
    setShowLogoutModal(false);
    setUsername('');
    setPassword('');
  };

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

  // --- FUNGSI SUBMIT SALDO AWAL ---
  const handleSaveInitialBalance = (e) => {
    e.preventDefault();
    const cleanAmount = Number(initialAmount.replace(/\./g, ''));
    const finalAmount = isNaN(cleanAmount) ? 0 : cleanAmount;

    let updatedTransactions = [...transactions];

    if (finalAmount > 0) {
      const now = new Date();
      const formattedDate = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      const formattedTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

      const initialTx = {
        id: Date.now(),
        text: 'Saldo Awal',
        amount: finalAmount,
        type: 'income',
        category: 'Lainnya',
        date: `${formattedDate} • ${formattedTime}`
      };
      
      updatedTransactions = [initialTx, ...transactions];
      setTransactions(updatedTransactions);
    }

    localStorage.setItem(`kasber_tx_${activeUserKey}`, JSON.stringify(updatedTransactions));
    localStorage.setItem(`kasber_initial_balance_set_${activeUserKey}`, 'true');
    setShowInitialBalanceModal(false);
    setInitialAmount('');
  };

  // --- FUNGSI LOGIKA UTAMA APLIKASI ---
  const getFormattedDateString = (dateObj) => {
    return dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const getNavigationLabel = (dateObj) => {
    const todayStr = getFormattedDateString(new Date());
    const currentStr = getFormattedDateString(dateObj);
    
    if (todayStr === currentStr) {
      return `${currentStr} (Hari Ini)`;
    }
    return currentStr;
  };

  const changeDate = (daysToAdd) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + daysToAdd);
    setSelectedDate(newDate);
  };

  const filteredTransactions = transactions.filter((t) => {
    const txDatePart = t.date.split(' • ')[0].trim();
    const targetDateStr = getFormattedDateString(selectedDate);
    return txDatePart === targetDateStr;
  });

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const balance = income - expense;

  const handleAddTransactionTrigger = (e) => {
    e.preventDefault();
    if (!text || !amount || !type) return;
    setShowCommitModal(true);
  };

  const executeAddTransaction = () => {
    const cleanAmount = Number(amount.replace(/\./g, ''));
    if (isNaN(cleanAmount) || cleanAmount <= 0) return;

    const formattedDate = selectedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    const formattedTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const newTx = {
      id: Date.now(),
      text,
      amount: type === 'expense' ? -Math.abs(cleanAmount) : cleanAmount,
      type,
      category,
      date: `${formattedDate} • ${formattedTime}`
    };

    setTransactions([newTx, ...transactions]);
    setText('');
    setAmount('');
    setType('');
    setShowCommitModal(false);
  };

  const triggerDeleteConfirmation = (id) => {
    setDeleteTargetId(id);
  };

  const executeDeleteTransaction = () => {
    if (deleteTargetId) {
      setTransactions(transactions.filter(t => t.id !== deleteTargetId));
      setDeleteTargetId(null);
    }
  };

  // --- LAYOUT FORM AUTH (LOGIN / DAFTAR) ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] text-[#121212] antialiased flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-[32px] p-8 border border-gray-200/70 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold tracking-tight text-black">KASBER</h1>
            <p className="text-sm font-medium text-gray-400 tracking-normal mt-1">
              {isSignUpMode ? 'Daftar Akun Baru' : 'Kelola Uang Kas'}
            </p>
          </div>

          <form onSubmit={isSignUpMode ? handleSignUp : handleLogin} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 tracking-wider block mb-1.5 pl-1">Email</label>
              <input
                type="email"
                placeholder="Masukkan email Anda"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-normal text-black focus:outline-none focus:border-black focus:border-2 focus:bg-white transition-all"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 tracking-wider block mb-1.5 pl-1">Password</label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-11 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-normal text-black focus:outline-none focus:border-black focus:border-2 focus:bg-white transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-gray-400 hover:text-black transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                  )}
                </button>
              </div>
            </div>

            {isSignUpMode && (
              <div>
                <label className="text-[10px] font-bold text-gray-400 tracking-wider block mb-1.5 pl-1">Ketik Ulang Password</label>
                <div className="relative flex items-center">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Ketik ulang password Anda"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-4 pr-11 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-normal text-black focus:outline-none focus:border-black focus:border-2 focus:bg-white transition-all"
                    required={isSignUpMode}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 text-gray-400 hover:text-black transition-colors focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            {loginError && (
              <p className="text-xs font-medium pl-1 text-rose-500">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-black hover:bg-neutral-900 text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-sm mt-4 active:scale-[0.98]"
            >
              {isSignUpMode ? 'Daftar Akun' : 'Masuk'}
            </button>
          </form>

          <div className="my-5 flex items-center justify-between">
            <span className="w-full h-[1px] bg-gray-200"></span>
            <span className="text-[10px] font-bold text-gray-400 tracking-wider block px-3 uppercase">atau</span>
            <span className="w-full h-[1px] bg-gray-200"></span>
          </div>

          <button
            type="button"
            onClick={handleGoogleAuth}
            className="w-full py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {isSignUpMode ? 'Daftar dengan Google' : 'Masuk dengan Google'}
          </button>

          <div className="text-center mt-6 text-[11px] text-gray-400 font-normal">
            {isSignUpMode ? (
              <>
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUpMode(false);
                    setLoginError('');
                    setUsername('');
                    setPassword('');
                    setConfirmPassword('');
                    setShowPassword(false);
                    setShowConfirmPassword(false);
                  }}
                  className="font-bold text-black hover:underline transition-all cursor-pointer"
                >
                  Masuk
                </button>
              </>
            ) : (
              <>
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUpMode(true);
                    setLoginError('');
                    setUsername('');
                    setPassword('');
                    setConfirmPassword('');
                    setShowPassword(false);
                    setShowConfirmPassword(false);
                  }}
                  className="font-semibold text-black hover:underline transition-all cursor-pointer"
                >
                  Daftar sekarang
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- RENDERING HALAMAN ISI BIODATA ---
  if (isLoggedIn && isProfileMode) {
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
              <label className="text-[10px] font-bold text-gray-400 tracking-wider block mb-1.5 pl-1">Nama Sekolah / Perguruan Tinggi / Perusahaan</label>
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
              <label className="text-[10px] font-bold text-gray-400 tracking-wider block mb-1.5 pl-1">Tahun Ajaran / Angkatan / Penerbitan</label>
              <input
                type="text"
                placeholder="Contoh: 2026"
                maxLength="4"
                value={academicYear}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setAcademicYear(val);
                }}
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

        {/* MODAL POP OUT KONFIRMASI PROFILE */}
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowProfileModal(false)}></div>
            <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl border border-gray-100 z-10">
              <h4 className="text-sm font-semibold tracking-tight text-gray-950 mb-1">Apakah sudah benar?</h4>
              <p className="text-[11px] font-medium text-gray-400 mb-5">Pastikan data profil yang dimasukkan telah sesuai.</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Belum
                </button>
                <button
                  type="button"
                  onClick={executeSaveProfile}
                  className="w-full bg-black hover:bg-neutral-900 text-white py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-[0.98] cursor-pointer"
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

  // --- RENDERING HALAMAN UTAMA KASBER ---
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#121212] antialiased">
      <div className="max-w-md w-full mx-auto px-6 py-12">
        
        {/* HEADER BRAND */}
        <header className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-black">KASBER</h1>
            <p className="text-sm font-medium text-gray-400 tracking-normal mt-0.5">Kelola Uang Kas</p>
          </div>
          
          {/* TATA LETAK PROFIL POJOK KANAN ATAS */}
          <div className="flex flex-col items-end text-right gap-2.5">
            <button 
              onClick={() => setShowLogoutModal(true)}
              className="text-[10px] font-extrabold border border-gray-300 text-gray-500 hover:text-black hover:border-black px-3 py-1.5 rounded-full transition-all cursor-pointer"
            >
              Keluar
            </button>
            
            {userProfile ? (
              <div className="mt-1 flex flex-col items-end gap-1.5">
                <div className="flex items-center gap-2 px-1">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="text-black"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="text-lg font-extrabold text-black leading-none">
                    {userProfile.adminName}
                  </span>
                </div>

                <div className="inline-block bg-white border border-gray-200 rounded-xl px-3 py-1">
                  <span className="text-[11px] font-medium uppercase tracking-normal text-gray-600 block">
                    {userProfile.institutionName}
                  </span>
                </div>

                <div className="inline-block bg-white border border-gray-200 rounded-xl px-2.5 py-0.5">
                  <span className="text-[10px] font-medium text-gray-500 block">
                    Th. {userProfile.academicYear}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-1 text-xs font-medium text-gray-400">
                {activeUserKey}
              </div>
            )}
          </div>
        </header>

        {/* KARTU SALDO MODERN UTAMA */}
        <div className="bg-gradient-to-br from-[#111111] via-[#1C1C1E] to-[#2C2C2E] text-white rounded-[32px] p-8 shadow-xl mb-8 border border-white/5">
          <span className="text-sm font-bold tracking-[0.02em] text-gray-400">Saldo</span>
          <h2 className="text-4xl font-extrabold mt-2 tracking-tight">
            Rp. {balance.toLocaleString('id-ID')}
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/10">
            <div>
              <span className="text-[10px] font-bold tracking-wide text-gray-400">↑ Total Masuk</span>
              <p className="text-base font-bold text-white mt-0.5">+{income.toLocaleString('id-ID')}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wide text-gray-400">↓ Total Keluar</span>
              <p className="text-base font-bold text-white mt-0.5">-{expense.toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>

        {/* FORMULIR INPUT TRANSAKSI */}
        <div className="bg-white rounded-[24px] p-6 border border-gray-200/70 shadow-sm mb-8">
          <h3 className="text-sm font-semibold tracking-[0.02em] text-black mb-4">Buat apa nih?</h3>
          
          <form onSubmit={handleAddTransactionTrigger} className="space-y-3.5">
            <div className="flex gap-1 overflow-x-auto py-1 scrollbar-none">
              {['Makan', 'Belanja', 'Transport', 'Hiburan', 'Lainnya'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                    category === cat 
                      ? 'bg-black text-white border-black' 
                      : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="(Catatan)"
              value={text}
              maxLength="30"
              onChange={(e) => setText(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-normal text-black placeholder-gray-400 focus:outline-none focus:border-black focus:border-2 focus:bg-white transition-all"
            />
            
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 relative flex items-center">
                <span className="absolute left-4 text-sm font-normal text-gray-400 pointer-events-none">
                  Rp.
                </span>
                <input
                  type="text"
                  placeholder="(Jumlah)"
                  value={amount}
                  onChange={(e) => {
                    let rawValue = e.target.value.replace(/\D/g, '');
                    if (rawValue.length > 9) {
                      rawValue = rawValue.slice(0, 9);
                    }
                    const formattedValue = rawValue ? Number(rawValue).toLocaleString('id-ID') : '';
                    setAmount(formattedValue);
                  }}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-normal text-black placeholder-gray-400 focus:outline-none focus:border-black focus:border-2 focus:bg-white transition-all"
                />
              </div>
              
              <div className="relative w-full h-full">
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  className={`w-full h-full pl-4 pr-4 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold flex items-center justify-between cursor-pointer focus:outline-none focus:border-black focus:border-2 transition-all
                    ${type === "" ? "text-gray-400 font-normal" : "text-gray-900 font-bold"}`}
                >
                  <span>
                    {type === "" ? "(Pilih)" : type === "income" ? "Masuk" : "Keluar"}
                  </span>
                  <div className={`text-gray-400 transition-transform duration-200 ml-auto py-2 ${isOpen ? "rotate-180" : ""}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </div>
                </button>

                {isOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 left-0 mt-1.5 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-20">
                      <button
                        type="button"
                        onClick={() => { setType(""); setIsOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-xs text-gray-400 font-normal hover:bg-gray-50 transition-colors flex items-center justify-between"
                      >
                        (Pilih)
                        {type === "" && <span className="w-1.5 h-1.5 rounded-full bg-black"></span>}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setType("expense"); setIsOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-xs text-gray-900 font-bold hover:bg-gray-50 transition-colors flex items-center justify-between"
                      >
                        Keluar
                        {type === "expense" && <span className="w-1.5 h-1.5 rounded-full bg-black"></span>}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setType("income"); setIsOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-xs text-gray-900 font-bold hover:bg-gray-50 transition-colors flex items-center justify-between"
                      >
                        Masuk
                        {type === "income" && <span className="w-1.5 h-1.5 rounded-full bg-black"></span>}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <button 
              type="submit"
              disabled={!text || !amount || !type}
              className={`w-full py-3.5 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-sm mt-2
                ${!text || !amount || !type 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                  : 'bg-black hover:bg-neutral-900 text-white active:scale-[0.98]'
                }`}
            >
              Hitung
            </button>
          </form>
        </div>

        {/* FEED RIWAYAT AKTIVITAS */}
        <div>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2.5 px-1">
              <h3 className="text-[11px] font-extrabold tracking-[0.15em] text-gray-400">AKTIVITAS</h3>
              <span className="text-[10px] font-bold text-gray-400">{filteredTransactions.length} total</span>
            </div>

            <div className="flex items-center justify-between bg-[#0A0A0A] rounded-xl px-4 py-2 shadow-sm border border-white/5">
              <button 
                onClick={() => changeDate(-1)}
                className="text-xs font-bold text-white/50 hover:text-white transition-colors py-0.5 px-2"
              >
                &lt;
              </button>
              
              <span className="text-[11px] font-bold tracking-tight text-white">
                {getNavigationLabel(selectedDate)}
              </span>
              
              <button 
                onClick={() => changeDate(1)}
                className="text-xs font-bold text-white/50 hover:text-white transition-colors py-0.5 px-2"
              >
                &gt;
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-xs text-gray-400 font-medium tracking-wide">Tidak ada aktivitas pada tanggal ini.</p>
              </div>
            ) : (
              filteredTransactions.map((t) => (
                <div
                  key={t.id}
                  className="group flex justify-between items-center p-4 bg-white border border-gray-200/70 rounded-xl transition-all hover:border-gray-400"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-gray-900 tracking-tight">{t.text}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[8px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded uppercase tracking-wide">{t.category}</span>
                      <span className="text-[9px] font-medium text-gray-400">{t.date}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-xs tracking-tight text-black">
                      {t.type === 'income' ? '+' : '-'} Rp. {Math.abs(t.amount).toLocaleString('id-ID')}
                    </span>
                    
                    <button
                      onClick={() => triggerDeleteConfirmation(t.id)}
                      className="text-gray-300 hover:text-rose-500 transition-colors text-xs px-1 font-bold"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>          
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* --- MODAL INPUT SALDO AWAL DI HOME --- */}
      {showInitialBalanceModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md"></div>
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl border border-gray-100 z-10">
            <h4 className="text-sm font-semibold tracking-tight text-gray-950 mb-1">Berapa saldo awal kas-mu?</h4>
            <p className="text-[11px] font-medium text-gray-400 mb-5">Mulai pembukuan kas baru Anda hari ini.</p>
            
            <form onSubmit={handleSaveInitialBalance} className="space-y-4">
              <div className="relative flex items-center">
                <span className="absolute left-4 text-sm font-normal text-gray-400 pointer-events-none">
                  Rp.
                </span>
                <input
                  type="text"
                  placeholder="(Jumlah)"
                  value={initialAmount}
                  onChange={(e) => {
                    let rawValue = e.target.value.replace(/\D/g, '');
                    if (rawValue.length > 9) {
                      rawValue = rawValue.slice(0, 9);
                    }
                    const formattedValue = rawValue ? Number(rawValue).toLocaleString('id-ID') : '';
                    setInitialAmount(formattedValue);
                  }}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-normal text-black placeholder-gray-400 focus:outline-none focus:border-black focus:border-2 focus:bg-white transition-all text-left"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black hover:bg-neutral-900 text-white py-3 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                Lanjutkan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL LOGOUT */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowLogoutModal(false)}></div>
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl border border-gray-100 z-10">
            <h4 className="text-sm font-semibold tracking-tight text-gray-950 mb-1">Yakin ingin keluar?</h4>
            <p className="text-[11px] font-medium text-gray-400 mb-5">Sesi Anda saat ini akan diakhiri.</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full bg-black hover:bg-neutral-900 text-white py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HAPUS TRANSAKSI */}
      {deleteTargetId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setDeleteTargetId(null)}></div>
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl border border-gray-100 z-10">
            <h4 className="text-sm font-semibold tracking-tight text-gray-950 mb-1">Apakah ingin dihapus?</h4>
            <p className="text-[11px] font-medium text-gray-400 mb-5">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Tidak
              </button>
              <button
                type="button"
                onClick={executeDeleteTransaction}
                className="w-full bg-black hover:bg-neutral-900 text-white py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                Lanjutkan hitung?
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HITUNG */}
      {showCommitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowCommitModal(false)}></div>
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl border border-gray-100 z-10">
            <h4 className="text-sm font-semibold tracking-tight text-gray-950 mb-1">Konfirmasi Transaksi</h4>
            <p className="text-[11px] font-medium text-gray-400 mb-5">Apakah Anda yakin ingin memasukkan data ini ke dalam pembukuan?</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowCommitModal(false)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeAddTransaction}
                className="w-full bg-black hover:bg-neutral-900 text-white py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                Ya, Hitung
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}