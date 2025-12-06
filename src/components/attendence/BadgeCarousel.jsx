import React, { useRef, useEffect } from "react";
import BadgeCard from "./BadgeCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function BadgeCarousel({ badges }) {
  const scrollRef = useRef();
  const isScrollingRef = useRef(false);

  // Create tripled array for seamless infinite scroll
  const tripleAr = [...badges, ...badges, ...badges];

  useEffect(() => {
    // Start at middle set on mount
    const container = scrollRef.current;
    if (container && badges.length > 0) {
      const isMobile = window.innerWidth < 640;
      const cardWidth = isMobile ? 160 : 200;
      const gap = isMobile ? 12 : 16;
      const singleSetWidth = badges.length * (cardWidth + gap);

      // Start at the beginning of the middle set (no animation)
      container.scrollLeft = singleSetWidth;
    }
  }, [badges.length]);

  const scroll = (dir) => {
    const container = scrollRef.current;
    if (!container || isScrollingRef.current) return;

    isScrollingRef.current = true;

    // Calculate exact card width + gap based on screen size
    const isMobile = window.innerWidth < 640;
    const cardWidth = isMobile ? 160 : 200;
    const gap = isMobile ? 12 : 16;
    const scrollAmount = cardWidth + gap;
    const singleSetWidth = badges.length * (cardWidth + gap);

    if (dir === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }

    // After scroll animation completes, check if we need to reset position
    setTimeout(() => {
      const currentScroll = container.scrollLeft;

      // If scrolled past the end of middle set, jump to start of middle set
      if (currentScroll >= singleSetWidth * 2) {
        container.scrollLeft = currentScroll - singleSetWidth;
      }
      // If scrolled before the start of middle set, jump to end of middle set
      else if (currentScroll < singleSetWidth) {
        container.scrollLeft = currentScroll + singleSetWidth;
      }

      isScrollingRef.current = false;
    }, 300); // Match smooth scroll duration
  };

  return (
    <div className="relative w-full mt-6 flex justify-between items-center">
      {/* Left Arrow */}
      <button
        onClick={() => scroll("left")}
        className="w-9 h-9 max-sm:absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center bg-[#FFFFFF80] justify-center rounded-full shadow hover:bg-white transition"
      >
        <ChevronLeft size={18} className="text-black" />
      </button>

      {/* Scrollable Container - Infinite loop with tripled badges */}
      <div
        ref={scrollRef}
        className="flex items-center gap-4 max-sm:gap-3 overflow-x-auto no-scrollbar scroll-smooth max-sm:mx-12 sm:px-10 py-2"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {tripleAr.map((badge, i) => (
          <BadgeCard key={`badge-${i}`} {...badge} compact={true} />
        ))}
      </div>

      {/* Right Arrow */}
      <button
        onClick={() => scroll("right")}
        className="w-9 h-9 flex max-sm:absolute right-0 top-1/2 -translate-y-1/2 z-10 items-center bg-[#FFFFFF80] justify-center rounded-full shadow hover:bg-white transition"
      >
        <ChevronRight size={18} className="text-black" />
      </button>
    </div>
  );
}
