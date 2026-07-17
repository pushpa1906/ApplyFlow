import { useState } from "react";
import { BarChart3, CheckCircle2, Database, Info } from "lucide-react";
import Choice from "../components/welcome/Choice";
import GoogleSheetsSetupModal from "../components/welcome/GoogleSheetsSetupModal"

interface Props {
    loading: boolean;
    error: string;
    sheetId: string;
    setSheetId: (value: string) => void;
    connect: () => void;

    openDemo: () => void;

    personalAvailable: boolean;
    accessCode: string;
    setAccessCode: (value: string) => void;
    openPersonal: () => void;

    serviceEmail: string;
}

export default function Welcome({
    loading,
    error,
    sheetId,
    setSheetId,
    connect,
    openDemo,
    personalAvailable,
    accessCode,
    setAccessCode,
    openPersonal,
    serviceEmail,
}: Props) {
    const [showSetupModal, setShowSetupModal] = useState(false);


    return (
        <>
            <main className="welcome-page">
                <section className="welcome-shell">
                    <div className="welcome-heading">
                        <div className="welcome-logo">AF</div>

                        <h1 className="hero-title">ApplyFlow</h1>

                        <p>
                            Turn your Google Sheets job tracker into a calm,
                            focused dashboard you'll enjoy opening every day.
                        </p>
                    </div>

                    <div
                        className={`choice-grid ${
                            personalAvailable ? "three" : "two"
                        }`}
                    >
                        <Choice
                            icon={<BarChart3 />}
                            title="Explore Demo"
                            text="Recruiter-safe sample data with working charts, filters, goals, and CRUD."
                            button="Open Demo"
                            action={openDemo}
                        />

                        <Choice
                            icon={<Database />}
                            title="Connect Google Sheet"
                            text="Paste a Google Spreadsheet URL or Spreadsheet ID. Your connection is remembered in this browser."
                            button="Connect Workspace"
                            action={connect}
                            loading={loading}
                        >
                            <input
                                value={sheetId}
                                onChange={(event) =>
                                    setSheetId(event.target.value)
                                }
                                placeholder="Google Spreadsheet URL or ID"
                            />
                        </Choice>

                        {personalAvailable && (
                            <Choice
                                icon={<CheckCircle2 />}
                                title="Personal Workspace"
                                text="Protected access to your preconfigured private spreadsheet."
                                button="Open Personal Workspace"
                                action={openPersonal}
                                loading={loading}
                            >
                                <input
                                    type="password"
                                    value={accessCode}
                                    onChange={(event) =>
                                        setAccessCode(event.target.value)
                                    }
                                    placeholder="Private access code"
                                />
                            </Choice>
                        )}
                    </div>

                    {serviceEmail && (
                        <div className="setup-help">
                            <button
                                className="setup-button"
                                onClick={() => setShowSetupModal(true)}
                            >
                                <Info size={16} />
                                First Time Setup
                            </button>

                            <span className="setup-caption">
                                Learn how to connect your Google Sheet in under a minute.
                            </span>
                        </div>
                    )}

                    {error && <div className="error-banner">{error}</div>}
                </section>
            </main>

            <GoogleSheetsSetupModal
                open={showSetupModal}
                onClose={() => setShowSetupModal(false)}
                serviceEmail={serviceEmail}
            />;
        </>
    );
}