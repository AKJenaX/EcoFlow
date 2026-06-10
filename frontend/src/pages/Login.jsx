import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, generateMfaSecret, verifyMfaCode } from "../services/api.js";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState("credentials"); // "credentials" | "mfa_setup" | "mfa_verify"
  const [mfaToken, setMfaToken] = useState("");
  const [mfaQrCode, setMfaQrCode] = useState("");
  const [mfaSecret, setMfaSecret] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [codeArray, setCodeArray] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  // Reset split-digit array whenever step changes
  useEffect(() => {
    setCodeArray(["", "", "", "", "", ""]);
    setMfaCode("");
  }, [step]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(username, password);
      if (data.status === "MFA_REQUIRED") {
        setMfaToken(data.mfaToken);
        setStep("mfa_verify");
      } else if (data.status === "MFA_SETUP_REQUIRED") {
        setMfaToken(data.mfaToken);
        try {
          const mfaSetup = await generateMfaSecret(data.mfaToken);
          setMfaQrCode(mfaSetup.qrCode);
          setMfaSecret(mfaSetup.secret || "");
          setStep("mfa_setup");
        } catch (setupErr) {
          setError("Failed to initialize MFA setup. Please contact support.");
        }
      } else {
        localStorage.setItem("accessToken", data.accessToken);
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await verifyMfaCode(mfaToken, mfaCode);
      localStorage.setItem("accessToken", data.accessToken);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newArray = [...codeArray];
    newArray[index] = value;
    setCodeArray(newArray);
    setMfaCode(newArray.join(""));

    // Shift focus forward
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Shift focus backward on backspace
    if (e.key === "Backspace" && codeArray[index] === "" && index > 0) {
      const newArray = [...codeArray];
      newArray[index - 1] = "";
      setCodeArray(newArray);
      setMfaCode(newArray.join(""));
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pasteData)) return;
    const charArray = pasteData.split("").slice(0, 6);
    setCodeArray(charArray);
    setMfaCode(pasteData);
    inputRefs.current[5]?.focus();
  };

  const handleCopySecret = () => {
    if (!mfaSecret) return;
    navigator.clipboard.writeText(mfaSecret);
    alert("Secret key copied to clipboard!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eef4f0] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#163022] to-[#1a3a2a] mb-4 shadow-lg hover:scale-105 transition-all duration-300">
            <svg className="w-8 h-8 text-[#84cc16]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-[#1a3a2a] tracking-tight">EcoFlow</h1>
          <p className="mt-2 text-sm text-slate-600 font-medium">Sign in to your operations dashboard</p>
        </div>

        {step === "credentials" && (
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-2.5 text-sm focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-200/50 transition-all duration-200 shadow-sm"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-2.5 text-sm focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-200/50 transition-all duration-200 shadow-sm"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#84cc16] px-4 py-3 text-sm font-bold text-[#1a3a2a] shadow-md transition-all hover:shadow-lg hover:bg-[#72b012] hover:-translate-y-0.5 active:translate-y-0 duration-200 transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <p className="text-center text-sm text-slate-500 mt-4">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Create account
              </Link>
            </p>
          </form>
        )}

        {step === "mfa_setup" && (
          <form onSubmit={handleMfaSubmit} className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform space-y-5">
            <div className="text-center">
              <h2 className="text-lg font-bold text-[#1a3a2a]">Configure Multi-Factor Authentication</h2>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">Scan this QR Code in Google Authenticator or Microsoft Authenticator app on your phone:</p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {mfaQrCode && (
              <div className="flex justify-center p-4 bg-slate-50 border border-slate-100 rounded-xl shadow-inner">
                <img src={mfaQrCode} alt="MFA QR Code" className="w-48 h-48 rounded shadow-sm" />
              </div>
            )}

            {mfaSecret && (
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between text-xs text-slate-600">
                <div className="truncate pr-2">
                  <span className="font-semibold block text-[10px] text-slate-400 uppercase tracking-wider">Secret Key</span>
                  <code className="font-mono text-slate-800 font-bold">{mfaSecret}</code>
                </div>
                <button
                  type="button"
                  onClick={handleCopySecret}
                  className="shrink-0 bg-white border border-slate-350 hover:bg-slate-50 text-slate-700 px-2.5 py-1.5 rounded-lg text-[10px] font-bold shadow-sm active:scale-95 transition-all"
                >
                  Copy
                </button>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="mfaCode" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Enter 6-digit verification code
              </label>
              
              <div className="flex justify-between gap-2" onPaste={handlePaste}>
                {codeArray.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-12 h-14 text-center text-2xl font-extrabold border border-slate-300 bg-slate-50/50 rounded-xl focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-200/50 transition-all duration-200 shadow-sm"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || mfaCode.length !== 6}
              className="w-full rounded-xl bg-[#84cc16] px-4 py-3 text-sm font-bold text-[#1a3a2a] shadow-md transition-all hover:shadow-lg hover:bg-[#72b012] hover:-translate-y-0.5 active:translate-y-0 duration-200 transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify & Log In"}
            </button>
            
            <button
              type="button"
              onClick={() => setStep("credentials")}
              className="w-full text-center text-xs font-semibold text-slate-500 hover:text-[#1a3a2a] transition duration-200"
            >
              Back to Sign In
            </button>
          </form>
        )}

        {step === "mfa_verify" && (
          <form onSubmit={handleMfaSubmit} className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform space-y-5">
            <div className="text-center">
              <h2 className="text-lg font-bold text-[#1a3a2a]">Multi-Factor Authentication</h2>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">Please enter the 6-digit verification code generated by your Authenticator app:</p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="mfaCode" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Verification Code
              </label>

              <div className="flex justify-between gap-2" onPaste={handlePaste}>
                {codeArray.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-12 h-14 text-center text-2xl font-extrabold border border-slate-300 bg-slate-50/50 rounded-xl focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-200/50 transition-all duration-200 shadow-sm"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || mfaCode.length !== 6}
              className="w-full rounded-xl bg-[#84cc16] px-4 py-3 text-sm font-bold text-[#1a3a2a] shadow-md transition-all hover:shadow-lg hover:bg-[#72b012] hover:-translate-y-0.5 active:translate-y-0 duration-200 transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify & Log In"}
            </button>

            <button
              type="button"
              onClick={() => setStep("credentials")}
              className="w-full text-center text-xs font-semibold text-slate-500 hover:text-[#1a3a2a] transition duration-200"
            >
              Back to Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
