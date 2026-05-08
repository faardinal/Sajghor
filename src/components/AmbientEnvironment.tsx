import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { useEffect, useState, memo } from 'react';

const AmbientEnvironment = memo(function AmbientEnvironment() {
  const { scrollYProgress } = useScroll();
  
  // 1. Scroll Atmosphere System (Ambient Light Shift)
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ['#F9FBFE', '#FDFBF7', '#FEF9F5']
  );

  const smoothBg = useSpring(backgroundColor, {
    stiffness: 50,
    damping: 30,
    restDelta: 0.001
  });

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    let frameId: number;
    const handleMouseMove = (e: MouseEvent) => {
      // Use RAF to throttle mouse updates for cursor tracking
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        setMousePos({ x: e.clientX, y: e.clientY });
        
        const target = e.target as HTMLElement;
        const isInteractive = target.closest('button, a, input, [role="button"]');
        setIsHovering(!!isInteractive);
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  const cursorX = useSpring(mousePos.x, { stiffness: 250, damping: 30 });
  const cursorY = useSpring(mousePos.y, { stiffness: 250, damping: 30 });

  return (
    <>
      <motion.div 
        className="fixed inset-0 -z-30 pointer-events-none"
        style={{ 
          backgroundColor: smoothBg,
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
      />

      <div 
        className="fixed inset-0 -z-20 pointer-events-none opacity-[0.015]"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          transform: 'translateZ(0)'
        }}
      />
      
      <motion.div 
        className="fixed inset-[-100%] -z-10 pointer-events-none opacity-[0.008]"
        animate={{ 
          x: ['-2%', '2%', '-2%'],
          y: ['-2%', '2%', '-2%'],
        }}
        transition={{ 
          duration: 60, 
          ease: "linear", 
          repeat: Infinity 
        }}
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          transform: 'translateZ(0)',
          willChange: 'transform'
        }}
      />

      <div className="hidden lg:block">
        <motion.div
          className="fixed top-0 left-0 w-8 h-8 rounded-full border border-gold/20 pointer-events-none z-[9999] mix-blend-multiply"
          style={{
            x: cursorX,
            y: cursorY,
            translateX: '-50%',
            translateY: '-50%',
            scale: isHovering ? 1.4 : 1,
            opacity: isHovering ? 0.4 : 0.15,
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden'
          }}
        />
        <motion.div
          className="fixed top-0 left-0 w-1 h-1 bg-gold rounded-full pointer-events-none z-[9999]"
          style={{
            x: cursorX,
            y: cursorY,
            translateX: '-50%',
            translateY: '-50%',
            transform: 'translateZ(0)'
          }}
        />
      </div>
    </>
  );
});

export default AmbientEnvironment;
