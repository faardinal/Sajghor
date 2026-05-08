import React, { useRef } from 'react';
import { motion, useScroll, useTransform, Transition } from 'motion/react';
import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';
import SplitSection from '../components/SplitSection';
import HeritageCarousel from '../components/HeritageCarousel';
import ClosingExperience from '../components/ClosingExperience';
import { luxuryTransition, breathingVariants } from '../lib/motion';

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={luxuryTransition}
    >
      <Hero />
      
      <SplitSection />
      
      <HeritageCarousel />

      <ProductGrid collectionId="autumn-collection" />

      <ClosingExperience />
    </motion.div>
  );
}
