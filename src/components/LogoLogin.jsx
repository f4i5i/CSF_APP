import React from "react";
import { Link } from "react-router-dom";

const LogoLogin = () => {
  return (
    <Link to="/" className="inline-block">
      <div className="flex justify-center items-center mb-4 w-[108px] h-[108px] relative cursor-pointer">
        <img
          src="/assets/brand/csf-logo.png"
          alt="Carolina Soccer Factory"
          className="object-contain"
        />
      </div>
    </Link>
  );
};

export default LogoLogin;
