import React, { useState, useEffect } from 'react';
import { Building2, Save, ArrowRight, CheckCircle2, Globe, Mail, Phone, MapPin } from 'lucide-react';

const Step1SchoolProfile = ({ data, onSave, loading }) => {
  const [formData, setFormData] = useState({
    name: data?.name || '',
    schoolCode: data?.schoolCode || '',
    email: data?.email || '',
    phone: data?.phone || '',
    alternatePhone: data?.alternatePhone || '',
    addressLine1: data?.addressLine1 || data?.address || '',
    addressLine2: data?.addressLine2 || '',
    city: data?.city || '',
    state: data?.state || '',
    postalCode: data?.postalCode || '',
    country: data?.country || 'India',
    website: data?.website || '',
    logoUrl: data?.logoUrl || '',
    principalSignatureUrl: data?.principalSignatureUrl || '',
  });

  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || '',
        schoolCode: data.schoolCode || '',
        email: data.email || '',
        phone: data.phone || '',
        alternatePhone: data.alternatePhone || '',
        addressLine1: data.addressLine1 || data.address || '',
        addressLine2: data.addressLine2 || '',
        city: data.city || '',
        state: data.state || '',
        postalCode: data.postalCode || '',
        country: data.country || 'India',
        website: data.website || '',
        logoUrl: data.logoUrl || '',
        principalSignatureUrl: data.principalSignatureUrl || '',
      });
    }
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card space-y-6">
      <div className="border-b border-almond/30 pb-4">
        <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Step 1 of 7</span>
        <h2 className="text-xl font-bold text-darkBrown tracking-tight mt-1 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-chestnut" />
          <span>School Profile & Institutional Details</span>
        </h2>
        <p className="text-xs text-textMuted mt-0.5">
          Verify and configure basic contact details, campus address, and official branding.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-textMain mb-1">School Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-textMain mb-1">
              School Code <span className="text-textMuted font-normal">(Read-Only)</span>
            </label>
            <input
              type="text"
              readOnly
              disabled
              value={formData.schoolCode}
              className="w-full px-3.5 py-2.5 bg-almond/20 border border-almond/40 rounded-xl text-xs font-mono font-bold text-chestnut"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-textMain mb-1">Official Email</label>
            <input
              type="email"
              placeholder="contact@school.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-textMain mb-1">Primary Phone</label>
            <input
              type="text"
              placeholder="+91 9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-textMain mb-1">Alternate Phone</label>
            <input
              type="text"
              placeholder="+91 011-23456789"
              value={formData.alternatePhone}
              onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-textMain mb-1">Official Website</label>
            <input
              type="text"
              placeholder="https://www.school.edu"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
            />
          </div>
        </div>

        {/* Address Fields */}
        <div className="pt-4 border-t border-almond/30 space-y-4">
          <span className="text-xs font-bold text-darkBrown uppercase tracking-wider block">Campus Address</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-textMain mb-1">Address Line 1</label>
              <input
                type="text"
                placeholder="Building No, Street Name"
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-textMain mb-1">Address Line 2</label>
              <input
                type="text"
                placeholder="Locality, Landmark"
                value={formData.addressLine2}
                onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-textMain mb-1">City</label>
              <input
                type="text"
                placeholder="e.g. New Delhi"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-textMain mb-1">State</label>
              <input
                type="text"
                placeholder="e.g. Delhi"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-textMain mb-1">Postal Code</label>
              <input
                type="text"
                placeholder="110001"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-textMain mb-1">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
              />
            </div>
          </div>
        </div>

        {/* Branding & Signatures */}
        <div className="pt-4 border-t border-almond/30 space-y-4">
          <span className="text-xs font-bold text-darkBrown uppercase tracking-wider block">Branding & Assets</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-textMain mb-1">School Logo URL</label>
              <input
                type="text"
                placeholder="https://domain.com/logo.png"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-textMain mb-1">Principal Signature URL</label>
              <input
                type="text"
                placeholder="https://domain.com/signature.png"
                value={formData.principalSignatureUrl}
                onChange={(e) => setFormData({ ...formData, principalSignatureUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-almond/30">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center space-x-2 bg-chestnut hover:bg-darkBrown text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>Saving...</span>
            ) : (
              <>
                <span>Save & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step1SchoolProfile;
