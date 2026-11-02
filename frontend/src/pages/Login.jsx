
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, ArrowRight, LoaderCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(() => {
    const message = sessionStorage.getItem("tejo_session_message");

    sessionStorage.removeItem("tejo_session_message");

    return message || "";
  });
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      await login(email.trim().toLowerCase(), password);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to log in. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#111615] px-5 py-10">
      <div className="grid w-full max-w-[1000px] overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">

        {/* Brand panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-[#111615] p-10 text-white lg:flex">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#b8f34a]/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#b8f34a]/10 blur-3xl" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b8f34a] font-black text-[#111615]">
              TE
            </div>

            <div>
              <h1 className="text-xl font-bold">
                TEJO <span className="text-[#b8f34a]">EV</span>
              </h1>
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                Mobility Systems
              </p>
            </div>
          </div>

          <div className="relative">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#b8f34a]">
              Dealer Management System
            </p>

            <h2 className="text-4xl font-bold leading-tight tracking-tight">
              Manage your
              <br />
              network.
              <br />
              Move forward.
            </h2>

            <p className="mt-5 max-w-sm text-sm leading-6 text-white/45">
              A unified workspace for vehicle inventory, dealer operations,
              stock management, and business performance.
            </p>
          </div>

          <p className="relative text-xs text-white/25">
            © TEJO EV · Mobility Systems
          </p>
        </div>

        {/* Login form */}
        <div className="flex items-center justify-center px-7 py-12 sm:px-12">
          <div className="w-full max-w-[380px]">

            <div className="mb-9 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b8f34a] font-black text-[#111615]">
                  TE
                </div>

                <h1 className="text-xl font-bold text-[#111615]">
                  TEJO <span className="text-[#7baa27]">EV</span>
                </h1>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7baa27]">
                Welcome Back
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#111615]">
                Sign in
              </h2>

              <p className="mt-2 text-sm text-black/45">
                Enter your account details to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">

              {/* Email */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-black/65">
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/30"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@tejoev.com"
                    required
                    autoComplete="email"
                    className="h-12 w-full rounded-xl border border-black/10 bg-[#fafbf9] pl-11 pr-4 text-sm outline-none transition focus:border-[#8fca32] focus:bg-white focus:ring-4 focus:ring-[#b8f34a]/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-black/65">
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/30"
                  />

                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="h-12 w-full rounded-xl border border-black/10 bg-[#fafbf9] pl-11 pr-4 text-sm outline-none transition focus:border-[#8fca32] focus:bg-white focus:ring-4 focus:ring-[#b8f34a]/10"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#111615] text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in to Dashboard
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-black/35">
              Authorized TEJO EV personnel only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
