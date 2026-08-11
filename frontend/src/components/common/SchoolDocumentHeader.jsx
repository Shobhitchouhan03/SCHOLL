import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const SchoolDocumentHeader = ({ title, documentNo, date, subtitle }) => {
  const [branding, setBranding] = useState(null);

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      const res = await api.get('/principal/branding').catch(() => null);
      if (res?.data?.success && res.data.branding) {
        setBranding(res.data.branding);
      }
    } catch (err) {
      console.error('Failed to fetch document branding', err);
    }
  };

  return (
    <div className="relative overflow-hidden mb-6 pb-4 border-b-2 border-darkBrown">
      {/* Subtle Background Watermark (5% opacity) */}
      {branding?.logoUrl && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 select-none z-0">
          <img src={branding.logoUrl} alt="Watermark" className="w-96 h-96 object-contain" />
        </div>
      )}

      {/* Header Content */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          {branding?.logoUrl ? (
            <img src={branding.logoUrl} alt={branding.name} className="h-16 w-16 object-contain" />
          ) : (
            <div className="w-16 h-16 bg-chestnut text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm">
              {branding?.name ? branding.name.charAt(0) : 'S'}
            </div>
          )}

          <div>
            <h1 className="text-xl font-black text-darkBrown tracking-tight uppercase">
              {branding?.name || 'School Name'}
            </h1>
            {branding?.tagline && <p className="text-[11px] italic text-textMuted">{branding.tagline}</p>}
            <p className="text-[11px] text-textMuted mt-0.5">
              {branding?.address || 'School Address'} | Phone: {branding?.phone || 'N/A'} | Code: {branding?.schoolCode || 'N/A'}
            </p>
          </div>
        </div>

        <div className="text-right sm:text-right w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-almond/40">
          <div className="text-base font-black text-chestnut uppercase tracking-wide">{title}</div>
          {subtitle && <div className="text-xs text-textMuted">{subtitle}</div>}
          {documentNo && <div className="text-xs font-mono font-bold text-darkBrown mt-1">Ref: {documentNo}</div>}
          {date && <div className="text-[11px] text-textMuted">Date: {date}</div>}
        </div>
      </div>
    </div>
  );
};

export default SchoolDocumentHeader;
