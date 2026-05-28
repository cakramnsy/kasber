import React from 'react';

export default function CardSaldo({ balance, income, expense }) {
  return (
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
  );
}