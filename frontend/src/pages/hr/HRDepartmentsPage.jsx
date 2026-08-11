import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { UserCheck, Plus, Building2, Award } from 'lucide-react';

const HRDepartmentsPage = () => {
  const [departments, setDepartments] = useState([
    { id: 1, name: 'Academics & Teaching', code: 'ACAD', head: 'Principal', staffCount: 12 },
    { id: 2, name: 'Administration & HR', code: 'ADMIN', head: 'HR Manager', staffCount: 4 },
    { id: 3, name: 'Transportation', code: 'TRANS', head: 'Fleet Supervisor', staffCount: 6 },
    { id: 4, name: 'Finance & Accounts', code: 'FIN', head: 'Chief Accountant', staffCount: 3 },
    { id: 5, name: 'Maintenance & Operations', code: 'MAINT', head: 'Facility Lead', staffCount: 5 },
  ]);

  const [designations, setDesignations] = useState([
    { id: 1, title: 'Senior Class Teacher', dept: 'Academics & Teaching', level: 'Level 3' },
    { id: 2, title: 'Subject Specialist Teacher', dept: 'Academics & Teaching', level: 'Level 2' },
    { id: 3, title: 'School Transport Driver', dept: 'Transportation', level: 'Level 1' },
    { id: 4, title: 'Bus Attendant', dept: 'Transportation', level: 'Level 1' },
    { id: 5, title: 'Accountant', dept: 'Finance & Accounts', level: 'Level 2' },
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
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">HR Structure</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Departments & Designations
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Manage organizational hierarchy, department codes, and staff designations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Departments Card */}
            <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-darkBrown flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-chestnut" />
                  <span>Departments ({departments.length})</span>
                </h3>
              </div>

              <div className="divide-y divide-almond/20">
                {departments.map((d) => (
                  <div key={d.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-darkBrown">{d.name}</h4>
                      <span className="text-[10px] text-textMuted">Head: {d.head}</span>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded bg-chestnut/10 text-chestnut font-mono font-bold text-[10px]">
                        {d.code}
                      </span>
                      <span className="block text-[10px] text-textMuted mt-0.5">{d.staffCount} Staff</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Designations Card */}
            <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-darkBrown flex items-center gap-2">
                  <Award className="w-5 h-5 text-morning" />
                  <span>Designations ({designations.length})</span>
                </h3>
              </div>

              <div className="divide-y divide-almond/20">
                {designations.map((des) => (
                  <div key={des.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-darkBrown">{des.title}</h4>
                      <span className="text-[10px] text-textMuted">Dept: {des.dept}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-morning/15 text-morning font-semibold text-[10px]">
                      {des.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HRDepartmentsPage;
