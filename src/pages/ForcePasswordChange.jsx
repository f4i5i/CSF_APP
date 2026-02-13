import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth'
import LogoLogin from '../components/LogoLogin'
import toast from 'react-hot-toast'
import apiClient from '../api/client'
import usersService from '../api/services/users.service'
import { API_ENDPOINTS } from '../constants/api.constants'
import { Eye, EyeOff } from 'lucide-react'

export default function ForcePasswordChange() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!newPassword.trim()) {
      toast.error('Please enter a new password')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    if (!/[A-Z]/.test(newPassword)) {
      toast.error('Password must contain at least one uppercase letter')
      return
    }

    if (!/[a-z]/.test(newPassword)) {
      toast.error('Password must contain at least one lowercase letter')
      return
    }

    if (!/[0-9]/.test(newPassword)) {
      toast.error('Password must contain at least one number')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      })

      // Re-fetch user from API to get updated must_change_password flag
      const freshUser = await usersService.getMe()
      updateUser(freshUser)

      toast.success('Password set successfully!')

      // Redirect based on role
      const normalizedRole = (freshUser?.role || user?.role)?.toUpperCase()
      const roleRoutes = {
        COACH: '/coachdashboard',
        ADMIN: '/admin',
        OWNER: '/admin',
        PARENT: '/dashboard',
        STUDENT: '/dashboard',
      }
      const targetRoute = roleRoutes[normalizedRole] || '/dashboard'
      navigate(targetRoute, { replace: true })
    } catch (error) {
      // Handle both transformed errors (from interceptor) and raw axios errors
      const message =
        error.message ||
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to change password. Please try again.'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen w-full flex flex-col justify-center items-center overflow-y-auto px-3 sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(#a1acc7_1px,transparent_1px)] [background-size:18px_18px] opacity-70"></div>
      <div className="relative justify-center items-center w-full max-w-md sm:max-w-lg px-2 sm:px-4 my-auto">
        <div className="bg-white shadow-2xl rounded-2xl p-4 sm:p-6 md:p-10">
          <div className="flex justify-center items-center mb-2 sm:mb-3">
            <LogoLogin />
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-manrope text-center font-semibold text-[#173151]">
            Set Your Password
          </h2>
          <p className="text-center font-manrope font-normal text-xs sm:text-sm md:text-base text-[#666D80] mt-1 mb-3 sm:mb-4 md:mb-6">
            Welcome! Please create a new password to secure your account.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Current/Temporary Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-md border border-gray-300 outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-md border border-gray-300 outline-none focus:ring-2 focus:ring-primary pr-10"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                At least 8 characters with uppercase, lowercase, and a number
              </p>
            </div>

            <div className="mb-4 sm:mb-6">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Confirm New Password <span className="text-red-500">*</span>
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
              {loading ? 'Setting Password...' : 'Set Password & Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
