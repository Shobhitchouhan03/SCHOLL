import React, { useState } from 'react';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { CalendarDays, Plus } from 'lucide-react';

const HRHolidaysPage = () => {
  const [holidays, setHolidays] = useState([
    { id: 1, title: 'Republic Day', date: '2026-01-26', day: 'Monday', category: 'National' },
    { id: 2, title: 'Holi Festival', date: '2026-03-25', day: 'Wednesday', category: 'Gazetted' },
    { id: 3, title: 'Independence Day', date: '2026-08-15', day: 'Saturday', category: 'National' },
    { id: 4, title: 'Gandhi Jayanti', date: '2026-10-02', day: 'Friday', category: 'National' },
    { id: 5, title: 'Diwali', date: '2026-11-08', day: 'Sunday', category: 'Gazetted' },
  ]);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Academic Calendar</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Official Holiday Calendar
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                School holidays, national observances, and staff leave calendar for the current session.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <h3 className="text-base font-bold text-darkBrown flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-chestnut" />
              <span>Configured Holidays ({holidays.length})</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-almond/30 text-[11px] font-bold text-textMuted uppercase bg-surface/50">
                    <th className="py-3 px-4">Holiday Name</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Day</th>
                    <th className="py-3 px-4">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-almond/20">
                  {holidays.map((h) => (
                    <tr key={h.id} className="hover:bg-surface/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-darkBrown">{h.title}</td>
                      <td className="py-3 px-4 font-mono text-chestnut font-bold">{h.date}</td>
                      <td className="py-3 px-4 text-textMuted">{h.day}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-chestnut/10 text-chestnut">
                          {h.category}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HRHolidaysPage;
