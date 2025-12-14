import React from "react";
import { Link } from "react-router-dom";

export default function Resgister() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e3e5e6] via-[#b7c3d1] to-[#a4b4c8] relative">
      {/* <div className="absolute inset-0 bg-[radial-gradient(#a1acc7_1px,transparent_1px)] [background-size:18px_18px] opacity-70"></div> */}

      <div className="w-full max-w-[790px] bg-[#FFFFFF80] rounded-3xl  pt-[30px] pb-[13px]">
        <div className="flex flex-col items-center gap-2">
          {/* <Logo /> */}
          <img
            src="/images/logo.png"
            alt="location"
            className="size-[140px]  object-contain 
          mix-blend-exclusion"
          />

          <h1 className="text-[24px] md:text-[28px] font-kollektif font-normal text-text-primary">
            Carolina Soccer Factory
          </h1>
          <p className="text-base text-text-muted font-manrope">Choose Area:</p>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 items-center justify-center">
          {[
            { id: "charlotte", label: "Charlotte" },
            { id: "triangle", label: "Triangle" },
            { id: "greensboro", label: "Greensboro" },
          ].map((area) => (
            <button
              key={area.id}
              className="flex flex-col items-center justify-center w-full md:max-w-[225px]  gap-3 bg-[#FFFFFF80] rounded-[20px] py-[52px] shadow-sm text-center"
            >
              <img
                src="/images/location.png"
                alt="location"
                className="size-[20px] "
              />
              <span className="text-lg font-kollektif font-bold text-text-primary">
                {area.label}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-[70px] text-center">
          <p className="text-base text-text-muted font-manrope">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-btn-gold font-manrope"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
