import React from "react";
import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link to="/dashboard" className="inline-block">
      <div className="hidden md:flex justify-center items-center w-[108px] h-[108px] relative cursor-pointer">
        <img
          src="/assets/brand/csf-logo.png"
          alt="Carolina Soccer Factory"
          className="object-contain"
        />
      </div>
    </Link>
  );
};

export default Logo;
