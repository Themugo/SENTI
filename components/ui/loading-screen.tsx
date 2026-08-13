'use client';

import { motion } from 'framer-motion';

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent"
        >
          <span className="text-2xl font-bold font-display text-primary-foreground">S</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-1.5"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
              className="h-2 w-2 rounded-full bg-primary"
            />
          ))}
        </motion.div>
        <p className="text-sm text-muted-foreground">Loading SENTI...</p>
      </div>
    </div>
  );
}
