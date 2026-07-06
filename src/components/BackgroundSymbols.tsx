import { motion } from 'motion/react';

const symbols = ['◈', '◇', '⌬', '⌘', '⌥', '⎈', '✧', '✦', '✥', '♒', '⚙', '⚖'];

export default function BackgroundSymbols() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      {[...Array(25)].map((_, i) => {
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        const startX = Math.random() * 100;
        const startY = Math.random() * 110;
        const driftX = (Math.random() - 0.5) * 20;
        const duration = 25 + Math.random() * 40;

        return (
          <motion.div
            key={i}
            className="absolute text-white font-serif select-none"
            initial={{ 
              x: `${startX}vw`, 
              y: `${startY}vh`, 
              opacity: 0,
              rotate: 0,
              scale: 0.3 + Math.random() * 0.7
            }}
            animate={{ 
              y: [`${startY}vh`, `${startY - 120}vh`],
              x: [`${startX}vw`, `${startX + driftX}vw`],
              opacity: [0, 0.3, 0.3, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              ease: "linear",
              delay: i * -2,
            }}
            style={{
              fontSize: `${10 + Math.random() * 20}px`,
              filter: 'blur(1px)',
            }}
          >
            {symbol}
          </motion.div>
        );
      })}
    </div>
  );
}
