import React from "react";
import Header from "../components/Header";
import img1 from "../assets/image (1).png";
import img2 from "../assets/image (2).png";
import img3 from "../assets/image (3).png";
import img4 from "../assets/image (4).png";
import img5 from "../assets/image (5).png";
import img6 from "../assets/image (6).png";
import img7 from "../assets/image7.jpg";
import img8 from "../assets/image8.jpg";
import img9 from "../assets/image9.jpg";

const Gallery = () => {
  return (
    <div className=" min-h-screen max-sm:h-fit bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] opacity-8 max-sm:pb-20">
      <Header />
      <main className="mx-6 py-8 max-sm:py-2 max-sm:mx-3">
        <h1 className="text-[32px] xl:text-[32px] xxl1:text-[46px] font-manrope font-bold text-[#173151] mb-6 max-sm:text-2xl">
          Photo Gallery
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-sm:gap-3">
          {/* Column 1 */}
          <div className="flex flex-col gap-4 md:gap-6 max-sm:gap-3">
            <img
              src={img1}
              className="w-full h-auto object-cover rounded-xl shadow-md hover:shadow-lg transition-shadow"
              alt="gallery"
            />
            <img
              src={img4}
              className="w-full h-auto object-cover rounded-xl shadow-md hover:shadow-lg transition-shadow"
              alt="gallery"
            />
            <img
              src={img9}
              className="w-full h-auto object-cover rounded-xl shadow-md hover:shadow-lg transition-shadow"
              alt="gallery"
            />
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-4 md:gap-6 max-sm:gap-3">
            <img
              src={img2}
              className="w-full h-auto object-cover rounded-xl shadow-md hover:shadow-lg transition-shadow"
              alt="gallery"
            />
            <img
              src={img5}
              className="w-full h-auto object-cover rounded-xl shadow-md hover:shadow-lg transition-shadow"
              alt="gallery"
            />
            <img
              src={img8}
              className="w-full h-auto object-cover rounded-xl shadow-md hover:shadow-lg transition-shadow"
              alt="gallery"
            />
          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-4 md:gap-6 max-sm:gap-3">
            <img
              src={img3}
              className="w-full h-auto object-cover rounded-xl shadow-md hover:shadow-lg transition-shadow"
              alt="gallery"
            />
            <img
              src={img6}
              className="w-full h-auto object-cover rounded-xl shadow-md hover:shadow-lg transition-shadow"
              alt="gallery"
            />
            <img
              src={img7}
              className="w-full h-auto object-cover rounded-xl shadow-md hover:shadow-lg transition-shadow"
              alt="gallery"
            />
            {/* <img src={img10} className="w-full h-auto object-cover rounded-xl shadow-md hover:shadow-lg transition-shadow" alt="gallery" /> */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Gallery;
