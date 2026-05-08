import { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence, Transition } from 'motion/react';
import { ShoppingBag, Search, User } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useBoutique } from '../context/BoutiqueContext';

const Navbar = memo(function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isSplitSectionVisible, isClosingVisible } = useBoutique();
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 50;
          setScrolled(isScrolled);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Spring Weaves', path: '/collection/spring-weaves' },
    { name: 'Autumn Harvest', path: '/collection/autumn-collection' },
    { name: 'Limited Edition', path: '/collection/limited-edition' },
    { name: 'All Collections', path: '/collections' },
    { name: 'Cabinet of Curiosities', path: '/cart' },
    { name: 'Atelier Admin', path: '/admin' },
  ];

  const isHomePage = location.pathname === '/';
  const shouldHideLogo = (isSplitSectionVisible || isClosingVisible) && isHomePage;
  const isDarkText = scrolled || !isHomePage;

  const textColor = isDarkText ? "text-charcoal/80" : "text-ivory";
  const logoColor = isDarkText ? "text-charcoal" : "text-ivory";
  const iconColor = isDarkText ? "text-charcoal/70" : "text-ivory";

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Micro-Announcement Bar */}
      <motion.div 
        animate={{ 
          height: (scrolled || shouldHideLogo) ? 0 : 24,
          opacity: (scrolled || shouldHideLogo) ? 0 : 1,
          backgroundColor: (scrolled || shouldHideLogo) ? "rgba(38, 38, 38, 0)" : "#262626"
        }}
        className="relative overflow-hidden flex items-center justify-center bg-charcoal"
      >
        <span className="text-[7px] md:text-[9px] uppercase tracking-[0.3em] md:tracking-[0.6em] text-ivory font-light whitespace-nowrap">
          Handcrafted Heritage. Modern Soul.
        </span>
      </motion.div>

      <motion.nav 
        initial={{ y: -5, opacity: 0 }}
        animate={{ 
          y: 0, 
          opacity: 1,
          backgroundColor: (scrolled && !shouldHideLogo) 
            ? "rgba(255, 255, 255, 0.65)" 
            : "rgba(255, 255, 255, 0)",
          height: (scrolled || shouldHideLogo) ? "72px" : "86px"
        }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{
          backdropFilter: (scrolled && !shouldHideLogo) 
            ? "blur(16px)" 
            : "blur(0px)",
          borderBottomColor: (scrolled && !shouldHideLogo) 
            ? "rgba(0, 0, 0, 0.04)" 
            : "rgba(0, 0, 0, 0)",
          willChange: "transform, opacity, backdrop-filter, background-color"
        }}
        className={`relative transition-all duration-700 ${shouldHideLogo ? 'border-b-transparent' : 'border-b-[0.5px]'} ${(scrolled && !shouldHideLogo) ? 'shadow-[0_4px_30px_rgba(0,0,0,0.02)]' : ''}`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-full flex items-center justify-between relative">
          {/* Left Side: MENU TRIGGER */}
          <div 
            className="flex items-center gap-2 md:gap-4 group cursor-pointer h-full"
            onClick={() => setIsMenuOpen(!isMenuOpen)} // Toggle for mobile
            onMouseEnter={() => setIsMenuHovered(true)}
            onMouseLeave={() => {
              // Small delay to prevent flicker
              setTimeout(() => setIsMenuHovered(false), 120);
            }}
          >
            <motion.div 
              animate={{ opacity: shouldHideLogo ? 0 : 1 }}
              className="flex flex-col gap-1.5 w-5"
            >
              <motion.div 
                animate={{ 
                  width: '100%',
                  backgroundColor: isMenuHovered ? "#C5A059" : (isDarkText ? "#1c1c1c" : "#FBFAF7")
                }}
                className="h-[0.5px] transition-colors duration-700"
              />
              <motion.div 
                animate={{ 
                  width: isMenuHovered || isMenuOpen ? '100%' : '60%',
                  backgroundColor: isMenuHovered ? "#C5A059" : (isDarkText ? "#1c1c1c" : "#FBFAF7")
                }}
                className="h-[0.5px] transition-colors duration-700"
              />
            </motion.div>
            <motion.span 
              animate={{ opacity: shouldHideLogo ? 0 : 1 }}
              className={`text-[10px] uppercase tracking-[0.1em] md:tracking-[0.35em] font-light transition-all duration-700 ${isMenuHovered ? 'text-gold' : textColor}`}
            >
              Menu
            </motion.span>

            {/* HOVER DROPDOWN */}
            <AnimatePresence>
              {(isMenuHovered || isMenuOpen) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute top-[calc(100%+12px)] left-0 w-80 bg-white/80 backdrop-blur-3xl border border-black/[0.03] rounded-xl p-10 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] z-50 pointer-events-auto"
                  onMouseEnter={() => setIsMenuHovered(true)}
                  onMouseLeave={() => {
                    // Small delay to allow crossing the gap between nav and dropdown
                    setTimeout(() => setIsMenuHovered(false), 150);
                  }}
                >
                  <div className="flex flex-col">
                    {menuItems.map((item, idx) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 + idx * 0.03, duration: 0.5 }}
                      >
                        <Link 
                          to={item.path} 
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsMenuHovered(false);
                            setIsMenuOpen(false);
                          }}
                          className="font-sans text-[11px] uppercase tracking-[0.2em] font-light py-3.5 text-charcoal/70 flex items-center transition-all duration-500 hover:text-charcoal group relative"
                        >
                          <span className="relative">
                            {item.name}
                            <span className="absolute -bottom-1 left-0 w-0 h-[0.5px] bg-gold/40 transition-all duration-700 ease-out group-hover:w-full" />
                          </span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-10 pt-8 border-t border-black/[0.02]"
                  >
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gold/60 font-light leading-relaxed">
                      L’Atelier Sajghor<br/>
                      <span className="opacity-30 text-[8px] tracking-[0.15em] lowercase italic">est. MCMXCI</span>
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Center: Logo */}
          <Link 
            to="/" 
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center group cursor-pointer"
          >
            <motion.div 
              animate={{ 
                opacity: shouldHideLogo ? 0 : 1,
                y: shouldHideLogo ? -20 : 0,
                scale: shouldHideLogo ? 0.8 : 1
              }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex flex-col items-center"
            >
              <h1 className={`text-lg md:text-3xl tracking-[0.3em] md:tracking-[0.45em] font-serif uppercase font-light transition-all duration-1000 flex ${logoColor}`}>
                SAJGHO<span className="relative">R</span>
              </h1>
              <motion.div 
                animate={{ 
                  backgroundColor: isDarkText ? "#C5A059" : "#FBFAF7",
                  scale: isMenuHovered ? 1.2 : 1
                }}
                className="absolute left-[72.5%] top-[-3px] w-1 h-1 rounded-full opacity-60 transition-all duration-1000"
              ></motion.div>
            </motion.div>
          </Link>

          {/* Right Side: Icons */}
          <motion.div 
            animate={{ 
              opacity: shouldHideLogo ? 0 : 1,
              y: shouldHideLogo ? -10 : 0
            }}
            className="flex items-center gap-5 md:gap-10 transition-colors duration-700"
          >
            <button className={`hover:text-gold transition-all duration-500 hover:-translate-y-0.5 ${iconColor}`}>
              <Search className="w-[16px] h-[16px] stroke-[1px]" />
            </button>
            <button onClick={() => navigate('/account')} className={`hidden md:block hover:text-gold transition-all duration-500 hover:-translate-y-0.5 ${iconColor}`}>
              <User className="w-[16px] h-[16px] stroke-[1px]" />
            </button>
            <button onClick={() => navigate('/cart')} className={`hover:text-gold transition-all duration-500 hover:-translate-y-0.5 flex items-center gap-2.5 ${iconColor}`}>
              <div className="relative">
                <ShoppingBag className="w-[16px] h-[16px] stroke-[1px]" />
                {totalItems > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-gold text-[7px] text-white flex items-center justify-center rounded-full font-bold"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </div>
            </button>
          </motion.div>
        </div>
      </motion.nav>

    </header>
  );
});

export default Navbar;
