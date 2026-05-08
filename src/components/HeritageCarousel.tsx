import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

interface CarouselItem {
  id: number;
  title: string;
  image: string;
  video?: string;
}

const ITEMS: CarouselItem[] = [
  {
    id: 1,
    title: "Yellow Embroidered Silk Kurta",
    image: "https://i.pinimg.com/736x/8f/94/8f/8f948f2191970b806d2036a1e3549652.jpg",
    video: "https://res.cloudinary.com/dz1a7jsy9/video/upload/v1777972440/235fd49ac8cb6a558322491bf0604373_zfo08z.mp4"
  },
  {
    id: 2,
    title: "Ivory Hand-loomed Heritage Saree",
    image: "https://i.pinimg.com/736x/1a/10/7c/1a107c89b8849646961405e3ba0c6810.jpg",
    video: "https://res.cloudinary.com/dz1a7jsy9/video/upload/v1777972441/From_KlickPin_CF_Aesthetic_boho_home_decor_ideas_that_look_expensive_while_staying_practical_realistic_and_beginner_friendly_for_people_who_want_stylish_ideas_on_a_-_Pin-757660337343178966_vq1qba.mp4"
  },
  {
    id: 3,
    title: "Muted Gold Royal Tunic",
    image: "https://i.pinimg.com/736x/91/9c/e8/919ce8d436a53697e8876a4ba2173167.jpg",
    video: "https://res.cloudinary.com/dz1a7jsy9/video/upload/v1777972442/From_KlickPin_CF_Waving_Flag_Films___Photography_and_Video_Production___Delhi_NCR_on_Instagram_Timeless_elegance_captured_in_every_fold_and_flow_The_beauty_of_Indian_tr___Startup_fashion_Fashion_photography_Fas_y4ktih.mp4"
  },
  {
    id: 4,
    title: "Charcoal Velvet Evening Wrap",
    image: "https://i.pinimg.com/736x/2b/8c/7e/2b8c7ec788c7f9914757c917b2b8c2be.jpg",
    video: "https://res.cloudinary.com/dz1a7jsy9/video/upload/v1777972443/8927ee10e4feeb3fcff0d0b6be0a287a_azaccy.mp4"
  },
  {
    id: 5,
    title: "Rosewood Silk Embroidered Scarf",
    image: "https://i.pinimg.com/736x/7d/87/42/7d87424687d698e3b1c1e5c8e4e93344.jpg",
    video: "https://res.cloudinary.com/dz1a7jsy9/video/upload/v1777972450/e155b6fe79dfa0368e127fd438adca71_zpbtni.mp4"
  },
  {
    id: 6,
    title: "Sandstone Linen Summer Set",
    image: "https://i.pinimg.com/736x/ab/f6/e1/abf6e1654a938c5d9a9ba952994e77fc.jpg",
    video: "https://res.cloudinary.com/dz1a7jsy9/video/upload/v1777972443/8927ee10e4feeb3fcff0d0b6be0a287a_azaccy.mp4"
  }
];

export default function HeritageCarousel() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [items, setItems] = useState(ITEMS);

  const applyOverrides = (dbRows: { id: number; title: string; video: string; image_urls?: string[] }[]) => {
    setItems(ITEMS.map(item => {
      const row = dbRows.find(r => r.id === item.id);
      if (!row) return item;
      const derivedImage = row.video?.includes('cloudinary.com')
        ? row.video.replace(/\.(mp4|webm|ogg|mov)$/, '.jpg')
        : item.image;
      return { ...item, title: row.title, video: row.video, image: derivedImage, image_urls: row.image_urls || [] };
    }));
  };

  useEffect(() => {
    // Initial fetch
    supabase
      .from('heritage_carousel')
      .select('id, title, video, image_urls')
      .then(({ data }) => { if (data) applyOverrides(data); });

    // Realtime subscription
    const channel = supabase
      .channel('heritage_carousel_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'heritage_carousel' },
        (payload) => {
          setItems(prev => prev.map(item => {
            if (item.id !== payload.new.id) return item;
            const derivedImage = payload.new.video?.includes('cloudinary.com')
              ? payload.new.video.replace(/\.(mp4|webm|ogg|mov)$/, '.jpg')
              : item.image;
            return { ...item, title: payload.new.title, video: payload.new.video, image: derivedImage };
          }));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    let timeoutId: number;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setIsMobile(window.innerWidth < 768);
      }, 150);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const next = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % items.length);
  };

  const prev = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const carouselItems = [
    { item: items[(index - 2 + items.length) % items.length], position: 'left2' },
    { item: items[(index - 1 + items.length) % items.length], position: 'left1' },
    { item: items[index], position: 'center' },
    { item: items[(index + 1) % items.length], position: 'right1' },
    { item: items[(index + 2) % items.length], position: 'right2' },
  ];

  const getPositionStyles = React.useCallback((pos: string) => {
    switch (pos) {
      case 'center':
        return {
          opacity: 1,
          scale: 1,
          x: 0,
          zIndex: 50,
          brightness: 1,
          grayscale: 0
        };
      case 'left1':
        return {
          opacity: 0.8,
          scale: 1,
          x: isMobile ? -180 : -400,
          zIndex: 40,
          brightness: 0.8,
          grayscale: 0.05
        };
      case 'right1':
        return {
          opacity: 0.8,
          scale: 1,
          x: isMobile ? 180 : 400,
          zIndex: 40,
          brightness: 0.8,
          grayscale: 0.05
        };
      case 'left2':
        return {
          opacity: 0.5,
          scale: 1,
          x: isMobile ? -300 : -720,
          zIndex: 30,
          brightness: 0.6,
          grayscale: 0.1
        };
      case 'right2':
        return {
          opacity: 0.5,
          scale: 1,
          x: isMobile ? 300 : 720,
          zIndex: 30,
          brightness: 0.6,
          grayscale: 0.1
        };
      default:
        return { opacity: 0, scale: 1, x: 0, zIndex: 10, brightness: 0.5, grayscale: 0.2 };
    }
  }, [isMobile]);

  const getThumbnail = (item: CarouselItem) => {
    if (item.video && item.video.includes('cloudinary.com')) {
      // Cloudinary allows getting a jpg thumbnail by just changing the extension
      return item.video.replace(/\.(mp4|webm|ogg|mov)$/, '.jpg');
    }
    return item.image;
  };

  return (
    <section className="pt-24 pb-8 md:pt-32 md:pb-8 bg-[#F6F1EC] overflow-hidden relative border-t border-black/[0.03]">
      {/* Background Noise Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-10"
        style={{ backgroundImage: `url('https://grainy-gradients.vercel.app/noise.svg')` }} />

      <div className="max-w-7xl mx-auto px-6 mb-20 text-center relative z-20">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 0.6, y: 0 }}
          transition={{ duration: 1.5 }}
          className="text-[11px] uppercase tracking-[0.8em] text-charcoal font-light"
        >
          Signature Archives
        </motion.span>
      </div>

      <div className="relative flex justify-center items-center h-[500px] md:h-[720px] z-20">
        {/* Navigation Arrows */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 md:px-20 z-50 pointer-events-none">
          <button
            onClick={prev}
            className="p-4 md:p-6 text-charcoal/60 md:text-charcoal/40 hover:text-gold transition-all duration-700 pointer-events-auto group"
          >
            <ChevronLeft className="w-8 h-8 md:w-10 md:h-10 stroke-[1px] group-hover:-translate-x-1 transition-transform" />
          </button>
          <button
            onClick={next}
            className="p-4 md:p-6 text-charcoal/60 md:text-charcoal/40 hover:text-gold transition-all duration-700 pointer-events-auto group"
          >
            <ChevronRight className="w-8 h-8 md:w-10 md:h-10 stroke-[1px] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="relative w-full h-full flex items-center justify-center overflow-visible">
          <AnimatePresence initial={false} mode="popLayout">
            {carouselItems.map(({ item, position }) => {
              const isCenter = position === 'center';
              const styles = getPositionStyles(position);

              return (
                <motion.div
                  key={`${item.id}-${position}`}
                  layout
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1}
                  onDragEnd={(_e, { offset, velocity }) => {
                    if (Math.abs(offset.x) < 5 && Math.abs(velocity.x) < 0.3) return;
                    const swipe = Math.abs(offset.x) * velocity.x;
                    if (swipe < -500 || offset.x < -100) {
                      next();
                    } else if (swipe > 500 || offset.x > 100) {
                      prev();
                    }
                  }}
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    filter: 'blur(20px)',
                    x: direction > 0 ? 300 : -300,
                  }}
                  animate={{
                    opacity: styles.opacity,
                    scale: styles.scale,
                    filter: isCenter ? 'blur(0px)' : 'blur(2px)',
                    x: styles.x,
                    zIndex: styles.zIndex,
                  }}
                  whileHover={isCenter ? {
                    rotateX: 1,
                    rotateY: 1,
                    y: -5,
                    transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1] }
                  } : {}}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    filter: 'blur(10px)',
                    x: direction > 0 ? -300 : 300,
                  }}
                  transition={{
                    duration: 1.6,
                    ease: [0.22, 1, 0.36, 1],
                    layout: { duration: 1.6, ease: [0.22, 1, 0.36, 1] }
                  }}
                  className={`absolute w-[280px] h-[370px] md:w-[500px] md:h-[660px] rounded-[24px] md:rounded-[32px] overflow-hidden ${isCenter ? 'shadow-[0_80px_120px_-40px_rgba(0,0,0,0.08)]' : ''}`}
                  style={{
                    filter: `brightness(${styles.brightness}) grayscale(${styles.grayscale})`,
                    willChange: "transform, opacity, filter",
                    transformStyle: "preserve-3d",
                    perspective: "1000px",
                    backfaceVisibility: "hidden",
                    WebkitFontSmoothing: "antialiased"
                  }}
                >
                  {/* Premium Edge Fades (Critical) */}
                  <div className="absolute inset-0 z-20 pointer-events-none">
                    {/* Top Depth Fade */}
                    <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/20 to-transparent opacity-40 md:opacity-50" />
                    {/* Bottom Ground Fade */}
                    <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-black/50 to-transparent opacity-80" />

                    {/* Soft Side Dissolve into Section Background */}
                    <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#F6F1EC]/30 to-transparent blur-2xl" />
                    <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#F6F1EC]/30 to-transparent blur-2xl" />
                  </div>

                  <div className="w-full h-full relative">
                    {(isCenter && item.video) ? (
                      <video
                        src={item.video}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={getThumbnail(item)}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    )}

                    {/* Content Overlay */}
                    {isCenter && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 1.4 }}
                        className="absolute bottom-16 left-0 right-0 px-12 text-center z-30"
                      >
                        <h3 className="font-serif text-white text-xl md:text-2xl tracking-wide mb-8 drop-shadow-md font-light">
                          {item.title}
                        </h3>
                        <Link to={`/product/${item.id}`} onClick={(e) => e.stopPropagation()}>
                          <button onPointerDown={(e) => e.stopPropagation()} className="px-10 py-3 bg-white/5 backdrop-blur-xl border border-white/20 text-white text-[10px] uppercase tracking-[0.5em] rounded-full hover:bg-white hover:text-charcoal transition-all duration-700 font-light translate-y-0 hover:-translate-y-1">
                            View Piece
                          </button>
                        </Link>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
