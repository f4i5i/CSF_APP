import React, { useRef } from "react";
import BadgeCard from "./BadgeCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function BadgeCarousel({ badges }) {
  const scrollRef = useRef();

  const scroll = (dir) => {
    scrollRef.current.scrollBy({
      left: dir === "left" ? -250 : 250,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative w-full mt-6 flex justify-between items-center">
      {/* Left Arrow */}
  <button
         onClick={() => scroll("left")}
          className="w-9 h-9 max-sm:absolute left-0 top-1/2 -translate-y-1/2 flex items-center bg-[#FFFFFF80] justify-center rounded-full  shadow "
        >
          <ChevronLeft size={18} className="text-black" />
        </button>
      <div
        ref={scrollRef}
      className="flex items-center  gap-6 overflow-x-hidden no-scrollbar max-sm:mx-4 sm:px-10 py-2"

      >
        {badges.map((badge, i) => (
          <BadgeCard key={i} {...badge} compact={true}/>
        ))}
      </div>

      {/* Right Arrow */}
      <button
          onClick={() => scroll("right")}
          className="w-9 h-9 flex max-sm:absolute right-0 top-1/2 -translate-y-1/2 items-center bg-[#FFFFFF80] justify-center rounded-full  shadow "
        >
          <ChevronRight size={18} className="text-black" />
        </button>
    </div>
  );
}
