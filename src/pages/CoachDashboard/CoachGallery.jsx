import React, { useState } from 'react'
import Header from '../../components/Header'

import Gallery from '../../components/Gallery'
import { Upload } from 'lucide-react'
import UploadPhotosModal from '../../components/UploadPhotosModal'

const CoachGallery = () => {
   const [open, setOpen] = useState(false);

  return (
  <div className=" min-h-screen max-sm:h-fit bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] opacity-8 max-sm:pb-20">

      <Header />
 <main className="mx-10 py-6 max-sm:py-2 max-sm:mx-3">
  <div className='w-full flex justify-between items-center max-sm:mb-6'>
 <h1 className="text-[32px] font-manrope font-bold text-[#173151] mb-6 max-sm:mb-0">
                    Photo Gallery
                  </h1>
                   <button className="
      flex items-center gap-2 
      bg-[#E4AC37] hover:bg-[#d9a12f]
      text-black font-semibold font-['inter'] 
      px-4 py-2 
      rounded-[60px] shadow
      transition
      text-base
    "
     onClick={() => setOpen(true)}
      >
      <Upload size={16} />
      Upload Photos
    </button>
                  </div>
 <Gallery/>

</main>
{open && <UploadPhotosModal onClose={() => setOpen(false)} />}
  
    </div>
  )
}

export default CoachGallery