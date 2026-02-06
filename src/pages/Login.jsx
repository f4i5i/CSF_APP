import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth";
import LogoLogin from "../components/LogoLogin";
import GoogleSignInButton from "../components/auth/GoogleSignInButton";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect logged-in users to their dashboard (or force password change)
  useEffect(() => {
    if (user) {
      if (user.must_change_password) {
        navigate("/force-password-change", { replace: true });
        return;
      }
      const normalizedRole = user?.role?.toUpperCase();
      const roleRoutes = {
        COACH: "/coachdashboard",
        ADMIN: "/admin",
        OWNER: "/admin",
        PARENT: "/dashboard",
        STUDENT: "/dashboard",
      };
      const targetRoute = roleRoutes[normalizedRole] || "/dashboard";
      navigate(targetRoute, { replace: true });
    }
  }, [user, navigate]);

  const redirectForRole = (user) => {
    const normalizedRole = user?.role?.toUpperCase();
    const roleMapping = {
      COACH: { route: "/coachdashboard", storage: "coach" },
      ADMIN: { route: "/admin", storage: "admin" },
      OWNER: { route: "/admin", storage: "admin" },
      PARENT: { route: "/dashboard", storage: "parent" },
      STUDENT: { route: "/dashboard", storage: "student" },
    };

    const target = normalizedRole ? roleMapping[normalizedRole] : undefined;

    if (target) {
      localStorage.setItem("role", target.storage);

      // Priority 1: Check if user was trying to register for a class
      const intendedClass = sessionStorage.getItem('intendedClass');
      if (intendedClass) {
        sessionStorage.removeItem('intendedClass');

        // Only allow parents to access checkout
        if (normalizedRole === 'PARENT') {
          navigate(`/checkout?classId=${intendedClass}`, { replace: true });
          return;
        } else {
          // Non-parent user - show error and go to their dashboard
          toast.error('Only parents can register for classes');
          navigate(target.route, { replace: true });
          return;
        }
      }

      // Priority 2: Check if user was redirected from another page
      const from = location.state?.from?.pathname;
      const intendedRoute = from && from !== '/login' ? from : target.route;

      // Navigate to intended page or fallback to role-based default
      navigate(intendedRoute, { replace: true });
    } else {
      console.warn("Unknown role:", user?.role);
      localStorage.setItem("role", "parent");
      navigate("/dashboard", { replace: true });
    }
  };

  // function handleSubmit(e) {
  //   e.preventDefault()
  //    localStorage.setItem("role", "student");
  //   navigate("/dashboard")
  // }
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(email, password);
      // Check if user must change password on first login
      if (user?.must_change_password) {
        navigate("/force-password-change", { replace: true });
        return;
      }
      redirectForRole(user);
    } catch (error) {
      // Error toast is already shown by auth context
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleSuccess = async (credential) => {
    try {
      const user = await loginWithGoogle(credential);
      if (user?.must_change_password) {
        navigate("/force-password-change", { replace: true });
        return;
      }
      redirectForRole(user);
    } catch (error) {
      // Error toast is already shown by auth context
      console.error("Google login error:", error);
    }
  };

  const handleGoogleError = (message) => {
    // Error toast is already shown by auth context
    console.error("Google login error:", message);
  };

  return (
    <div className=" w-full flex flex-col justify-center items-center overflow-y-auto  px-3 sm:px-6">
      {/* Dotted Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#a1acc7_1px,transparent_1px)] [background-size:18px_18px] opacity-70"></div>

      <div className="relative justify-center items-center w-full max-w-md sm:max-w-lg px-2 sm:px-4 my-auto">
        {/* LOGIN CARD */}
        <div className="bg-white shadow-2xl rounded-2xl max-sm:pb-8 p-4 sm:p-6 md:p-10">
          <div className="flex justify-center items-center mb-0 sm:mb-4">
            <LogoLogin />
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-manrope text-center font-semibold text-[#173151]">
            Welcome Back
          </h2>
          <p className="text-center font-manrope font-normal text-xs sm:text-sm md:text-base text-[#666D80] mt-1 mb-3 sm:mb-4 md:mb-6">
            Glad to see you again. Log in to your account.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3 max-sm:mt-8 sm:mb-4">
              <label className="block text-xs font-manrope sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full font-manrope px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-md border border-gray-300 outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="mb-3 sm:mb-4">
              <label className="block text-xs font-manrope sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Password <span className="text-red-500">*</span>
              </label>

              {/* Wrapping only the input + eye icon */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="w-full font-manrope px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg pr-10 focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="
        absolute
        right-3
        top-1/2 
        -translate-y-1/2
        text-gray-500 
        hover:text-gray-700 
        transition
      "
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex w-full max-w-[436px] items-start justify-between gap-4 text-xs sm:text-sm font-manrope mb-3 sm:mb-4">
              <label className="flex items-center gap-2 text-[#0D0D12]">
                <input
                  type="checkbox"
                  className="w-4 h-4 border border-[#DFE1E7] rounded-[4.8px] bg-white"
                />
                <span className="text-fluid-sm leading-[150%] tracking-[0.02em]">
                  Keep me login
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-[#F3BC48] font-manrope font-medium text-fluid-sm leading-[150%] tracking-[0.02em] text-right hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-primary font-['inter'] py-2 sm:py-2.5 text-sm sm:text-base rounded-lg font-semibold bg-[#F3BC48] transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="mt-4 sm:mt-6 flex flex-col items-center">
              <div className="w-full">
                <GoogleSignInButton
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                />
              </div>
            </div>

            {/* <button
  type="button"   // IMPORTANT
  onClick={() => {localStorage.setItem("role", "admin");
    navigate("/admin")}}
  className="w-full bg-primary font-['inter'] py-3 mt-3 rounded-lg font-semibold bg-[#F3BC48] transition disabled:opacity-50 disabled:cursor-not-allowed"
  disabled={loading}
>
  {loading ? 'Logging in...' : 'Coach Login'}
       </button> */}
          </form>

          <p className="text-center font-['inter'] text-xs sm:text-sm md:text-base font-normal  text-[#666d80] mt-3 sm:mt-4 md:mt-6">
            Don't have an account?
            <Link
              to="/register"
              state={location.state}
              className="text-[#F3BC48] font-medium ml-1"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
