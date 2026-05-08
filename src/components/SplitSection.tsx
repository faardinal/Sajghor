import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { useBoutique } from '../context/BoutiqueContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function SplitSection() {
  const [leftImage, setLeftImage] = useState(
    'https://res.cloudinary.com/dz1a7jsy9/image/upload/v1777966831/b92ff5d2013e43589349109e09f7955f-upscaled-2x_duvbsi.png'
  );
  const [rightImage, setRightImage] = useState(
    'https://res.cloudinary.com/dz1a7jsy9/image/upload/v1777966832/989ad10afb992cfcad82d4ae6477a11b-upscaled-2x_qei8ju.png'
  );
  const [leftLabel, setLeftLabel] = useState('The Atelier');
  const [leftButton, setLeftButton] = useState('Shop now');
  const [rightLabel, setRightLabel] = useState('Curated Soul');
  const [rightButton, setRightButton] = useState('Shop now');
  const [centerTitle, setCenterTitle] = useState('SAJGHOR');
  const [centerSubtitle, setCenterSubtitle] = useState('Spring Summer Ateliers');

  useEffect(() => {
    // Initial fetch
    supabase
      .from('split_section_config')
      .select('id, side, image_url, label, button_text, center_title, center_subtitle')
      .then(({ data }) => {
        if (!data) return;
        data.forEach(row => {
          if (row.side === 'left') {
            setLeftImage(row.image_url);
            setLeftLabel(row.label);
            setLeftButton(row.button_text);
            if (row.center_title) setCenterTitle(row.center_title);
            if (row.center_subtitle) setCenterSubtitle(row.center_subtitle);
          }
          if (row.side === 'right') {
            setRightImage(row.image_url);
            setRightLabel(row.label);
            setRightButton(row.button_text);
          }
        });
      });

    // Realtime subscription
    const channel = supabase
      .channel('split_section_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'split_section_config' },
        (payload) => {
          if (payload.new.side === 'left') {
            setLeftImage(payload.new.image_url);
            setLeftLabel(payload.new.label);
            setLeftButton(payload.new.button_text);
            if (payload.new.center_title) setCenterTitle(payload.new.center_title);
            if (payload.new.center_subtitle) setCenterSubtitle(payload.new.center_subtitle);
          }
          if (payload.new.side === 'right') {
            setRightImage(payload.new.image_url);
            setRightLabel(payload.new.label);
            setRightButton(payload.new.button_text);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const sectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isInView = useInView(sectionRef, { 
    amount: 0.5,
    margin: "0px 0px -100px 0px"
  });
  
  const [hoverSide, setHoverSide] = useState<'left' | 'right' | null>(null);
  const { isSplitSectionVisible, setIsSplitSectionVisible } = (useBoutique() as any);

  useEffect(() => {
    if (setIsSplitSectionVisible) {
      setIsSplitSectionVisible(isInView);
    }
    return () => {
      if (setIsSplitSectionVisible) {
        setIsSplitSectionVisible(false);
      }
    };
  }, [isInView, setIsSplitSectionVisible]);

  return (
    <section 
      ref={sectionRef}
      className="relative h-screen min-h-[600px] w-full overflow-hidden flex flex-col md:flex-row bg-[#111]"
      id="split-experience"
    >
      {/* Brand Name Center (Luxury Spacing) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: isInView ? 1 : 0, 
        }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center p-4"
      >
        <div className="text-center">
           <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.3 }}
            className="text-ivory font-serif uppercase font-normal text-[28px] drop-shadow-[0_5px_15px_rgba(0,0,0,0.4)]"
            style={{ letterSpacing: '6px' }}
           >
            {centerTitle}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="text-ivory text-[10px] uppercase font-light mt-2"
            style={{ letterSpacing: '3px' }}
          >
            {centerSubtitle}
          </motion.p>
        </div>
      </motion.div>

      {/* LEFT SIDE: Category 1 (Autumn Collection) */}
      <div 
        className="relative flex-1 group transition-all duration-700 ease-out cursor-pointer overflow-hidden border-b md:border-b-0 md:border-r border-ivory/5 perspective-1000"
        onMouseEnter={() => setHoverSide('left')}
        onMouseLeave={() => setHoverSide(null)}
        onClick={() => navigate('/collection/autumn-collection')}
      >
        <motion.img
          src={leftImage}
          alt="Atelier Fashion"
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover object-center`}
          initial={{ opacity: 0, filter: 'blur(10px)', scale: 1.05 }}
          whileInView={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ 
            rotateX: 1, 
            rotateY: 2, 
            x: 5,
            transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1] }
          }}
          style={{ 
            willChange: "transform, filter",
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden'
          }}
        />
        
        {/* Soft Dark Overlay */}
        <div 
          className={`absolute inset-0 transition-opacity duration-[1.5s] bg-black/40 ${
            hoverSide === 'right' ? 'opacity-60' : 'opacity-25'
          }`}
          style={{ willChange: "opacity" }}
        />

        <div className="absolute bottom-12 left-12 z-20">
          <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="flex flex-col items-start"
          >
            <span className="text-ivory text-[10px] uppercase tracking-[4px] font-light mb-4">{leftLabel}</span>
            <button className="text-gold text-[9px] uppercase tracking-[3px] border-b border-gold/30 pb-1 hover:border-gold transition-colors">
              {leftButton}
            </button>
          </motion.div>
        </div>
      </div>

      {/* RIGHT SIDE: Category 2 (Spring Collection) */}
      <div 
        className="relative flex-1 group transition-all duration-700 ease-out cursor-pointer overflow-hidden perspective-1000"
        onMouseEnter={() => setHoverSide('right')}
        onMouseLeave={() => setHoverSide(null)}
        onClick={() => navigate('/collection/spring-collection')}
      >
        <motion.img
          src={rightImage}
          alt="Curated Collection"
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover object-center`}
          initial={{ opacity: 0, filter: 'blur(10px)', scale: 1.05 }}
          whileInView={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ 
            rotateX: 1, 
            rotateY: -2, 
            x: -5,
            transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1] }
          }}
          style={{ 
            willChange: "transform, filter",
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden'
          }}
        />
        
        {/* Soft Dark Overlay */}
        <div 
          className={`absolute inset-0 transition-opacity duration-[1.5s] bg-black/40 ${
            hoverSide === 'left' ? 'opacity-60' : 'opacity-25'
          }`}
          style={{ willChange: "opacity" }}
        />

        <div className="absolute bottom-12 right-12 z-20 text-right">
          <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="flex flex-col items-end"
          >
            <span className="text-ivory text-[10px] uppercase tracking-[4px] font-light mb-4">{rightLabel}</span>
            <button className="text-gold text-[9px] uppercase tracking-[3px] border-b border-gold/30 pb-1 hover:border-gold transition-colors">
              {rightButton}
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
