import React, { useState } from 'react'
import InputField from '../components/InputField'
import Logo from '../components/Logo'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth'
import LogoLogin from '../components/LogoLogin'


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
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      await register(formData)
      navigate("/dashboard")
    } catch (error) {
      // Error already handled by auth context (toast shown)
      console.error('Registration error:', error)
    } finally {
      setLoading(false)
    }
  }

return (
    <div className="w-full flex flex-col justify-center items-center overflow-hidden px-4 sm:px-6">

  {/* Dotted Background */}
    <div className="absolute inset-0 bg-[radial-gradient(#a1acc7_1px,transparent_1px)] [background-size:18px_18px] opacity-70"></div>

<div className='relative justify-center items-center w-full max-w-md sm:max-w-lg md:max-w-2xl px-4 sm:px-6'>
      {/* REGISTER CARD */}
      <div className="bg-white shadow-2xl rounded-2xl sm:rounded-3xl px-6 sm:px-8 md:px-10 py-6 sm:py-8 md:py-10">
       <div className="flex justify-center items-center">
        <LogoLogin />
</div>
<h2 className="text-xl sm:text-2xl text-center font-semibold text-[#0f172a]">Create Account</h2>
<p className="text-center text-sm sm:text-base text-gray-500 mt-1 mb-4 sm:mb-6">Create your account to get started.</p>

<form onSubmit={handleSubmit}>
  <div className='grid gap-3 sm:gap-4 md:grid-cols-2'>
<InputField
  label="First Name"
  name="first_name"
  placeholder="Enter your first name"
  value={formData.first_name}
  onChange={handleChange}
/>
<InputField
  label="Last Name"
  name="last_name"
  placeholder="Enter your last name"
  value={formData.last_name}
  onChange={handleChange}
/>
<InputField
  label="Email Address"
  type="email"
  name="email"
  placeholder="Enter your email"
  value={formData.email}
  onChange={handleChange}
/>
<InputField
  label="Phone (optional)"
  name="phone"
  placeholder="Enter your phone number"
  value={formData.phone}
  onChange={handleChange}
/>
<InputField
  label="Password"
  type="password"
  name="password"
  placeholder="Create a password"
  value={formData.password}
  onChange={handleChange}
/>
<InputField
  label="Confirm Password"
  type="password"
  name="confirm_password"
  placeholder="Confirm your password"
  value={formData.confirm_password}
  onChange={handleChange}
/>

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
