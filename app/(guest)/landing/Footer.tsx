import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Leaf, Menu, X, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export default function Footer() {
  return (

      <footer className="bg-green-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Nhật ký canh tác</h3>
              <p className="text-sm">Nhật ký canh tác là công cụ điện tử ghi chép chi tiết mọi hoạt động canh tác về đồng ruộng của nông dân. </p>
            </div><div>
            <p className="text-sm col-span-2">Đơn vị quản lý </p>
              {/* <h3 className="text-lg font-semibold mb-4">TRUNG TÂM DỊCH VỤ NÔNG NGHIỆP Tam Nông</h3>
              <p className="text-sm">Số 147, ấp An Thạnh, Xã An Nhơn, Huyện Tam Nông, Đồng Tháp. </p> */}
             <h3 className="text-lg font-semibold mb-4">Phòng Nông Nghiệp Huyện Tam Nông</h3>
              <p className="text-sm"> Tam Nông, Đồng Tháp </p>
            </div>
            {/* <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-green-300">Our Services</a></li>
                <li><a href="#" className="hover:text-green-300">Products</a></li>
                <li><a href="#" className="hover:text-green-300">Farming Tips</a></li>
                <li><a href="#" className="hover:text-green-300">Sustainability</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <address className="text-sm not-italic">
                <p>123 Farm Road</p>
                <p>Greenville, AG 12345</p>
                <p>Phone: (123) 456-7890</p>
                <p>Email: info@argi.com</p>
              </address>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
              <form className="flex flex-col space-y-2">
                <Input type="email" placeholder="Your email" className="bg-green-800 border-green-700 text-white placeholder-green-400" />
                <Button variant="outline" className="text-white border-white hover:bg-green-800">Subscribe</Button>
              </form>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="hover:text-green-300"><Facebook className="h-5 w-5" /></a>
                <a href="#" className="hover:text-green-300"><Twitter className="h-5 w-5" /></a>
                <a href="#" className="hover:text-green-300"><Instagram className="h-5 w-5" /></a>
                <a href="#" className="hover:text-green-300"><Linkedin className="h-5 w-5" /></a>
              </div>
            </div> */}
          </div>
          <div className="mt-8 pt-4 border-t border-green-800 text-center text-sm">
            <p>&copy; 2024 Powered by VNPT Đồng Tháp.</p>
          </div>
        </div>
      </footer>
  )
}