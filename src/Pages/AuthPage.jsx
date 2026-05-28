import React, { useState } from 'react';

export default function AuthPage({ setIsLoggedIn, setIsProfileMode, setActiveUserKey, setTransactions }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [loginError, setLoginError] = useState(''); 
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    const allUsers = JSON.parse(localStorage.getItem('kasber_users_list')) || [];
    
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
          <span className="text-[10px] font-bold text-gray-400 px-3 uppercase tracking-wider">atau</span>
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