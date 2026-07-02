import { CheckCircle2, AlertCircle, Download } from 'lucide-react';

const STYLES = `
.sd-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.sd-card {
  background: #ffffff;
  border-radius: 16px;
  max-width: 460px;
  width: 100%;
  padding: 36px 28px 28px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}

.sd-icon { margin-bottom: 16px; display: flex; justify-content: center; }
.sd-icon svg { color: #4caf50; animation: sd-pop 0.5s ease; }
.sd-icon--error svg { color: #f0c040; }

@keyframes sd-pop {
  0% { transform: scale(0.4); opacity: 0; }
  80% { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}

.sd-title { font-size: 1.5rem; font-weight: 700; color: #1a1a2e; margin: 0 0 12px; }
.sd-message { color: #546e7a; line-height: 1.6; margin: 0 0 24px; font-size: 0.95rem; }

.sd-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  font-size: 1rem;
  padding: 12px 24px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-weight: 700;
  transition: opacity 0.15s;
  margin-bottom: 12px;
}
.sd-btn:hover { opacity: 0.9; }
.sd-btn:last-child { margin-bottom: 0; }

.sd-btn--download { background: #f59e0b; color: #1a1a2e; }
.sd-btn--primary { background: #003ec7; color: #ffffff; }
`;

/**
 * Replaces `SuccessDialogComponent` (Angular Material `MatDialog`).
 * A plain controlled modal — render it conditionally with `open`, and
 * call `onClose` when the user dismisses it (mirrors the Angular
 * `dialogRef.afterClosed()` subscription).
 */
export default function SuccessDialog({ open, success, message, pdfBase64, onClose }) {
  if (!open) return null;

  const downloadPdf = () => {
    if (!pdfBase64) return;
    const binary = atob(pdfBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TravelItinerary.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="sd-backdrop" role="dialog" aria-modal="true">
      <style>{STYLES}</style>
      <div className="sd-card">
        <div className={`sd-icon ${!success ? 'sd-icon--error' : ''}`}>
          {success ? <CheckCircle2 size={56} /> : <AlertCircle size={56} />}
        </div>
        <h2 className="sd-title">{success ? 'Your Itinerary is Ready!' : 'Itinerary Created'}</h2>
        <p className="sd-message">
          {success
            ? 'Your travel plan has been successfully generated. Check your email for the PDF attachment.'
            : message}
        </p>
        {pdfBase64 && (
          <button className="sd-btn sd-btn--download" onClick={downloadPdf}>
            <Download size={18} /> Download PDF
          </button>
        )}
        <button className="sd-btn sd-btn--primary" onClick={onClose}>
          View Summary →
        </button>
      </div>
    </div>
  );
}
