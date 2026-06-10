import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/api.js";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await register(username, password, accessCode);
      navigate("/login");
    } catch (err) {
      if (err.status === 409) {
        setError("Username is already taken. Please choose another.");
      } else if (err.status === 403) {
        setError("Invalid registration access code.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
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
          <p className="mt-2 text-sm text-slate-600 font-medium">Create your operations account</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="reg-username" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Username
            </label>
            <input
              id="reg-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-2.5 text-sm focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-200/50 transition-all duration-200 shadow-sm"
              placeholder="Choose a username"
            />
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-2.5 text-sm focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-200/50 transition-all duration-200 shadow-sm"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label htmlFor="reg-confirm-password" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Confirm Password
            </label>
            <input
              id="reg-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-2.5 text-sm focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-200/50 transition-all duration-200 shadow-sm"
              placeholder="Re-enter your password"
            />
          </div>

          <div>
            <label htmlFor="reg-access-code" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Registration Access Code
            </label>
            <input
              id="reg-access-code"
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-2.5 text-sm focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-200/50 transition-all duration-200 shadow-sm"
              placeholder="Enter authority code"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#84cc16] px-4 py-3 text-sm font-bold text-[#1a3a2a] shadow-md transition-all hover:shadow-lg hover:bg-[#72b012] hover:-translate-y-0.5 active:translate-y-0 duration-200 transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
