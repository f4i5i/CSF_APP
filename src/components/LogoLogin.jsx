import React from "react";
import baseLogo from "../assets/logo.png"; // white logo outline
import crown from "../assets/Carolina.png"; // golden crown

const LogoLogin = () => {
  return (
    <div className="">
    <div className="flex justify-center items-center mb-4  w-[108px] 
          h-[108px]  relative">

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
    </div>
  );
};

export default LogoLogin;
