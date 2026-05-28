import React, { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import Dashboard from './pages/Dashboard';

export default function App() {
  // --- STATE OTENTIKASI & KUNCI IDENTITAS ---
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('kasber_logged_in') === 'true');
  const [isProfileMode, setIsProfileMode] = useState(() => localStorage.getItem('kasber_in_profile_setup') === 'true');
  const [activeUserKey, setActiveUserKey] = useState(() => {
    const user = localStorage.getItem('kasber_user');
    return user ? JSON.parse(user).email : 'admin@kasber.com';
  });

  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem(`kasber_profile_${activeUserKey}`);
    return saved ? JSON.parse(saved) : null;
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem(`kasber_tx_${activeUserKey}`);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    document.title = "KASBER - Kas Bersama (Beta)";
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem(`kasber_tx_${activeUserKey}`, JSON.stringify(transactions));
    }
  }, [transactions, activeUserKey, isLoggedIn]);

  useEffect(() => {
    const savedProfile = localStorage.getItem(`kasber_profile_${activeUserKey}`);
    setUserProfile(savedProfile ? JSON.parse(savedProfile) : null);
    const savedTx = localStorage.getItem(`kasber_tx_${activeUserKey}`);
    setTransactions(savedTx ? JSON.parse(savedTx) : []);
  }, [activeUserKey]);

  const handleLogout = () => {
    localStorage.removeItem('kasber_logged_in');
    localStorage.removeItem('kasber_in_profile_setup');
    setIsLoggedIn(false);
    setIsProfileMode(false);
  };

  // --- LOGIKA PERALIHAN LAYAR UTAMA ---
  if (!isLoggedIn) {
    return (
      <AuthPage 
        setIsLoggedIn={setIsLoggedIn} 
        setIsProfileMode={setIsProfileMode} 
        setActiveUserKey={setActiveUserKey} 
        setTransactions={setTransactions} 
      />
    );
  }

  if (isLoggedIn && isProfileMode) {
    return (
      <ProfilePage 
        setIsProfileMode={setIsProfileMode} 
        activeUserKey={activeUserKey} 
        setUserProfile={setUserProfile} 
      />
    );
  }

  return (
    <Dashboard 
      setIsLoggedIn={setIsLoggedIn}
      setIsProfileMode={setIsProfileMode}
      activeUserKey={activeUserKey}
      userProfile={userProfile}
      transactions={transactions}
      setTransactions={setTransactions}
      handleLogout={handleLogout}
    />
  );
}