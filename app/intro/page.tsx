import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function IntroPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600 p-4">
      <div className="text-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-bold text-white">Welcome to Our App</h1>
        <p className="text-xl md:text-2xl text-white/80">Discover amazing features and boost your productivity</p>
        <Link href="/login" passHref>
          <Button size="lg" className="text-lg px-8 py-6 bg-white text-purple-600 hover:bg-purple-100">
            Get Started
          </Button>
        </Link>
      </div>
    </div>
  )
}

