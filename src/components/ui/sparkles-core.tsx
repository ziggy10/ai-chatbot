import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";

interface SparklesCoreProps {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  particleColor?: string;
  speed?: number;
  particleSize?: number;
}

export const SparklesCore = ({
  id = "tsparticles",
  className = "",
  background = "transparent",
  minSize = 0.4,
  maxSize = 1.0,
  particleDensity = 120,
  particleColor = "hsl(var(--primary))",
  speed = 0.4,
  particleSize = 1.0,
}: SparklesCoreProps) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    opacity: number;
    velocity: { x: number; y: number };
  }>>([]);

  const generateParticles = useCallback(() => {
    const newParticles = [];
    for (let i = 0; i < particleDensity; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * (maxSize - minSize) + minSize,
        opacity: Math.random() * 0.8 + 0.2,
        velocity: {
          x: (Math.random() - 0.5) * speed,
          y: (Math.random() - 0.5) * speed,
        },
      });
    }
    setParticles(newParticles);
  }, [particleDensity, maxSize, minSize, speed]);

  useEffect(() => {
    generateParticles();
  }, [generateParticles]);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prevParticles) =>
        prevParticles.map((particle) => ({
          ...particle,
          x: (particle.x + particle.velocity.x + 100) % 100,
          y: (particle.y + particle.velocity.y + 100) % 100,
          opacity: Math.sin(Date.now() * 0.001 + particle.id) * 0.3 + 0.7,
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={className} style={{ background }}>
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="sparkle-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={particleColor} stopOpacity="1" />
            <stop offset="100%" stopColor={particleColor} stopOpacity="0" />
          </radialGradient>
        </defs>
        {particles.map((particle) => (
          <motion.circle
            key={particle.id}
            cx={`${particle.x}%`}
            cy={`${particle.y}%`}
            r={particle.size * particleSize}
            fill="url(#sparkle-gradient)"
            opacity={particle.opacity}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
    </div>
  );
};