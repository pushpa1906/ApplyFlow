import { Copy, CheckCircle2, X } from "lucide-react";
import { useState } from "react";
import "./GoogleSheetSetupModal.css";

interface GoogleSheetsSetupModalProps {
  open: boolean;
  onClose: () => void;
  serviceEmail: string;
}

export default function GoogleSheetsSetupModal({
  open,
  onClose,
  serviceEmail,
}: GoogleSheetsSetupModalProps) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(serviceEmail);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      alert("Unable to copy email.");
    }
  };

  return (
    <div className="gs-modal-overlay" onClick={onClose}>
      <div
        className="gs-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="gs-close-button"
          onClick={onClose}
        >
          <X size={18} />
        </button>

        <span className="gs-modal-tag">
          🚀 First Time Setup
        </span>

        <h2>Connect your Google Sheet</h2>

        <p className="gs-modal-subtitle">
          ApplyFlow reads your Google Sheet securely using a Google Service
          Account. Follow these simple steps to connect your spreadsheet in
          under a minute.
        </p>

        <div className="gs-steps">
          <div className="gs-step">
            <div className="gs-step-number">1</div>

            <div className="gs-step-content">
              <h4>Open your Google Sheet</h4>
              <p>
                Open the spreadsheet that contains your job applications.
              </p>
            </div>
          </div>

          <div className="gs-step">
            <div className="gs-step-number">2</div>

            <div className="gs-step-content">
              <h4>Click the Share button</h4>
              <p>
                In the top-right corner of Google Sheets, click{" "}
                <strong>Share</strong>.
              </p>
            </div>
          </div>

          <div className="gs-step">
            <div className="gs-step-number">3</div>

            <div className="gs-step-content">
              <h4>Add the ApplyFlow Service Account</h4>

              <div className="gs-email-box">
                <code>{serviceEmail}</code>

                <button
                  className="gs-copy-button"
                  onClick={copyEmail}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 size={18} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      Copy Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="gs-step">
            <div className="gs-step-number">4</div>

            <div className="gs-step-content">
              <h4>Grant Editor access</h4>

              <p>
                Change the permission to <strong>Editor</strong>, then click{" "}
                <strong>Send</strong>.
              </p>
            </div>
          </div>

          <div className="gs-step">
            <div className="gs-step-number">5</div>

            <div className="gs-step-content">
              <h4>Paste your Google Sheet link</h4>

              <p>
                Return to ApplyFlow and paste the Google Sheet URL into the
                connection form.
              </p>
            </div>
          </div>
        </div>

        <div className="gs-why-card">
          <h3>🔒 Your data stays private</h3>

          <ul>
            <li>Only your shared spreadsheet can be accessed.</li>
            <li>No one else can view your applications.</li>
            <li>You can revoke access anytime from Google Sheets.</li>
            <li>Your data is never shared with other ApplyFlow users.</li>
          </ul>
        </div>

        <div className="gs-footer">
          <button
            className="gs-primary-button"
            onClick={onClose}
          >
            Got it, let's connect →
          </button>
        </div>
      </div>
    </div>
  );
}