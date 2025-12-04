import React, { useState } from 'react'
import InputField from '../components/InputField'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth'
import LogoLogin from '../components/LogoLogin'
import GoogleSignInButton from '../components/auth/GoogleSignInButton'

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
    <div className="w-full flex flex-col justify-center items-center overflow-hidden px-4 sm:px-6">

  {/* Dotted Background */}
    <div className="absolute inset-0 bg-[radial-gradient(#a1acc7_1px,transparent_1px)] [background-size:18px_18px] opacity-70"></div>

<div className='relative justify-center items-center w-full max-w-md sm:max-w-lg px-4'>
      {/* LOGIN CARD */}
      <div className="bg-white shadow-2xl rounded-2xl p-6 sm:p-8 md:p-10">
       <div className="flex justify-center items-center">
        <LogoLogin />
</div>
        <h2 className="text-xl sm:text-2xl font-manrope text-center font-semibold text-[#173151]">
          Welcome Back
        </h2>
        <p className="text-center font-manrope font-normal text-sm sm:text-base text-[#666D80] mt-1 mb-4 sm:mb-6">
          Glad to see you again. Log in to your account.
        </p>

        <form onSubmit={handleSubmit}>

          <InputField
            label="Email Address"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="w-full px-4 py-3 border rounded-lg pr-12 focus:ring-2 focus:ring-primary"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* SHOW/HIDE BUTTON */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-11 text-gray-500"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="flex max-sm:flex  items-center justify-between text-sm font-normal font-manrope text-gray-600 mb-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4 text-[#0d0d12]" /> Keep me login
            </label>
            <Link className="text-[#F3BC48]">Forgot Password?</Link>
          </div>

          <button
            type="submit"
            className="w-full bg-primary font-['inter'] py-2 sm:py-3 text-sm sm:text-base rounded-lg font-semibold bg-[#F3BC48] transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="mt-6 flex flex-col items-center">
            <div className="w-full max-w-xs">
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

        <p className="text-center font-['inter'] text-sm sm:text-base font-normal text-gray-500 mt-4 sm:mt-6">
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
