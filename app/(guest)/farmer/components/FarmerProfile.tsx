"use client"

import { motion } from "framer-motion"
import FarmerHeader from "./FarmerHeader"
import FarmerInfo from "./FarmerInfo"
import ProductDetails from "./ProductDetails"
import Certifications from "./Certifications"
import ProductionLog from "./ProductionLog"
import Footer from "../../landing/Footer"

interface FarmerProfileProps {
  user: any
  product: any
  certifications: any[]
  farmingLogs: any[]
  seasons: any[]
}

export default function FarmerProfile({ user, product, certifications, farmingLogs, seasons }: FarmerProfileProps) {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <FarmerHeader user={user} />

      <div className="container mx-auto px-4 py-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-16 mb-12">
          {/* Farmer Information Section */}
          <motion.div variants={itemVariants}>
            <FarmerInfo user={user} />
          </motion.div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-green-200 to-transparent" />

          {/* Product Details Section */}
          <motion.div variants={itemVariants}>
            <ProductDetails product={product} user={user} />
          </motion.div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-green-200 to-transparent" />

          {/* Certifications Section */}
          <motion.div variants={itemVariants}>
            <Certifications certifications={certifications} />
          </motion.div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-green-200 to-transparent" />

          {/* Production Log Section */}
          <motion.div variants={itemVariants}>
            <ProductionLog farmingLogs={farmingLogs} seasons={seasons} />
          </motion.div>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}

