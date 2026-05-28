import React, { useState, useEffect } from 'react';
import CardSaldo from '../components/CardSaldo';

export default function Dashboard({ setIsLoggedIn, setIsProfileMode, activeUserKey, userProfile, transactions, setTransactions, handleLogout }) {
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('Makan');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false); 
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [showCommitModal, setShowCommitModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [initialAmount, setInitialAmount] = useState('');
  const [showInitialBalanceModal, setShowInitialBalanceModal] = useState(false);

  useEffect(() => {
    const hasProfile = localStorage.getItem(`kasber_profile_${activeUserKey}`);
    const hasSetInitial = localStorage.getItem(`kasber_initial_balance_set_${activeUserKey}`);
    if (hasProfile && hasSetInitial !== 'true') {
      setShowInitialBalanceModal(true);
    }
  }, [activeUserKey]);

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

  const getFormattedDateString = (dateObj) => dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

  const getNavigationLabel = (dateObj) => {
    const todayStr = getFormattedDateString(new Date());
    const currentStr = getFormattedDateString(dateObj);
    return todayStr === currentStr ? `${currentStr} (Hari Ini)` : currentStr;
  };

  const changeDate = (daysToAdd) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + daysToAdd);
    setSelectedDate(newDate);
  };

  const filteredTransactions = transactions.filter((t) => {
    const txDatePart = t.date.split(' • ')[0].trim();
    return txDatePart === getFormattedDateString(selectedDate);
  });

  const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Math.abs(t.amount), 0);
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

  const executeDeleteTransaction = () => {
    if (deleteTargetId) {
      setTransactions(transactions.filter(t => t.id !== deleteTargetId));
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#121212] antialiased">
      <div className="max-w-md w-full mx-auto px-6 py-12">
        <header className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-black">KASBER</h1>
            <p className="text-sm font-medium text-gray-400 tracking-normal mt-0.5">Kelola Uang Kas</p>
          </div>
          <div className="flex flex-col items-end text-right gap-2.5">
            <button onClick={() => setShowLogoutModal(true)} className="text-[10px] font-extrabold border border-gray-300 text-gray-500 hover:text-black hover:border-black px-3 py-1.5 rounded-full transition-all cursor-pointer">
              Keluar
            </button>
            {userProfile && (
              <div className="mt-1 flex flex-col items-end gap-1.5">
                <div className="flex items-center gap-2 px-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
<span className="text-lg font-extrabold text-bold leading-none tracking-tight">{userProfile.adminName}</span>
                </div>
                <div className="inline-block bg-white border border-gray-200 rounded-xl px-3 py-1">
                  <span className="text-[11px] font-medium uppercase text-gray-600 block">{userProfile.institutionName}</span>
                </div>
                <div className="inline-block bg-white border border-gray-200 rounded-xl px-2.5 py-0.5">
                  <span className="text-[10px] font-medium text-gray-500 block">Th. {userProfile.academicYear}</span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* MEMANGGIL KOMPONEN KARTU SALDO YANG TERPISAH */}
        <CardSaldo balance={balance} income={income} expense={expense} />

        {/* FORMULIR INPUT TRANSAKSI */}
        <div className="bg-white rounded-[24px] p-6 border border-gray-200/70 shadow-sm mb-8">
          <h3 className="text-sm font-semibold tracking-[0.02em] text-black mb-4">Buat apa nih?</h3>
          <form onSubmit={handleAddTransactionTrigger} className="space-y-3.5">
            <div className="flex gap-1 overflow-x-auto py-1 scrollbar-none">
              {['Makan', 'Belanja', 'Transport', 'Hiburan', 'Lainnya'].map((cat) => (
                <button key={cat} type="button" onClick={() => setCategory(cat)} className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${category === cat ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-200'}`}>
                  {cat}
                </button>
              ))}
            </div>
            <input type="text" placeholder="(Catatan)" value={text} maxLength="30" onChange={(e) => setText(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-black text-black" />
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 relative flex items-center">
                <span className="absolute left-4 text-sm text-gray-400 pointer-events-none">Rp.</span>
                <input type="text" placeholder="(Jumlah)" value={amount} onChange={(e) => {
                  let raw = e.target.value.replace(/\D/g, '');
                  setAmount(raw ? Number(raw).toLocaleString('id-ID') : '');
                }} className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-black focus:outline-none focus:border-black" />
              </div>
              <div className="relative w-full h-full">
                <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full h-full px-4 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold flex items-center justify-between">
                  <span>{type === "" ? "(Pilih)" : type === "income" ? "Masuk" : "Keluar"}</span>
                </button>
                {isOpen && (
                  <div className="absolute right-0 left-0 mt-1.5 bg-white border rounded-xl shadow-lg py-1.5 z-20">
                    <button type="button" onClick={() => { setType("expense"); setIsOpen(false); }} className="w-full text-left px-4 py-2 text-xs font-bold text-black hover:bg-gray-50">Keluar</button>
                    <button type="button" onClick={() => { setType("income"); setIsOpen(false); }} className="w-full text-left px-4 py-2 text-xs font-bold text-black hover:bg-gray-50">Masuk</button>
                  </div>
                )}
              </div>
            </div>
            <button type="submit" disabled={!text || !amount || !type} className={`w-full py-3.5 rounded-xl text-xs font-semibold ${!text || !amount || !type ? 'bg-gray-200 text-gray-400' : 'bg-black text-white'}`}>Hitung</button>
          </form>
        </div>

        {/* AKTIVITAS FEED */}
        <div>
          <div className="flex justify-between items-center mb-2.5 px-1">
            <h3 className="text-[11px] font-extrabold text-gray-400">AKTIVITAS</h3>
            <span className="text-[10px] font-bold text-gray-400">{filteredTransactions.length} total</span>
          </div>
          <div className="flex items-center justify-between bg-[#0A0A0A] rounded-xl px-4 py-2 mb-4">
            <button onClick={() => changeDate(-1)} className="text-xs font-bold text-white/50 hover:text-white">&lt;</button>
            <span className="text-[11px] font-bold text-white">{getNavigationLabel(selectedDate)}</span>
            <button onClick={() => changeDate(1)} className="text-xs font-bold text-white/50 hover:text-white">&gt;</button>
          </div>
          <div className="space-y-2.5">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-dashed text-gray-400 text-xs">Tidak ada aktivitas.</div>
            ) : (
              filteredTransactions.map((t) => (
                <div key={t.id} className="flex justify-between items-center p-4 bg-white border rounded-xl">
                  <div>
                    <span className="font-bold text-xs text-gray-900">{t.text}</span>
                    <div className="flex gap-2 mt-1"><span className="text-[8px] font-semibold bg-gray-100 px-1.5 py-0.5 rounded text-gray-400">{t.category}</span><span className="text-[9px] text-gray-400">{t.date}</span></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-xs text-black">{t.type === 'income' ? '+' : '-'} Rp. {Math.abs(t.amount).toLocaleString('id-ID')}</span>
                    <button onClick={() => setDeleteTargetId(t.id)} className="text-gray-300 hover:text-rose-500 font-bold">✕</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL DI SINI TETAP TERJAGA FUNGSINYA */}
      {showInitialBalanceModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md"></div>
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl z-10">
            <h4 className="text-sm font-semibold text-gray-950 mb-1">Berapa saldo awal kas-mu?</h4>
            <form onSubmit={handleSaveInitialBalance} className="space-y-4">
              <input type="text" placeholder="(Jumlah)" value={initialAmount} onChange={(e) => {
                let raw = e.target.value.replace(/\D/g, '');
                setInitialAmount(raw ? Number(raw).toLocaleString('id-ID') : '');
              }} className="w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm" />
              <button type="submit" className="w-full bg-black text-white py-3 rounded-xl text-xs font-semibold">Lanjutkan</button>
            </form>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowLogoutModal(false)}></div>
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center z-10">
            <h4 className="text-sm font-semibold mb-1">Yakin ingin keluar?</h4>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button onClick={() => setShowLogoutModal(false)} className="py-2.5 rounded-xl text-xs font-bold bg-gray-50 text-gray-500">Batal</button>
              <button onClick={handleLogout} className="bg-black text-white py-2.5 rounded-xl text-xs font-semibold">Keluar</button>
            </div>
          </div>
        </div>
      )}

      {deleteTargetId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setDeleteTargetId(null)}></div>
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center z-10">
            <h4 className="text-sm font-semibold mb-1">Apakah ingin dihapus?</h4>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button onClick={() => setDeleteTargetId(null)} className="py-2.5 rounded-xl text-xs font-bold bg-gray-50 text-gray-500">Tidak</button>
              <button onClick={executeDeleteTransaction} className="bg-black text-white py-2.5 rounded-xl text-xs font-semibold">Lanjutkan</button>
            </div>
          </div>
        </div>
      )}

      {showCommitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowCommitModal(false)}></div>
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center z-10">
            <h4 className="text-sm font-semibold mb-1">Konfirmasi Transaksi</h4>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button onClick={() => setShowCommitModal(false)} className="py-2.5 rounded-xl text-xs font-bold bg-gray-50 text-gray-500">Batal</button>
              <button onClick={executeAddTransaction} className="bg-black text-white py-2.5 rounded-xl text-xs font-semibold">Ya, Hitung</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}