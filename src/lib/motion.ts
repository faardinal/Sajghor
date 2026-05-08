import { Transition, Variants } from 'motion/react';

export const luxuryTransition: Transition = {
  duration: 1.5,
  ease: [0.22, 1, 0.36, 1],
};

export const narrativeTransition: Transition = {
  duration: 2.5,
  ease: [0.22, 1, 0.36, 1],
};

export const softTransition: Transition = {
  duration: 1.2,
  ease: [0.25, 0.1, 0.25, 1],
};

export const breathingVariants: Variants = {
  hidden: { opacity: 0, y: 5 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: luxuryTransition
  }
};

export const staggeredContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
      ...luxuryTransition
    }
  }
};

export const slowFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 1.5, ease: "easeInOut" } as Transition
};
