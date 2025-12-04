import React from 'react'
import Header from '../components/Header'
import img1 from "../assets/image (1).png"
import img2 from "../assets/image (2).png"
import img3 from "../assets/image (3).png"
import img4 from "../assets/image (4).png"
import img5 from "../assets/image (5).png"
import img6 from "../assets/image (6).png"
import img7 from "../assets/image7.jpg"
import img8 from "../assets/image8.jpg"
import img9 from "../assets/image9.jpg"
import img10 from "../assets/image10.jpg"

const Gallery = () => {
  return (
  <div className=" min-h-screen max-sm:h-fit bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] opacity-8 max-sm:pb-20">

      <Header />
 <main className="mx-6 py-8 max-sm:py-2 max-sm:mx-3">
 <h1 className="text-[32px] xxl1:text-[46px] font-manrope font-bold text-[#173151] mb-6">
                    Photo Gallery
                  </h1>
  <div className="grid grid-cols-3 max-sm:grid-cols-1 gap-4">

    {/* Column 1 */}
    <div className="flex flex-col gap-4">
      <img src={img1} className="w-full object-cover rounded-xl" />
      <img src={img4} className="w-full object-cover rounded-xl" />
      <img src={img9} className="w-full object-cover rounded-xl" />
    </div>

    {/* Column 2 */}
    <div className="flex flex-col gap-4">
      <img src={img2} className="w-full object-cover rounded-xl" />
      <img src={img5} className="w-full object-cover rounded-xl" />
      <img src={img8} className="w-full object-cover rounded-xl" />
    </div>

    {/* Column 3 */}
    <div className="flex flex-col gap-4">
      <img src={img3} className="w-full object-cover rounded-xl" />
      <img src={img6} className="w-full object-cover rounded-xl" />
      <img src={img7} className="w-full object-cover rounded-xl" />
      {/* <img src={img10} className="w-full object-cover rounded-xl" /> */}
    </div>

  </div>

</main>

    </div>
  )
}

export default Gallery