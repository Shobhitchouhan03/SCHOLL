import React, { useState } from 'react';
import { Copy, Check, ShieldCheck, AlertTriangle, ExternalLink } from 'lucide-react';

const CredentialModal = ({ isOpen, credentials, onClose }) => {
  if (!isOpen || !credentials) return null;

  const [copied, setCopied] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const schoolName = credentials?.schoolName || '';
  const schoolCode = credentials?.schoolCode || '';
  const schoolSlug = credentials?.schoolSlug || '';
  const fullName = credentials?.name || credentials?.principalName || '';
  const loginId = credentials?.loginId || credentials?.principalLoginId || '';
  const rawPassword = credentials?.rawPassword || '';

  const portalPath = credentials?.portalUrl || (schoolSlug ? `/s/${schoolSlug}/login` : '');
  const fullPortalUrl = portalPath ? `${window.location.origin}${portalPath}` : '';

  const handleCopy = () => {
    const lines = ['=== AcademiaPro Credentials ==='];
    if (schoolName) lines.push(`School Name: ${schoolName}`);
    if (schoolCode) lines.push(`School Code: ${schoolCode}`);
    if (fullPortalUrl) lines.push(`School Portal Link: ${fullPortalUrl}`);
    if (fullName) lines.push(`Full Name: ${fullName}`);
    if (loginId) lines.push(`Login ID: ${loginId}`);
    if (rawPassword) lines.push(`Password: ${rawPassword}`);
    lines.push('===============================');

    const textToCopy = lines.join('\n').trim();

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCopyUrlOnly = () => {
    if (navigator?.clipboard?.writeText && fullPortalUrl) {
      navigator.clipboard.writeText(fullPortalUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-almond/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-chestnut via-morning to-darkBrown" />

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-textMain">Account Created Successfully</h3>
            <p className="text-xs text-textMuted">Save credentials now. They will NOT be shown again.</p>
          </div>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-almond/50 space-y-3 mb-5 font-mono text-xs text-textMain">
          {schoolName && (
            <div className="flex justify-between items-center pb-2 border-b border-almond/30 font-sans">
              <span className="text-textMuted font-medium">School:</span>
              <span className="font-bold text-darkBrown">{schoolName}</span>
            </div>
          )}

          {schoolCode && (
            <div className="flex justify-between items-center pb-2 border-b border-almond/30 font-sans">
              <span className="text-textMuted font-medium">School Code:</span>
              <span className="font-bold text-darkBrown bg-almond/30 px-2 py-0.5 rounded font-mono">{schoolCode}</span>
            </div>
          )}

          {fullPortalUrl && (
            <div className="pb-2 border-b border-almond/30 font-sans">
              <div className="flex justify-between items-center mb-1">
                <span className="text-textMuted font-medium">School Branded Link:</span>
                <button
                  type="button"
                  onClick={handleCopyUrlOnly}
                  className="text-[10px] text-chestnut font-bold hover:underline flex items-center space-x-1"
                >
                  {copiedUrl ? <span>Copied Link!</span> : <span>Copy Link</span>}
                </button>
              </div>
              <a
                href={fullPortalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-mono text-chestnut hover:underline break-all flex items-center space-x-1"
              >
                <span>{fullPortalUrl}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          )}

          {credentials?.studentName && (
            <div className="flex justify-between items-center pb-2 border-b border-almond/30 font-sans">
              <span className="text-textMuted font-medium">Student:</span>
              <span className="font-bold text-darkBrown">{credentials.studentName} ({credentials.admissionNumber})</span>
            </div>
          )}

          {credentials?.className && (
            <div className="flex justify-between items-center pb-2 border-b border-almond/30 font-sans">
              <span className="text-textMuted font-medium">Class / Section:</span>
              <span className="font-semibold text-darkBrown">{credentials.className} - Section {credentials.sectionName}</span>
            </div>
          )}

          {fullName && (
            <div className="flex justify-between items-center pb-2 border-b border-almond/30 font-sans">
              <span className="text-textMuted font-medium">Parent / Guardian:</span>
              <span className="font-semibold">{fullName}</span>
            </div>
          )}

          {loginId && (
            <div className="flex justify-between items-center pb-2 border-b border-almond/30 font-sans">
              <span className="text-textMuted font-medium">Parent Login ID:</span>
              <span className="font-bold text-chestnut font-mono">{loginId}</span>
            </div>
          )}

          {rawPassword && (
            <div className="flex justify-between items-center font-sans">
              <span className="text-textMuted font-medium">Password:</span>
              <span className="font-bold text-danger bg-danger/10 px-2 py-0.5 rounded select-all font-mono">
                {rawPassword}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-start space-x-2 text-[11px] text-warning bg-warning/10 p-3 rounded-lg border border-warning/20 mb-5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-warning" />
          <span>
            This password is securely stored as a one-way hash in MongoDB. You must share these details with the user immediately.
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleCopy}
            className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-xs flex items-center justify-center space-x-2 transition-all ${
              copied
                ? 'bg-success text-white'
                : 'bg-chestnut hover:bg-darkBrown text-white shadow-sm'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied Credentials!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Credentials</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-almond text-textMuted hover:text-textMain hover:bg-surface font-medium text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default CredentialModal;
