import React from 'react';
import { UserCheck, GraduationCap, ChevronDown } from 'lucide-react';

const ChildSelector = ({ childrenList, selectedChildId, onSelectChild }) => {
  if (!childrenList || childrenList.length === 0) {
    return null;
  }

  const selectedChild = childrenList.find((c) => String(c._id) === String(selectedChildId)) || childrenList[0];

  return (
    <div className="bg-white rounded-2xl p-4 border border-almond/40 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-chestnut/10 text-chestnut flex items-center justify-center font-bold text-sm">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider">Active Student Record</span>
          <h2 className="text-sm font-bold text-darkBrown flex items-center gap-2">
            {selectedChild.fullName}
            <span className="px-2 py-0.5 bg-morning/15 text-darkBrown rounded-md text-[10px] font-extrabold">
              {selectedChild.currentClassId?.name || 'Class'} - {selectedChild.currentSectionId?.name || 'Sec'}
            </span>
          </h2>
        </div>
      </div>

      {childrenList.length > 1 && (
        <div className="relative">
          <select
            value={selectedChildId}
            onChange={(e) => onSelectChild(e.target.value)}
            className="appearance-none bg-surface border border-almond/60 rounded-xl px-4 py-2 pr-9 text-xs font-bold text-darkBrown focus:outline-none focus:border-chestnut cursor-pointer"
          >
            {childrenList.map((child) => (
              <option key={child._id} value={child._id}>
                {child.fullName} ({child.currentClassId?.name} - {child.currentSectionId?.name})
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-textMuted absolute right-3 top-2.5 pointer-events-none" />
        </div>
      )}
    </div>
  );
};

export default ChildSelector;
