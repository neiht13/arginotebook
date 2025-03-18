"use client"
import { motion } from "framer-motion"
import Spinner from "@/components/ui/spinner"

const LoadingScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Spinner />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-4 text-slate-600 font-medium"
      >
        Đang tải dữ liệu...
      </motion.p>
    </div>
  )
}

export default LoadingScreen

