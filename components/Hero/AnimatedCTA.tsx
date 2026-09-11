"use client";

import CTAButton from "./CTAButton";

interface AnimatedCTAProps {
  delay?: number;
  onClick?: () => void;
  animateOnMount?: boolean;
}

export default function AnimatedCTA({
  delay = 0,
  onClick,
  animateOnMount = true,
}: AnimatedCTAProps) {
  return <CTAButton delay={delay} onClick={onClick} animateOnMount={animateOnMount} />;
}
