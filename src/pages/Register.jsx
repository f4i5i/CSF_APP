import React, { useState } from 'react'
import InputField from '../components/InputField'
import Logo from '../components/Logo'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth'
import LogoLogin from '../components/LogoLogin'
import { Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'


export default function Register(){
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required'
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required'
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    // Confirm password validation
    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password'
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match'
    }

    // Phone validation (optional but must be valid if provided)
    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setLoading(true)

    try {
      await register(formData)
      toast.success('Account created successfully!')
      navigate("/dashboard")
    } catch (error) {
      // Error already handled by auth context (toast shown)
      console.error('Registration error:', error)
    } finally {
      setLoading(false)
    }
  }

return (
    <div className="h-screen w-full flex flex-col justify-center items-center overflow-y-auto px-3 sm:px-6">

  {/* Dotted Background */}
    <div className="absolute inset-0 bg-[radial-gradient(#a1acc7_1px,transparent_1px)] [background-size:18px_18px] opacity-70"></div>

<div className='relative justify-center items-center w-full max-w-md sm:max-w-lg md:max-w-2xl px-2 sm:px-4 md:px-6 my-auto'>
      {/* REGISTER CARD */}
      <div className="bg-white shadow-2xl rounded-2xl sm:rounded-3xl px-4 sm:px-6 md:px-10 py-4 sm:py-6 md:py-10">
       <div className="flex justify-center items-center mb-2 sm:mb-3">
        <LogoLogin />
</div>
<h2 className="text-lg sm:text-xl md:text-2xl text-center font-semibold text-[#0f172a]">Create Account</h2>
<p className="text-center text-xs sm:text-sm md:text-base text-gray-500 mt-1 mb-3 sm:mb-4 md:mb-6">Create your account to get started.</p>

<form onSubmit={handleSubmit}>
  <div className='grid gap-3 sm:gap-4 md:grid-cols-2'>
    {/* First Name */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        First Name <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        name="first_name"
        placeholder="Enter your first name"
        value={formData.first_name}
        onChange={handleChange}
        className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-md border ${errors.first_name ? 'border-red-500' : 'border-gray-300'} outline-none focus:ring-2 focus:ring-primary`}
      />
      {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
    </div>

    {/* Last Name */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Last Name <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        name="last_name"
        placeholder="Enter your last name"
        value={formData.last_name}
        onChange={handleChange}
        className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-md border ${errors.last_name ? 'border-red-500' : 'border-gray-300'} outline-none focus:ring-2 focus:ring-primary`}
      />
      {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
    </div>

    {/* Email */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Email Address <span className="text-red-500">*</span>
      </label>
      <input
        type="email"
        name="email"
        placeholder="Enter your email"
        value={formData.email}
        onChange={handleChange}
        className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-md border ${errors.email ? 'border-red-500' : 'border-gray-300'} outline-none focus:ring-2 focus:ring-primary`}
      />
      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
    </div>

    {/* Phone */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Phone (optional)
      </label>
      <input
        type="tel"
        name="phone"
        placeholder="Enter your phone number"
        value={formData.phone}
        onChange={handleChange}
        className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-md border ${errors.phone ? 'border-red-500' : 'border-gray-300'} outline-none focus:ring-2 focus:ring-primary`}
      />
      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
    </div>

    {/* Password */}
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Password <span className="text-red-500">*</span>
      </label>
      <input
        type={showPassword ? "text" : "password"}
        name="password"
        placeholder="Create a password (min 8 characters)"
        value={formData.password}
        onChange={handleChange}
        className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-md border ${errors.password ? 'border-red-500' : 'border-gray-300'} outline-none focus:ring-2 focus:ring-primary pr-10`}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 transition"
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
      {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
    </div>

    {/* Confirm Password */}
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Confirm Password <span className="text-red-500">*</span>
      </label>
      <input
        type={showConfirmPassword ? "text" : "password"}
        name="confirm_password"
        placeholder="Confirm your password"
        value={formData.confirm_password}
        onChange={handleChange}
        className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-md border ${errors.confirm_password ? 'border-red-500' : 'border-gray-300'} outline-none focus:ring-2 focus:ring-primary pr-10`}
      />
      <button
        type="button"
        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 transition"
      >
        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
      {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password}</p>}
    </div>
  </div>
<button
  type="submit"
  className="w-full bg-primary text-black font-semibold py-2 sm:py-3 text-sm sm:text-base rounded-lg shadow hover:bg-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
  disabled={loading}
>
  {loading ? 'Creating account...' : 'Register'}
</button>
</form>

<p className="text-center text-sm sm:text-base text-gray-600 mt-4 sm:mt-6">Already have an account? <Link to="/login" className="text-primary font-medium">Login</Link></p>
</div>
</div>
</div>
)
}
