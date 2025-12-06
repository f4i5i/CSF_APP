import React from "react";
import { Link } from "react-router-dom";
import baseLogo from "../assets/logo.png"; // white logo outline
import crown from "../assets/Carolina.png"; // golden crown

const LogoLogin = () => {
  return (
    <Link to="/" className="inline-block">
    <div className="flex justify-center items-center mb-4  w-[108px]
          h-[108px]  relative cursor-pointer">

      {/* Logo Outline (turns black using blend mode) */}
      <img
        src={baseLogo}
        alt="Outline"
        className="
          object-contain 
          mix-blend-exclusion
        "
      />

      {/* Golden Crown (no blend → keeps gold color) */}
      <img
        src={crown}
        alt="Crown"
        className="
          absolute
          w-[22px]
          h-[12px]
          top-[26px]
          left-1/2
          -translate-x-1/2
          object-contain
        "
      />
    </div>
    </Link>
  );
};

export default LogoLogin;
