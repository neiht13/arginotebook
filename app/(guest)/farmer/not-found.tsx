import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-green-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Không tìm thấy nông hộ</h2>
        <p className="text-gray-600 mb-8">
          Nông hộ bạn đang tìm kiếm không tồn tại hoặc đã bị xóa. Vui lòng kiểm tra lại ID nông hộ.
        </p>
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link href="/">Quay lại trang chủ</Link>
        </Button>
      </div>
    </div>
  )
}

