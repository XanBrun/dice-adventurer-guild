
import React from 'react';
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CriticalEffectsProps {
  isCritical?: boolean;
  isFail?: boolean;
  className?: string;
}

const CriticalEffects: React.FC<CriticalEffectsProps> = ({
  isCritical = false,
  isFail = false,
  className
}) => {
  if (!isCritical && !isFail) return null;
  
  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden rounded-lg", className)}>
      {isCritical && (
        <>
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-yellow-300/40 to-amber-500/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.7, 0] }}
            transition={{ duration: 2, times: [0, 0.2, 1], repeat: Infinity, repeatDelay: 1 }}
          />
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [0.8, 1.2, 1],
              opacity: [0, 1, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 1.5, times: [0, 0.5, 1], repeat: Infinity }}
          >
            <span className="text-yellow-500 font-medieval text-5xl font-extrabold">
              ¡CRÍTICO!
            </span>
          </motion.div>
          <div className="absolute inset-0">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-yellow-400"
                initial={{ 
                  x: Math.random() * 100 - 50 + "%", 
                  y: "-10%", 
                  opacity: 0.7 
                }}
                animate={{ 
                  y: "110%",
                  opacity: [0.7, 0]
                }}
                transition={{ 
                  duration: 1 + Math.random() * 2,
                  delay: Math.random() * 2,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 3
                }}
              />
            ))}
          </div>
        </>
      )}

      {isFail && (
        <>
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-red-800/40 to-red-500/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.7, 0] }}
            transition={{ duration: 2, times: [0, 0.2, 1], repeat: Infinity, repeatDelay: 1 }}
          />
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [0.8, 1.2, 1],
              opacity: [0, 1, 0],
              rotate: [0, -2, 2, 0]
            }}
            transition={{ duration: 1.5, times: [0, 0.5, 1], repeat: Infinity }}
          >
            <span className="text-red-600 font-medieval text-5xl font-extrabold">
              ¡PIFIA!
            </span>
          </motion.div>
          <motion.div
            className="absolute inset-0 border-8 border-red-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            transition={{ duration: 2, times: [0, 0.2, 1], repeat: Infinity }}
          />
        </>
      )}
    </div>
  );
};

export default CriticalEffects;
