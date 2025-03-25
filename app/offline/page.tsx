"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { WifiOff, Home, RefreshCw, Database } from "lucide-react"
import { useRouter } from "next/navigation"
import { useNetworkStore } from "@/lib/network-status"
import { getAppSetting } from "@/lib/offline-storage"

export default function OfflinePage() {
  const router = useRouter()
  const isOnline = useNetworkStore((state) => state.isOnline)
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)
  const [cachedPages, setCachedPages] = useState<string[]>([])

  useEffect(() => {
    // Check if we're back online
    if (isOnline) {
      router.push("/")
    }

    // Get last sync time
    const fetchLastSyncTime = async () => {
      try {
        const time = await getAppSetting("lastSyncTime")
        if (time) {
          setLastSyncTime(new Date(time).toLocaleString())
        } else {
          // Try from localStorage as fallback
          const localTime = localStorage.getItem("lastSyncTime")
          if (localTime) {
            setLastSyncTime(new Date(localTime).toLocaleString())
          }
        }
      } catch (error) {
        console.error("Error fetching last sync time:", error)
      }
    }

    // Check which pages are cached
    const checkCachedPages = async () => {
      try {
        if ("caches" in window) {
          const cache = await caches.open("nkct-cache-v2")
          const keys = await cache.keys()
          const urls = keys.map((request) => {
            const url = new URL(request.url)
            return url.pathname
          })

          // Filter for main app routes
          const appPages = ["/", "/timeline", "/profile", "/statistics", "/category", "/vattu", "/ultilities"]

          const available = appPages.filter((page) => urls.some((url) => url === page || url === `${page}/`))

          setCachedPages(available)
        }
      } catch (error) {
        console.error("Error checking cached pages:", error)
      }
    }

    fetchLastSyncTime()
    checkCachedPages()
  }, [isOnline, router])

  const checkConnection = () => {
    window.location.reload()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <WifiOff className="h-8 w-8 text-amber-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Bạn đang ngoại tuyến</CardTitle>
          <CardDescription>Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
            <p>
              Ứng dụng đang hoạt động ở chế độ ngoại tuyến. Bạn vẫn có thể truy cập các trang đã được lưu trong bộ nhớ
              đệm.
            </p>
            {lastSyncTime && (
              <p className="mt-2 flex items-center text-xs">
                <Database className="mr-1 h-3 w-3" />
                Lần đồng bộ cuối: {lastSyncTime}
              </p>
            )}
          </div>

          {cachedPages.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Các trang có thể truy cập:</h3>
              <div className="grid grid-cols-2 gap-2">
                {cachedPages.map((page) => (
                  <Button
                    key={page}
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => router.push(page)}
                  >
                    {page === "/" ? "Trang chủ" : page.replace("/", "")}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button className="w-full" onClick={checkConnection}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Kiểm tra kết nối
          </Button>
          <Button variant="outline" className="w-full" onClick={() => router.push("/")}>
            <Home className="mr-2 h-4 w-4" />
            Về trang chủ
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

