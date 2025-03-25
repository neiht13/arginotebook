import { notFound } from "next/navigation"
import { connectToDatabase } from "@/lib/mongodb"
import FarmerProfile from "../components/FarmerProfile"
import { ObjectId } from "mongodb"

export default async function FarmerProfilePage({ params }: { params: { id: string } }) {
  const { id } = params

  if (!id) {
    notFound()
  }

  try {
    // Connect to database
    const { db } = await connectToDatabase()

    // Fetch user data
    let user

    // Check if ID is a valid ObjectId
    if (ObjectId.isValid(id)) {
      user = await db.collection("user").findOne({ _id: new ObjectId(id) })
    }

    // If not found by _id, try to find by username
    if (!user) {
      user = await db.collection("user").findOne({ username: id })
    }

    if (!user) {
      notFound()
    }

    // Fetch product data
    const product = await db.collection("products").findOne({ userId: user._id.toString() })

    // Fetch certifications
    const certifications = await db.collection("certifications").find({ userId: user._id.toString() }).toArray()

    // Fetch farming logs (nhatky)
    const farmingLogs = await db
      .collection("nhatky")
      .find({ uId: user._id.toString() })
      .sort({ ngayThucHien: -1 })
      .toArray()

    // Fetch seasons (muavu)
    const seasons = await db.collection("muavu").find({ uId: user._id.toString() }).toArray()

    return (
      <FarmerProfile
        user={JSON.parse(JSON.stringify(user))}
        product={product ? JSON.parse(JSON.stringify(product)) : null}
        certifications={certifications ? JSON.parse(JSON.stringify(certifications)) : []}
        farmingLogs={farmingLogs ? JSON.parse(JSON.stringify(farmingLogs)) : []}
        seasons={seasons ? JSON.parse(JSON.stringify(seasons)) : []}
      />
    )
  } catch (error) {
    console.error("Error fetching farmer profile:", error)
    notFound()
  }
}

