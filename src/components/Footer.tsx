import { Instagram, Facebook, Twitter } from 'lucide-react';
import { motion } from 'motion/react';
import { breathingVariants } from '../lib/motion';

export default function Footer() {
  return (
    <motion.footer 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={breathingVariants}
      className="h-32 border-t border-gold/10 mx-6 md:mx-24 flex items-center justify-between relative bg-ivory"
    >
      <div className="flex gap-10 text-[9px] uppercase tracking-[0.4em] text-olive font-light">
        <span className="cursor-pointer hover:text-gold transition-colors duration-700">Stockists</span>
        <span className="cursor-pointer hover:text-gold transition-colors duration-700">Sustainability</span>
        <span className="cursor-pointer hover:text-gold transition-colors duration-700">Care</span>
      </div>
      
      <div className="absolute left-1/2 -translate-x-1/2 opacity-[0.08] hidden md:block">
        <svg width="120" height="40" viewBox="0 0 120 40" fill="none" stroke="#5A5A40">
          <path d="M10 30C20 10 40 10 50 30S80 30 90 10" strokeWidth="0.5"/>
          <path d="M20 35C30 20 40 20 50 35" strokeWidth="0.5"/>
          <circle cx="50" cy="20" r="2" strokeWidth="0.5"/>
        </svg>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="text-[8px] uppercase tracking-[0.5em] opacity-40 font-light text-charcoal">
          &copy; 2024 SAJGHOR ATELIER
        </div>
        <div className="flex gap-4 text-olive/40">
          <Instagram className="w-3 h-3 cursor-pointer hover:text-gold transition-all duration-700" />
          <Facebook className="w-3 h-3 cursor-pointer hover:text-gold transition-all duration-700" />
        </div>
      </div>
    </motion.footer>
  );
}
