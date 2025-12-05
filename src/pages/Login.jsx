import React, { useState } from 'react'
import InputField from '../components/InputField'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth'
import LogoLogin from '../components/LogoLogin'
import GoogleSignInButton from '../components/auth/GoogleSignInButton'
import { Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const redirectForRole = (user) => {
    const normalizedRole = user?.role?.toUpperCase()
    const roleMapping = {
      COACH: { route: '/coachdashboard', storage: 'coach' },
      ADMIN: { route: '/admin', storage: 'admin' },
      OWNER: { route: '/admin', storage: 'admin' },
      PARENT: { route: '/dashboard', storage: 'parent' },
      STUDENT: { route: '/dashboard', storage: 'student' },
    }

    const target = normalizedRole ? roleMapping[normalizedRole] : undefined

    if (target) {
      localStorage.setItem('role', target.storage)
      navigate(target.route, { replace: true })
    } else {
      console.warn('Unknown role:', user?.role)
      localStorage.setItem('role', 'parent')
      navigate('/dashboard', { replace: true })
    }
  }

  // function handleSubmit(e) {
  //   e.preventDefault()
  //    localStorage.setItem("role", "student");
  //   navigate("/dashboard")
  // }
 async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);

  try {
    const user = await login(email, password)
    redirectForRole(user)
  } catch (error) {
    console.error("Login error:", error);
  } finally {
    setLoading(false);
  }
}

 const handleGoogleSuccess = async (credential) => {
  try {
    const user = await loginWithGoogle(credential)
    redirectForRole(user)
  } catch (error) {
    console.error('Google login error:', error)
  }
 }

 const handleGoogleError = (message) => {
  console.error('Google login error:', message)
 }


  return (
    <div className="h-screen w-full flex flex-col justify-center items-center overflow-y-auto px-3 sm:px-6">

  {/* Dotted Background */}
    <div className="absolute inset-0 bg-[radial-gradient(#a1acc7_1px,transparent_1px)] [background-size:18px_18px] opacity-70"></div>

<div className='relative justify-center items-center w-full max-w-md sm:max-w-lg px-2 sm:px-4 my-auto'>
      {/* LOGIN CARD */}
      <div className="bg-white shadow-2xl rounded-2xl p-4 sm:p-6 md:p-10">
       <div className="flex justify-center items-center mb-2 sm:mb-4">
        <LogoLogin />
</div>
        <h2 className="text-lg sm:text-xl md:text-2xl font-manrope text-center font-semibold text-[#173151]">
          Welcome Back
        </h2>
        <p className="text-center font-manrope font-normal text-xs sm:text-sm md:text-base text-[#666D80] mt-1 mb-3 sm:mb-4 md:mb-6">
          Glad to see you again. Log in to your account.
        </p>

        <form onSubmit={handleSubmit}>

          <div className="mb-3 sm:mb-4">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-md border border-gray-300 outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="mb-3 sm:mb-4 relative">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Password <span className="text-red-500">*</span>
            </label>

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg pr-10 focus:ring-2 focus:ring-primary outline-none"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* SHOW/HIDE BUTTON */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8 sm:top-9 text-gray-500 hover:text-gray-700 transition"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm font-normal font-manrope text-gray-600 mb-3 sm:mb-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-3 h-3 sm:w-4 sm:h-4 text-[#0d0d12]" /> Keep me login
            </label>
            <Link to="/forgot-password" className="text-[#F3BC48] hover:underline">Forgot Password?</Link>
          </div>

          <button
            type="submit"
            className="w-full bg-primary font-['inter'] py-2 sm:py-2.5 text-sm sm:text-base rounded-lg font-semibold bg-[#F3BC48] transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
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

        <p className="text-center font-['inter'] text-xs sm:text-sm md:text-base font-normal text-gray-500 mt-3 sm:mt-4 md:mt-6">
          Don't have an account?
          <Link to="/register" className="text-[#F3BC48] font-medium ml-1">
            Register
          </Link>
        </p>
      </div>
      </div>
    </div>
  )
}
