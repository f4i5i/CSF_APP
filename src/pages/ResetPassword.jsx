import React, { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import LogoLogin from '../components/LogoLogin'
import toast from 'react-hot-toast'
import { authService } from '../api/services/auth.service'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!password.trim()) {
      toast.error('Please enter a new password')
      return
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (!token) {
      toast.error('Invalid or missing reset token')
      return
    }

    setLoading(true)

    try {
      await authService.resetPassword(token, password)
      setSuccess(true)
      toast.success('Password reset successfully!')
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to reset password. The link may have expired.'
      toast.error(message)
      console.error('Reset password error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="h-screen w-full flex flex-col justify-center items-center overflow-y-auto px-3 sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(#a1acc7_1px,transparent_1px)] [background-size:18px_18px] opacity-70"></div>
        <div className='relative justify-center items-center w-full max-w-md sm:max-w-lg px-2 sm:px-4 my-auto'>
          <div className="bg-white shadow-2xl rounded-2xl p-4 sm:p-6 md:p-10">
            <div className="flex justify-center items-center mb-2 sm:mb-3">
              <LogoLogin />
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-manrope text-center font-semibold text-[#173151]">
              Invalid Reset Link
            </h2>
            <p className="text-center font-manrope font-normal text-xs sm:text-sm md:text-base text-[#666D80] mt-2 mb-4 sm:mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link
              to="/forgot-password"
              className="block w-full text-center bg-primary font-['inter'] py-2 sm:py-3 text-sm sm:text-base rounded-lg font-semibold bg-[#F3BC48] transition hover:bg-yellow-500"
            >
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="h-screen w-full flex flex-col justify-center items-center overflow-y-auto px-3 sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(#a1acc7_1px,transparent_1px)] [background-size:18px_18px] opacity-70"></div>
        <div className='relative justify-center items-center w-full max-w-md sm:max-w-lg px-2 sm:px-4 my-auto'>
          <div className="bg-white shadow-2xl rounded-2xl p-4 sm:p-6 md:p-10">
            <div className="flex justify-center items-center mb-2 sm:mb-3">
              <LogoLogin />
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-manrope text-center font-semibold text-[#173151]">
              Password Reset Successful
            </h2>
            <p className="text-center font-manrope font-normal text-xs sm:text-sm md:text-base text-[#666D80] mt-2 mb-4 sm:mb-6">
              Your password has been updated. You can now log in with your new password.
            </p>
            <Link
              to="/login"
              className="block w-full text-center bg-primary font-['inter'] py-2 sm:py-3 text-sm sm:text-base rounded-lg font-semibold bg-[#F3BC48] transition hover:bg-yellow-500"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full flex flex-col justify-center items-center overflow-y-auto px-3 sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(#a1acc7_1px,transparent_1px)] [background-size:18px_18px] opacity-70"></div>
      <div className='relative justify-center items-center w-full max-w-md sm:max-w-lg px-2 sm:px-4 my-auto'>
        <div className="bg-white shadow-2xl rounded-2xl p-4 sm:p-6 md:p-10">
          <div className="flex justify-center items-center mb-2 sm:mb-3">
            <LogoLogin />
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-manrope text-center font-semibold text-[#173151]">
            Reset Your Password
          </h2>
          <p className="text-center font-manrope font-normal text-xs sm:text-sm md:text-base text-[#666D80] mt-1 mb-3 sm:mb-4 md:mb-6">
            Enter your new password below.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-md border border-gray-300 outline-none focus:ring-2 focus:ring-primary"
                required
                minLength={8}
              />
            </div>

            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-md border border-gray-300 outline-none focus:ring-2 focus:ring-primary"
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary font-['inter'] py-2 sm:py-2.5 text-sm sm:text-base rounded-lg font-semibold bg-[#F3BC48] transition hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
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
