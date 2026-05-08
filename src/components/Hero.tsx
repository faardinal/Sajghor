import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, Transition } from 'motion/react';
import { Link } from 'react-router-dom';
import { luxuryTransition } from '../lib/motion';
import { supabase } from '../lib/supabaseClient';

export default function Hero() {
  const [heroImage, setHeroImage] = useState(
    'https://res.cloudinary.com/dz1a7jsy9/image/upload/v1777906705/......_jshxbs.png'
  );

  useEffect(() => {
    // Initial fetch
    supabase
      .from('hero_config')
      .select('image_url')
      .eq('id', 1)
      .single()
      .then(({ data }) => { if (data) setHeroImage(data.image_url); });

    // Realtime subscription
    const channel = supabase
      .channel('hero_config_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'hero_config' },
        (payload) => {
          if (payload.new?.image_url) setHeroImage(payload.new.image_url);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Even smoother spring for ultra-luxury feel
  const springConfig = { stiffness: 20, damping: 30, restDelta: 0.001 };

  const rawScale = useTransform(scrollYProgress, [0, 1], [1, 1.02]);
  const scale = useSpring(rawScale, springConfig);

  const rawY = useTransform(scrollYProgress, [0, 1], ["0%", "1%"]);
  const y = useSpring(rawY, springConfig);

  const rawTextY = useTransform(scrollYProgress, [0, 1], [0, 15]);
  const textY = useSpring(rawTextY, springConfig);

  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={containerRef} className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background Image - Optimized Parallax with smoothing */}
      <motion.div 
        initial={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ y, willChange: 'transform, filter' }}
        className="absolute inset-0 z-0 bg-charcoal"
      >
        <img 
          src={heroImage}
          alt="Sajghor Heritage"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none select-none brightness-[0.95]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-charcoal/5 to-charcoal/10" />
      </motion.div>

      {/* Content Overlay - Centered and slightly raised */}
      <motion.div 
        style={{ y: textY, opacity: textOpacity }}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.4,
              delayChildren: 1.2
            }
          }
        }}
        className="relative z-10 text-center px-6 -mt-20 md:-mt-32"
      >
        <div className="flex flex-col items-center">
          {/* Luxury Button */}
          <Link to="/collections">
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 15, filter: 'blur(8px)' },
                visible: { 
                  opacity: 1, 
                  y: 0, 
                  filter: 'blur(0px)',
                  transition: { ...luxuryTransition } as Transition 
                }
              }}
              className="btn-boutique !text-ivory border-ivory/20 hover:border-gold hover:text-white group relative"
            >
              <span className="relative z-10">Enter the Boutique</span>
              <div className="absolute inset-0 bg-gold/10 -translate-y-full group-hover:translate-y-0 transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]" />
            </motion.div>
          </Link>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1.5 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
      >
        <motion.div
           animate={{ y: [0, 8, 0] }}
           transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
           className="text-ivory/40 flex flex-col items-center gap-4"
        >
          <span className="text-[9px] uppercase tracking-[0.4em] rotate-90 origin-left translate-x-2 font-light">Explore</span>
          <div className="w-px h-12 bg-gradient-to-b from-ivory/30 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
}
