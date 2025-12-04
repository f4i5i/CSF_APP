import React from 'react'

const InputField = ({ label, type = "text", name, placeholder, value, onChange, required = true }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        // required={required}
        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-md border border-gray-300 outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  )
}

export default InputField