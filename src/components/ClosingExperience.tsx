import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView } from 'motion/react';
import { useBoutique } from '../context/BoutiqueContext';

export default function ClosingExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { amount: 0.4, once: false });
  const { setIsClosingVisible } = useBoutique();

  useEffect(() => {
    setIsClosingVisible(isInView);
    return () => setIsClosingVisible(false);
  }, [isInView, setIsClosingVisible]);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  // Parallax transforms
  const y1 = useTransform(scrollYProgress, [0, 1], [150, 0]);
  const y2 = useTransform(scrollYProgress, [0, 1], [80, 0]);
  const opacity = useTransform(scrollYProgress, [0.6, 1], [0, 1]);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[60vh] md:min-h-[80vh] bg-ivory overflow-hidden flex flex-col items-center justify-center py-24 md:py-32"
      id="closing-experience"
    >
      {/* 2. Floating Texture (Stateless version for performance) */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.02] z-0"
        style={{ 
          backgroundImage: `url('https://grainy-gradients.vercel.app/noise.svg')`,
          transform: 'translateZ(0)'
        }}
      />

      {/* 6. Soft Spotlight / Vignette Fade-out */}
      <motion.div 
        style={{ opacity, transform: 'translateZ(0)' }}
        className="absolute inset-0 bg-radial-[circle_at_center,_var(--tw-gradient-stops)] from-transparent via-transparent to-black/5 pointer-events-none z-10"
      />

      {/* 4. Line Drawing Reveal */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-px overflow-hidden">
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: isInView ? "100%" : 0 }}
          transition={{ duration: 4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full bg-charcoal/10"
          style={{ transform: 'translateZ(0)' }}
        />
      </div>

      {/* Main Content Area */}
      <div className="relative z-20 flex flex-col items-center text-center max-w-4xl px-6">
        
        {/* 1. Fade-in Heritage Signature */}
        <motion.div 
          style={{ y: y1, transform: 'translateZ(0)' }}
          className="flex flex-col items-center"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: isInView ? 1 : 0
            }}
            transition={{ duration: 3, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
          >
            <h2 className="text-charcoal font-serif text-3xl md:text-5xl tracking-[0.4em] uppercase font-light mb-6">
              SAJGHOR
            </h2>
          </motion.div>

          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: isInView ? 40 : 0, opacity: isInView ? 0.3 : 0 }}
            transition={{ duration: 2, delay: 1.5 }}
            className="h-px bg-charcoal mb-8"
          />

          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: isInView ? 0.6 : 0 }}
            transition={{ duration: 2, delay: 2 }}
            className="text-[9px] uppercase tracking-[0.4em] text-charcoal/60 font-light"
          >
            Crafted with quiet elegance
          </motion.span>
        </motion.div>
      </div>

      {/* Final Cinematic Scene end */}
    </section>
  );
}
