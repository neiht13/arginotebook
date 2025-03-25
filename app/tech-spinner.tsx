"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function TechSpinner() {
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
      <div className="relative h-24 w-24">
        {/* Hexagonal frame */}
        <motion.div
          className="absolute inset-0"
          style={{
            clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
            background: "linear-gradient(45deg, rgba(0,212,255,0.2) 0%, rgba(9,9,121,0.2) 100%)",
            boxShadow: "0 0 15px rgba(0,212,255,0.5)",
          }}
          animate={{
            boxShadow: ["0 0 15px rgba(0,212,255,0.5)", "0 0 25px rgba(0,212,255,0.8)", "0 0 15px rgba(0,212,255,0.5)"],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {/* Inner hexagon */}
        <motion.div
          className="absolute"
          style={{
            top: "15%",
            left: "15%",
            right: "15%",
            bottom: "15%",
            clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
            border: "1px solid rgba(0,212,255,0.8)",
            background: "rgba(9,9,121,0.1)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />

        {/* Scanning line */}
        <motion.div
          className="absolute left-0 right-0 h-0.5 bg-cyan-400"
          style={{
            boxShadow: "0 0 8px 2px rgba(0,212,255,0.8)",
            top: "50%",
          }}
          animate={{
            top: ["0%", "100%", "0%"],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {/* Digital circuit lines */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-cyan-400"
            style={{
              height: "1px",
              width: "30%",
              left: "35%",
              top: `${10 + i * 16}%`,
              boxShadow: "0 0 5px rgba(0,212,255,0.8)",
            }}
            animate={{
              width: ["0%", "30%", "0%"],
              left: ["35%", "35%", "35%"],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Data points */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`point-${i}`}
            className="absolute h-1.5 w-1.5 rounded-full bg-cyan-400"
            style={{
              top: "50%",
              left: "50%",
              marginLeft: "-2px",
              marginTop: "-2px",
              transformOrigin: "center center",
              transform: `rotate(${i * 45}deg) translateY(-30px)`,
              boxShadow: "0 0 5px rgba(0,212,255,0.8)",
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.6, 1, 0.6],
              boxShadow: ["0 0 5px rgba(0,212,255,0.8)", "0 0 10px rgba(0,212,255,1)", "0 0 5px rgba(0,212,255,0.8)"],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.25,
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
            marginLeft: "-6px",
            marginTop: "-6px",
            width: "12px",
            height: "12px",
            boxShadow: "0 0 10px rgba(0,212,255,1)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            boxShadow: ["0 0 10px rgba(0,212,255,1)", "0 0 20px rgba(0,212,255,1)", "0 0 10px rgba(0,212,255,1)"],
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {/* Binary data effect */}
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={`binary-${i}`}
              className="absolute text-[8px] font-mono text-cyan-400"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 0],
                y: [0, 10],
              }}
              transition={{
                duration: 1 + Math.random(),
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 2,
                ease: "linear",
              }}
            >
              {Math.random() > 0.5 ? "1" : "0"}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Screen reader text */}
      <span className="sr-only">Loading...</span>
    </div>
  )
}

