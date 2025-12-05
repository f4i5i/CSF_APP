import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import LogoLogin from '../components/LogoLogin'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Email validation
    if (!email.trim()) {
      toast.error('Please enter your email address')
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      // TODO: Implement backend API call for password reset
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1500))

      setSubmitted(true)
      toast.success('Password reset instructions sent to your email')
    } catch (error) {
      toast.error('Failed to send reset email. Please try again.')
      console.error('Forgot password error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="h-screen w-full flex flex-col justify-center items-center overflow-y-auto px-3 sm:px-6">
        {/* Dotted Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#a1acc7_1px,transparent_1px)] [background-size:18px_18px] opacity-70"></div>

        <div className='relative justify-center items-center w-full max-w-md sm:max-w-lg px-2 sm:px-4 my-auto'>
          {/* SUCCESS CARD */}
          <div className="bg-white shadow-2xl rounded-2xl p-4 sm:p-6 md:p-10">
            <div className="flex justify-center items-center mb-2 sm:mb-3">
              <div className="scale-75 sm:scale-100">
                <LogoLogin />
              </div>
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-manrope text-center font-semibold text-[#173151]">
              Check Your Email
            </h2>
            <p className="text-center font-manrope font-normal text-xs sm:text-sm md:text-base text-[#666D80] mt-2 mb-4 sm:mb-6">
              We've sent password reset instructions to <strong>{email}</strong>
            </p>
            <p className="text-center text-sm text-gray-500 mb-6">
              If you don't see the email, please check your spam folder.
            </p>
            <Link
              to="/login"
              className="block w-full text-center bg-primary font-['inter'] py-2 sm:py-3 text-sm sm:text-base rounded-lg font-semibold bg-[#F3BC48] transition hover:bg-yellow-500"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full flex flex-col justify-center items-center overflow-y-auto px-3 sm:px-6">
      {/* Dotted Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#a1acc7_1px,transparent_1px)] [background-size:18px_18px] opacity-70"></div>

      <div className='relative justify-center items-center w-full max-w-md sm:max-w-lg px-2 sm:px-4 my-auto'>
        {/* FORGOT PASSWORD CARD */}
        <div className="bg-white shadow-2xl rounded-2xl p-4 sm:p-6 md:p-10">
          <div className="flex justify-center items-center mb-2 sm:mb-3">
            <div className="scale-75 sm:scale-100">
              <LogoLogin />
            </div>
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-manrope text-center font-semibold text-[#173151]">
            Forgot Password?
          </h2>
          <p className="text-center font-manrope font-normal text-xs sm:text-sm md:text-base text-[#666D80] mt-1 mb-3 sm:mb-4 md:mb-6">
            Enter your email and we'll send you instructions to reset your password.
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

            <button
              type="submit"
              className="w-full bg-primary font-['inter'] py-2 sm:py-2.5 text-sm sm:text-base rounded-lg font-semibold bg-[#F3BC48] transition hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Instructions'}
            </button>
          </form>

          <p className="text-center font-['inter'] text-xs sm:text-sm md:text-base font-normal text-gray-500 mt-3 sm:mt-4 md:mt-6">
            Remember your password?
            <Link to="/login" className="text-[#F3BC48] font-medium ml-1">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
