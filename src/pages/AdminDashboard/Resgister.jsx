import Logo from "../../components/Logo";
import React from "react";
import { Link } from "react-router-dom";

export default function Resgister() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] p-6">
      <div className="w-full max-w-5xl bg-white/90 rounded-3xl p-10 md:p-16 shadow-lg" style={{boxShadow: '0 10px 40px rgba(16,24,40,0.08)'}}>
        <div className="flex flex-col items-center gap-4">
            <Logo />
          <h1 className="text-[24px] md:text-[28px] font-kollektif font-semibold text-text-primary">Carolina Soccer Factory</h1>
          <p className="text-base text-text-muted font-manrope">Choose Area:</p>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 font-manrope">
          {[
            { id: "charlotte", label: "Charlotte" },
            { id: "triangle", label: "Triangle" },
            { id: "greensboro", label: "Greensboro" },
          ].map((area) => (
            <button
              key={area.id}
              className="flex flex-col items-center justify-center gap-3 bg-white rounded-2xl py-10 shadow-md hover:shadow-lg transition text-center"
            >
              <img src="/images/location.png" alt="location" className="w-10 h-10 opacity-90" />
              <span className="text-lg font-manrope font-medium text-text-primary">{area.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-text-muted font-manrope">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-btn-gold font-manrope">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}