"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function HolographicSpinner() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render animations on the server
  if (!mounted) {
    return (
      <div className="flex justify-center items-center h-24 w-24">
        <div className="sr-only">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center p-4">
      <div className="relative h-28 w-28">
        {/* Holographic container */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(4,77,104,0.1) 0%, rgba(4,52,98,0.05) 100%)",
            boxShadow: "0 0 20px rgba(4,217,255,0.2)",
          }}
        />

        {/* Rotating rings */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`ring-${i}`}
            className="absolute border border-cyan-400/30"
            style={{
              width: `${100 - i * 20}%`,
              height: `${100 - i * 20}%`,
              borderRadius: "50%",
              top: `${i * 10}%`,
              left: `${i * 10}%`,
              borderWidth: "1px",
              borderStyle: i % 2 === 0 ? "dashed" : "solid",
              boxShadow: "0 0 10px rgba(4,217,255,0.3)",
            }}
            animate={{
              rotate: i % 2 === 0 ? 360 : -360,
              boxShadow: [
                "0 0 10px rgba(4,217,255,0.3)",
                "0 0 15px rgba(4,217,255,0.5)",
                "0 0 10px rgba(4,217,255,0.3)",
              ],
            }}
            transition={{
              duration: 8 + i * 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}

        {/* Scanning grid */}
        <motion.div
          className="absolute inset-[15%] rounded-full overflow-hidden"
          style={{
            background: "linear-gradient(0deg, rgba(4,77,104,0.1) 0%, rgba(4,217,255,0.2) 100%)",
            boxShadow: "inset 0 0 10px rgba(4,217,255,0.3)",
          }}
        >
          {/* Grid lines */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(0deg, transparent 24%, rgba(4,217,255,0.3) 25%, rgba(4,217,255,0.3) 26%, transparent 27%, transparent 74%, rgba(4,217,255,0.3) 75%, rgba(4,217,255,0.3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(4,217,255,0.3) 25%, rgba(4,217,255,0.3) 26%, transparent 27%, transparent 74%, rgba(4,217,255,0.3) 75%, rgba(4,217,255,0.3) 76%, transparent 77%, transparent)",
              backgroundSize: "30px 30px",
            }}
          />

          {/* Scanning effect */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(4,217,255,0) 0%, rgba(4,217,255,0.5) 50%, rgba(4,217,255,0) 100%)",
              height: "200%",
            }}
            animate={{ y: ["-100%", "0%"] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
        </motion.div>

        {/* Data processing particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute h-1 w-1 bg-cyan-400 rounded-full"
            style={{
              top: "50%",
              left: "50%",
              transformOrigin: "center center",
              transform: `rotate(${i * 30}deg)`,
              boxShadow: "0 0 5px rgba(4,217,255,0.8)",
            }}
            animate={{
              x: [0, (20 + (i % 3) * 5) * Math.cos((i * 30 * Math.PI) / 180)],
              y: [0, (20 + (i % 3) * 5) * Math.sin((i * 30 * Math.PI) / 180)],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.1,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Center core */}
        <motion.div
          className="absolute rounded-full bg-cyan-400"
          style={{
            top: "50%",
            left: "50%",
            marginLeft: "-5px",
            marginTop: "-5px",
            width: "10px",
            height: "10px",
            boxShadow: "0 0 15px rgba(4,217,255,1)",
          }}
          animate={{
            scale: [1, 1.5, 1],
            boxShadow: ["0 0 15px rgba(4,217,255,1)", "0 0 25px rgba(4,217,255,1)", "0 0 15px rgba(4,217,255,1)"],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {/* Digital readout */}
        <motion.div
          className="absolute -bottom-6 left-0 right-0 text-center text-[8px] font-mono text-cyan-400"
          animate={{
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          PROCESSING...
        </motion.div>
      </div>

      {/* Screen reader text */}
      <span className="sr-only">Loading...</span>
    </div>
  )
}

