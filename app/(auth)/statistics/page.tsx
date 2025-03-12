"use client"

import { useState, useMemo, useEffect } from "react"
import { motion } from "framer-motion"
import * as XLSX from "xlsx"
import { Download, Calendar, TrendingUpIcon, LineChartIcon, BarChartIcon, PieChartIcon } from "lucide-react"

// UI components
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"

// Import 4 chart component đã sửa lại
import AreaChartComponent from "@/app/components/chart/AreaChartComponent"
import BarChartComponent from "@/app/components/chart/BarChartComponent"
import PieChartComponent from "@/app/components/chart/PieChartComponent"
import RadarChartComponent from "@/app/components/chart/RadarChartComponent"
import TaskCountChart from "./TaskCountChart"
import TaskDateChart from "./TaskDateChart"
import TaskTypeChart from "./TaskTypeChart"
import FinancialChart from "./FinancialChart"
import axios from "axios"

// ---------------------- DỮ LIỆU GỐC ----------------------
// const farmingLogs = [{
//   "_id": {
//     "$oid": "6747eb84b64cb60233377116"
//   },
//   "uId": "673c02b70df7665d45340b11",
//   "xId": "",
//   "chiPhiVatTu": 0,
//   "chiphicong": 1600000,
//   "chiPhiCong": 1600000,
//   "soLuongVatTu": 0,
//   "donViTinh": "",
//   "congViec": "Cày đất",
//   "congViecId": "66e8ef9053bd51ade39bcf54",
//   "giaiDoan": "Làm đất - xuống giống",
//   "giaiDoanId": "6583a87a45e4c89f207aed1c",
//   "ngayCapNhat": null,
//   "thanhTien": 16000000,
//   "loaiPhan": null,
//   "tenPhan": "",
//   "loaiThuoc": null,
//   "tenThuoc": "",
//   "ngayThucHien": "31-08-2024",
//   "image": null,
//   "muaVu": "Thu Đông",
//   "muaVuId": "673c2dd01f8b41e75f4d39e8",
//   "chiTietCongViec": "",
//   "ghiChu": null,
//   "year": null,
//   "agrochemicals": [],
//   "soLuongCong": 1,
//   "ngaySauBatDau": ""
// },
// {
//   "_id": {
//     "$oid": "67483201b7b52c16eaeababd"
//   },
//   "uId": "673c02b70df7665d45340b11",
//   "xId": "",
//   "chiPhiVatTu": 0,
//   "chiPhiCong": 340000,
//   "soLuongCong": 1,
//   "soLuongVatTu": 0,
//   "donViTinh": "",
//   "congViec": "Trạc đất",
//   "congViecId": "66e8ef9053bd51ade39bcf53",
//   "giaiDoan": "Làm đất - xuống giống",
//   "giaiDoanId": "6583a87a45e4c89f207aed1c",
//   "ngayCapNhat": null,
//   "thanhTien": 0,
//   "loaiPhan": null,
//   "tenPhan": "",
//   "loaiThuoc": null,
//   "tenThuoc": "",
//   "ngayThucHien": "31-08-2024",
//   "image": null,
//   "muaVu": "Thu Đông",
//   "muaVuId": "673c2dd01f8b41e75f4d39e8",
//   "chiTietCongViec": "",
//   "ghiChu": null,
//   "year": null,
//   "agrochemicals": [],
//   "ngaySauBatDau": ""
// },
// {
//   "_id": {
//     "$oid": "674832beb7b52c16eaeababe"
//   },
//   "uId": "673c02b70df7665d45340b11",
//   "xId": "",
//   "chiPhiVatTu": 0,
//   "chiPhiCong": 50000,
//   "soLuongCong": 1,
//   "soLuongVatTu": 0,
//   "donViTinh": "",
//   "congViec": "Cấy dặm",
//   "congViecId": "66e8ef9053bd51ade39bcf6f",
//   "giaiDoan": "Lúa mạ",
//   "giaiDoanId": "6583aadf45e4c89f207aed1e",
//   "ngayCapNhat": null,
//   "thanhTien": 0,
//   "loaiPhan": null,
//   "tenPhan": "",
//   "loaiThuoc": null,
//   "tenThuoc": "",
//   "ngayThucHien": "22-09-2024",
//   "image": null,
//   "muaVu": "Thu Đông",
//   "muaVuId": "673c2dd01f8b41e75f4d39e8",
//   "chiTietCongViec": "",
//   "ghiChu": null,
//   "year": null,
//   "agrochemicals": [],
//   "ngaySauBatDau": "21"
// },
// {
//   "_id": {
//     "$oid": "67492bc4b7b52c16eaeabac1"
//   },
//   "uId": "673c02b70df7665d45340b11",
//   "xId": "",
//   "chiPhiVatTu": 737500,
//   "chiPhiCong": 0,
//   "soLuongCong": 0,
//   "soLuongVatTu": 1,
//   "donViTinh": "",
//   "congViec": "Bón phân",
//   "congViecId": "66e8ef9053bd51ade39bcf59",
//   "giaiDoan": "Lúa mạ",
//   "giaiDoanId": "6583aadf45e4c89f207aed1e",
//   "ngayCapNhat": null,
//   "thanhTien": 0,
//   "loaiPhan": null,
//   "tenPhan": "",
//   "loaiThuoc": null,
//   "tenThuoc": "",
//   "ngayThucHien": "11-09-2024",
//   "ngaySauBatDau": "10",
//   "image": null,
//   "muaVu": "Thu Đông",
//   "muaVuId": "673c2dd01f8b41e75f4d39e8",
//   "chiTietCongViec": "",
//   "ghiChu": null,
//   "year": null,
//   "agrochemicals": [
//     {
//       "id": null,
//       "name": "URE",
//       "type": "phân",
//       "isOrganic": false,
//       "farmingLogId": "67492bc4b7b52c16eaeabac1",
//       "lieuLuong": 25,
//       "donGia": 10000,
//       "donViTinh": "kg"
//     },
//     {
//       "id": null,
//       "name": "DAP",
//       "type": "phân",
//       "isOrganic": false,
//       "farmingLogId": "67492bc4b7b52c16eaeabac1",
//       "lieuLuong": 25,
//       "donGia": 19500,
//       "donViTinh": "kg"
//     }
//   ]
// },
// {
//   "_id": {
//     "$oid": "674d120762b5a7f80988c600"
//   },
//   "uId": "673c02b70df7665d45340b11",
//   "xId": "",
//   "chiPhiVatTu": 0,
//   "chiPhiCong": 200000,
//   "soLuongCong": 1,
//   "soLuongVatTu": 0,
//   "donViTinh": "",
//   "congViec": "Công việc khác",
//   "congViecId": "66e8ef9053bd51ade39bcf64",
//   "giaiDoan": "Làm đất - xuống giống",
//   "giaiDoanId": "6583a87a45e4c89f207aed1c",
//   "ngayCapNhat": null,
//   "thanhTien": 0,
//   "loaiPhan": null,
//   "tenPhan": "",
//   "loaiThuoc": null,
//   "tenThuoc": "",
//   "ngayThucHien": "01-09-2024",
//   "ngaySauBatDau": "0",
//   "image": null,
//   "muaVu": "Thu Đông",
//   "muaVuId": "673c2dd01f8b41e75f4d39e8",
//   "chiTietCongViec": "Làm cỏ, khử lẫn",
//   "ghiChu": null,
//   "year": null,
//   "agrochemicals": []
// },
// {
//   "_id": {
//     "$oid": "674d125362b5a7f80988c601"
//   },
//   "uId": "673c02b70df7665d45340b11",
//   "xId": "",
//   "chiPhiVatTu": 0,
//   "chiPhiCong": 450000,
//   "soLuongCong": 1,
//   "soLuongVatTu": 0,
//   "donViTinh": "",
//   "congViec": "Xuống giống",
//   "congViecId": "66e8ef9053bd51ade39bcf60",
//   "giaiDoan": "Làm đất - xuống giống",
//   "giaiDoanId": "6583a87a45e4c89f207aed1c",
//   "ngayCapNhat": null,
//   "thanhTien": 0,
//   "loaiPhan": null,
//   "tenPhan": "",
//   "loaiThuoc": null,
//   "tenThuoc": "",
//   "ngayThucHien": "01-09-2024",
//   "ngaySauBatDau": "0",
//   "image": null,
//   "muaVu": "Thu Đông",
//   "muaVuId": "673c2dd01f8b41e75f4d39e8",
//   "chiTietCongViec": "",
//   "ghiChu": null,
//   "year": null,
//   "agrochemicals": []
// },
// {
//   "_id": {
//     "$oid": "674d136e62b5a7f80988c602"
//   },
//   "uId": "673c02b70df7665d45340b11",
//   "xId": "",
//   "chiPhiVatTu": 0,
//   "chiPhiCong": 416000,
//   "soLuongCong": 1,
//   "soLuongVatTu": 0,
//   "donViTinh": "",
//   "congViec": "Bón phân",
//   "congViecId": "66e8ef9053bd51ade39bcf67",
//   "giaiDoan": "Làm đất - xuống giống",
//   "giaiDoanId": "6583a87a45e4c89f207aed1c",
//   "ngayCapNhat": null,
//   "thanhTien": 0,
//   "loaiPhan": null,
//   "tenPhan": "",
//   "loaiThuoc": null,
//   "tenThuoc": "",
//   "ngayThucHien": "01-09-2024",
//   "ngaySauBatDau": "0",
//   "image": null,
//   "muaVu": "Thu Đông",
//   "muaVuId": "673c2dd01f8b41e75f4d39e8",
//   "chiTietCongViec": "Công bón phân",
//   "ghiChu": null,
//   "year": null,
//   "agrochemicals": []
// },
// {
//   "_id": {
//     "$oid": "674d13cf62b5a7f80988c603"
//   },
//   "uId": "673c02b70df7665d45340b11",
//   "xId": "",
//   "chiPhiVatTu": 0,
//   "chiPhiCong": 96000,
//   "soLuongCong": 1,
//   "soLuongVatTu": 0,
//   "donViTinh": "",
//   "congViec": "Phun thuốc",
//   "congViecId": "66e8ef9053bd51ade39bcf68",
//   "giaiDoan": "Làm đất - xuống giống",
//   "giaiDoanId": "6583a87a45e4c89f207aed1c",
//   "ngayCapNhat": null,
//   "thanhTien": 0,
//   "loaiPhan": null,
//   "tenPhan": "",
//   "loaiThuoc": null,
//   "tenThuoc": "",
//   "ngayThucHien": "01-09-2024",
//   "ngaySauBatDau": "0",
//   "image": null,
//   "muaVu": "Thu Đông",
//   "muaVuId": "673c2dd01f8b41e75f4d39e8",
//   "chiTietCongViec": "Công phun thuốc",
//   "ghiChu": null,
//   "year": null,
//   "agrochemicals": []
// },
// {
//   "_id": {
//     "$oid": "674d143b62b5a7f80988c604"
//   },
//   "uId": "673c02b70df7665d45340b11",
//   "xId": "",
//   "chiPhiVatTu": 0,
//   "chiPhiCong": 1700000,
//   "soLuongCong": 1,
//   "soLuongVatTu": 0,
//   "donViTinh": "",
//   "congViec": "Thu hoạch",
//   "congViecId": "66e8ef9053bd51ade39bcf63",
//   "giaiDoan": "Chín, thu hoạch",
//   "giaiDoanId": "6583aadf45e4c89f207aed22",
//   "ngayCapNhat": null,
//   "thanhTien": 0,
//   "loaiPhan": null,
//   "tenPhan": "",
//   "loaiThuoc": null,
//   "tenThuoc": "",
//   "ngayThucHien": "02-12-2024",
//   "ngaySauBatDau": "92",
//   "image": null,
//   "muaVu": "Thu Đông",
//   "muaVuId": "673c2dd01f8b41e75f4d39e8",
//   "chiTietCongViec": "Công thu hoạch",
//   "ghiChu": null,
//   "year": null,
//   "agrochemicals": []
// },
// {
//   "_id": {
//     "$oid": "674d1a3062b5a7f80988c605"
//   },
//   "uId": "673c02b70df7665d45340b11",
//   "xId": "",
//   "chiPhiVatTu": 0,
//   "chiPhiCong": 1500000,
//   "soLuongCong": 1,
//   "soLuongVatTu": 0,
//   "donViTinh": "",
//   "congViec": "Bơm nước",
//   "congViecId": "66e8ef9053bd51ade39bcf61",
//   "giaiDoan": "Lúa mạ",
//   "giaiDoanId": "6583aadf45e4c89f207aed1e",
//   "ngayCapNhat": null,
//   "thanhTien": 0,
//   "loaiPhan": null,
//   "tenPhan": "",
//   "loaiThuoc": null,
//   "tenThuoc": "",
//   "ngayThucHien": "01-09-2024",
//   "ngaySauBatDau": "0",
//   "image": null,
//   "muaVu": "Thu Đông",
//   "muaVuId": "673c2dd01f8b41e75f4d39e8",
//   "chiTietCongViec": "",
//   "ghiChu": null,
//   "year": null,
//   "agrochemicals": []
// },
// {
//   "_id": {
//     "$oid": "674d29f162b5a7f80988c608"
//   },
//   "uId": "673c02b70df7665d45340b11",
//   "xId": "",
//   "chiPhiVatTu": 1617500,
//   "chiPhiCong": 0,
//   "soLuongCong": 0,
//   "soLuongVatTu": 1,
//   "donViTinh": "",
//   "congViec": "Bón phân",
//   "congViecId": "66e8ef9053bd51ade39bcf59",
//   "giaiDoan": "Lúa mạ",
//   "giaiDoanId": "6583aadf45e4c89f207aed1e",
//   "ngayCapNhat": null,
//   "thanhTien": 0,
//   "loaiPhan": null,
//   "tenPhan": "",
//   "loaiThuoc": null,
//   "tenThuoc": "",
//   "ngayThucHien": "19-09-2024",
//   "ngaySauBatDau": "18",
//   "image": null,
//   "muaVu": "Thu Đông",
//   "muaVuId": "673c2dd01f8b41e75f4d39e8",
//   "chiTietCongViec": "",
//   "ghiChu": null,
//   "year": null,
//   "agrochemicals": [
//     {
//       "id": "674d2a5662b5a7f80988c60d",
//       "name": "URE",
//       "type": "phân",
//       "isOrganic": false,
//       "farmingLogId": "674d29f162b5a7f80988c608",
//       "lieuLuong": 25,
//       "donGia": 10000,
//       "donViTinh": ""
//     },
//     {
//       "id": "674d2dd2cf38884a90458058",
//       "name": "DAP",
//       "type": "phân",
//       "isOrganic": false,
//       "farmingLogId": "674d29f162b5a7f80988c608",
//       "lieuLuong": 25,
//       "donGia": 19500,
//       "donViTinh": "kg"
//     },
//     {
//       "id": "674d2dd2cf38884a90458059",
//       "name": "Hữu cơ VOH",
//       "type": "phân",
//       "isOrganic": true,
//       "farmingLogId": "674d29f162b5a7f80988c608",
//       "lieuLuong": 20,
//       "donGia": 44000,
//       "donViTinh": "kg"
//     }
//   ]
// },
// {
//   "_id": {
//     "$oid": "674d2f56cf38884a9045805a"
//   },
//   "uId": "673c02b70df7665d45340b11",
//   "xId": "",
//   "chiPhiVatTu": 1685000,
//   "chiPhiCong": 0,
//   "soLuongCong": 0,
//   "soLuongVatTu": 1,
//   "donViTinh": "",
//   "congViec": "Bón phân",
//   "congViecId": "66e8ef9053bd51ade39bcf69",
//   "giaiDoan": "Làm đòng",
//   "giaiDoanId": "6583aadf45e4c89f207aed20",
//   "ngayCapNhat": null,
//   "thanhTien": 0,
//   "loaiPhan": null,
//   "tenPhan": "",
//   "loaiThuoc": null,
//   "tenThuoc": "",
//   "ngayThucHien": "14-10-2024",
//   "ngaySauBatDau": "43",
//   "image": null,
//   "muaVu": "Thu Đông",
//   "muaVuId": "673c2dd01f8b41e75f4d39e8",
//   "chiTietCongViec": "",
//   "ghiChu": null,
//   "year": null,
//   "agrochemicals": [
//     {
//       "id": "674d2f56cf38884a9045805b",
//       "name": "URE",
//       "type": "phân",
//       "isOrganic": false,
//       "farmingLogId": "674d2f56cf38884a9045805a",
//       "lieuLuong": 25,
//       "donGia": 10000,
//       "donViTinh": "kg"
//     },
//     {
//       "id": "674d2f56cf38884a9045805c",
//       "name": "16-16-8",
//       "type": "phân",
//       "isOrganic": false,
//       "farmingLogId": "674d2f56cf38884a9045805a",
//       "lieuLuong": 55,
//       "donGia": 13000,
//       "donViTinh": "kg"
//     },
//     {
//       "id": "674d2f56cf38884a9045805d",
//       "name": "Kali",
//       "type": "phân",
//       "isOrganic": false,
//       "farmingLogId": "674d2f56cf38884a9045805a",
//       "lieuLuong": 60,
//       "donGia": 12000,
//       "donViTinh": "kg"
//     }
//   ]
// },
// {
//   "_id": {
//     "$oid": "674d6266cf38884a9045805e"
//   },
//   "uId": "673c02b70df7665d45340b11",
//   "xId": "",
//   "chiPhiVatTu": 190000,
//   "chiPhiCong": 0,
//   "soLuongCong": 0,
//   "soLuongVatTu": 1,
//   "donViTinh": "",
//   "congViec": "Phun thuốc",
//   "congViecId": "66e8ef9053bd51ade39bcf55",
//   "giaiDoan": "Lúa mạ",
//   "giaiDoanId": "6583aadf45e4c89f207aed1e",
//   "ngayCapNhat": null,
//   "thanhTien": 0,
//   "loaiPhan": null,
//   "tenPhan": "",
//   "loaiThuoc": null,
//   "tenThuoc": "",
//   "ngayThucHien": "03-09-2024",
//   "ngaySauBatDau": "2",
//   "image": null,
//   "muaVu": "Thu Đông",
//   "muaVuId": "673c2dd01f8b41e75f4d39e8",
//   "chiTietCongViec": "",
//   "ghiChu": null,
//   "year": null,
//   "agrochemicals": [
//     {
//       "id": null,
//       "name": "Taco",
//       "type": "thuốc",
//       "isOrganic": false,
//       "farmingLogId": "674d6266cf38884a9045805e",
//       "lieuLuong": 2,
//       "donGia": 95000,
//       "donViTinh": "lít",
//       "doiTuong": null
//     }
//   ]
// },
// {
//   "_id": {
//     "$oid": "674d65f5cf38884a90458061"
//   },
//   "uId": "673c02b70df7665d45340b11",
//   "xId": "",
//   "chiPhiVatTu": 360000,
//   "chiPhiCong": 0,
//   "soLuongCong": 0,
//   "soLuongVatTu": 1,
//   "donViTinh": "",
//   "congViec": "Phun thuốc",
//   "congViecId": "66e8ef9053bd51ade39bcf55",
//   "giaiDoan": "Lúa mạ",
//   "giaiDoanId": "6583aadf45e4c89f207aed1e",
//   "ngayCapNhat": null,
//   "thanhTien": 0,
//   "loaiPhan": null,
//   "tenPhan": "",
//   "loaiThuoc": null,
//   "tenThuoc": "",
//   "ngayThucHien": "10-09-2024",
//   "ngaySauBatDau": "9",
//   "image": null,
//   "muaVu": "Thu Đông",
//   "muaVuId": "673c2dd01f8b41e75f4d39e8",
//   "chiTietCongViec": "",
//   "ghiChu": null,
//   "year": null,
//   "agrochemicals": [
//     {
//       "id": null,
//       "name": "Mitreo",
//       "type": "thuốc",
//       "isOrganic": false,
//       "farmingLogId": null,
//       "lieuLuong": 2,
//       "donGia": 180000,
//       "donViTinh": "lít",
//       "doiTuong": null
//     }
//   ]
// },
// {
//   "_id": {
//     "$oid": "674d67a0cf38884a90458063"
//   },
//   "uId": "673c02b70df7665d45340b11",
//   "xId": "",
//   "chiPhiVatTu": 3530000,
//   "chiPhiCong": 0,
//   "soLuongCong": 0,
//   "soLuongVatTu": 1,
//   "donViTinh": "",
//   "congViec": "Phun thuốc",
//   "congViecId": "66e8ef9053bd51ade39bcf5b",
//   "giaiDoan": "Đẻ nhánh",
//   "giaiDoanId": "6583aadf45e4c89f207aed1f",
//   "ngayCapNhat": null,
//   "thanhTien": 0,
//   "loaiPhan": null,
//   "tenPhan": "",
//   "loaiThuoc": null,
//   "tenThuoc": "",
//   "ngayThucHien": "09-10-2024",
//   "ngaySauBatDau": "38",
//   "image": null,
//   "muaVu": "Thu Đông",
//   "muaVuId": "673c2dd01f8b41e75f4d39e8",
//   "chiTietCongViec": "",
//   "ghiChu": null,
//   "year": null,
//   "agrochemicals": [
//     {
//       "id": "674d67a0cf38884a90458064",
//       "name": "Bum",
//       "type": "thuốc",
//       "isOrganic": false,
//       "farmingLogId": "674d67a0cf38884a90458063",
//       "lieuLuong": 20,
//       "donGia": 43000,
//       "donViTinh": "gói",
//       "doiTuong": null
//     },
//     {
//       "id": "674d67a0cf38884a90458065",
//       "name": "Vô H",
//       "type": "thuốc",
//       "isOrganic": false,
//       "farmingLogId": "674d67a0cf38884a90458063",
//       "lieuLuong": 3,
//       "donGia": 300000,
//       "donViTinh": "chai",
//       "doiTuong": null
//     },
//     {
//       "id": "674d67a0cf38884a90458066",
//       "name": "Canxi + Kẽm",
//       "type": "thuốc",
//       "isOrganic": false,
//       "farmingLogId": "674d67a0cf38884a90458063",
//       "lieuLuong": 3,
//       "donGia": 280000,
//       "donViTinh": "chai",
//       "doiTuong": null
//     },
//     {
//       "id": "674d67a1cf38884a90458067",
//       "name": "Nấm + khuẩn",
//       "type": "thuốc",
//       "isOrganic": false,
//       "farmingLogId": "674d67a0cf38884a90458063",
//       "lieuLuong": 3,
//       "donGia": 310000,
//       "donViTinh": "chai",
//       "doiTuong": null
//     }
//   ]
// },
// {
//   "_id": {
//     "$oid": "674d6d23cf38884a90458068"
//   },
//   "uId": "673c02b70df7665d45340b11",
//   "xId": "",
//   "chiPhiVatTu": 3440000,
//   "chiPhiCong": 0,
//   "soLuongCong": 0,
//   "soLuongVatTu": 1,
//   "donViTinh": "",
//   "congViec": "Phun thuốc",
//   "congViecId": "66e8ef9053bd51ade39bcf56",
//   "giaiDoan": "Làm đòng",
//   "giaiDoanId": "6583aadf45e4c89f207aed20",
//   "ngayCapNhat": null,
//   "thanhTien": 0,
//   "loaiPhan": null,
//   "tenPhan": "",
//   "loaiThuoc": null,
//   "tenThuoc": "",
//   "ngayThucHien": "21-10-2024",
//   "ngaySauBatDau": "50",
//   "image": null,
//   "muaVu": "Thu Đông",
//   "muaVuId": "673c2dd01f8b41e75f4d39e8",
//   "chiTietCongViec": "",
//   "ghiChu": null,
//   "year": null,
//   "agrochemicals": [
//     {
//       "id": "674d6e83cf38884a9045806a",
//       "name": "VoH",
//       "type": "thuốc",
//       "isOrganic": false,
//       "farmingLogId": "674d6d23cf38884a90458068",
//       "lieuLuong": 3,
//       "donGia": 300000,
//       "donViTinh": "chai",
//       "doiTuong": null
//     },
//     {
//       "id": "674d6e83cf38884a9045806c",
//       "name": "Canxi + Kẽm",
//       "type": "thuốc",
//       "isOrganic": false,
//       "farmingLogId": "674d6d23cf38884a90458068",
//       "lieuLuong": 3,
//       "donGia": 250000,
//       "donViTinh": "lít",
//       "doiTuong": null
//     },
//     {
//       "id": "674d6e83cf38884a9045806d",
//       "name": "Nấm khuẩn",
//       "type": "thuốc",
//       "isOrganic": false,
//       "farmingLogId": "674d6d23cf38884a90458068",
//       "lieuLuong": 3,
//       "donGia": 310000,
//       "donViTinh": "chai",
//       "doiTuong": null
//     },
//     {
//       "id": null,
//       "name": "Bum",
//       "type": "thuốc",
//       "isOrganic": false,
//       "farmingLogId": "674d6d23cf38884a90458068",
//       "lieuLuong": 20,
//       "donGia": 43000,
//       "donViTinh": "gói",
//       "doiTuong": null
//     }
//   ]
// },
// {
//   "_id": {
//     "$oid": "674d71b0cf38884a9045806e"
//   },
//   "uId": "673c02b70df7665d45340b11",
//   "xId": "",
//   "chiPhiVatTu": 4730000,
//   "chiPhiCong": 0,
//   "soLuongCong": 0,
//   "soLuongVatTu": 1,
//   "donViTinh": "",
//   "congViec": "Phun thuốc",
//   "congViecId": "66e8ef9053bd51ade39bcf56",
//   "giaiDoan": "Làm đòng",
//   "giaiDoanId": "6583aadf45e4c89f207aed20",
//   "ngayCapNhat": null,
//   "thanhTien": 0,
//   "loaiPhan": null,
//   "tenPhan": "",
//   "loaiThuoc": null,
//   "tenThuoc": "",
//   "ngayThucHien": "31-10-2024",
//   "ngaySauBatDau": "60",
//   "image": null,
//   "muaVu": "Thu Đông",
//   "muaVuId": "673c2dd01f8b41e75f4d39e8",
//   "chiTietCongViec": "",
//   "ghiChu": null,
//   "year": null,
//   "agrochemicals": [
//     {
//       "id": null,
//       "name": "Bum",
//       "type": "thuốc",
//       "isOrganic": false,
//       "farmingLogId": null,
//       "lieuLuong": 20,
//       "donGia": 43000,
//       "donViTinh": "gói",
//       "doiTuong": null
//     },
//     {
//       "id": null,
//       "name": "VôH",
//       "type": "thuốc",
//       "isOrganic": false,
//       "farmingLogId": null,
//       "lieuLuong": 3,
//       "donGia": 300000,
//       "donViTinh": "chai",
//       "doiTuong": null
//     },
//     {
//       "id": null,
//       "name": "Canxi + Kẽm",
//       "type": "thuốc",
//       "isOrganic": false,
//       "farmingLogId": null,
//       "lieuLuong": 3,
//       "donGia": 250000,
//       "donViTinh": "chai",
//       "doiTuong": null
//     },
//     {
//       "id": null,
//       "name": "Nấm khuẩn",
//       "type": "thuốc",
//       "isOrganic": false,
//       "farmingLogId": null,
//       "lieuLuong": 3,
//       "donGia": 310000,
//       "donViTinh": "chai",
//       "doiTuong": null
//     },
//     {
//       "id": null,
//       "name": "Cum bi",
//       "type": "thuốc",
//       "isOrganic": false,
//       "farmingLogId": null,
//       "lieuLuong": 30,
//       "donGia": 43000,
//       "donViTinh": "gói",
//       "doiTuong": null
//     }
//   ]
// },
// {
//   "_id": {
//     "$oid": "674d729ecf38884a90458075"
//   },
//   "uId": "673c02b70df7665d45340b11",
//   "xId": "",
//   "chiPhiVatTu": 3440000,
//   "chiPhiCong": 0,
//   "soLuongCong": 0,
//   "soLuongVatTu": 1,
//   "donViTinh": "",
//   "congViec": "Phun thuốc",
//   "congViecId": "66e8ef9053bd51ade39bcf5b",
//   "giaiDoan": "Đẻ nhánh",
//   "giaiDoanId": "6583aadf45e4c89f207aed1f",
//   "ngayCapNhat": null,
//   "thanhTien": 0,
//   "loaiPhan": null,
//   "tenPhan": "",
//   "loaiThuoc": null,
//   "tenThuoc": "",
//   "ngayThucHien": "26-09-2024",
//   "ngaySauBatDau": "25",
//   "image": null,
//   "muaVu": "Thu Đông",
//   "muaVuId": "673c2dd01f8b41e75f4d39e8",
//   "chiTietCongViec": "",
//   "ghiChu": null,
//   "year": null,
//   "agrochemicals": [
//     {
//       "id": null,
//       "name": "Bum",
//       "type": "thuốc",
//       "isOrganic": false,
//       "farmingLogId": null,
//       "lieuLuong": 20,
//       "donGia": 43000,
//       "donViTinh": "gói",
//       "doiTuong": null
//     },
//     {
//       "id": null,
//       "name": "Vô H",
//       "type": "thuốc",
//       "isOrganic": false,
//       "farmingLogId": null,
//       "lieuLuong": 3,
//       "donGia": 300000,
//       "donViTinh": "chai",
//       "doiTuong": null
//     },
//     {
//       "id": null,
//       "name": "Can xi + Kẽm",
//       "type": "thuốc",
//       "isOrganic": false,
//       "farmingLogId": null,
//       "lieuLuong": 3,
//       "donGia": 250000,
//       "donViTinh": "chai",
//       "doiTuong": null
//     },
//     {
//       "id": null,
//       "name": "Nấm khuẩn",
//       "type": "thuốc",
//       "isOrganic": false,
//       "farmingLogId": null,
//       "lieuLuong": 3,
//       "donGia": 310000,
//       "donViTinh": "chai",
//       "doiTuong": null
//     }
//   ]
// },
// {
//   "_id": {
//     "$oid": "674d743acf38884a9045807a"
//   },
//   "uId": "673c02b70df7665d45340b11",
//   "xId": "",
//   "chiPhiVatTu": 4400000,
//   "chiPhiCong": 0,
//   "soLuongCong": 0,
//   "soLuongVatTu": 1,
//   "donViTinh": "",
//   "congViec": "Phun thuốc",
//   "congViecId": "66e8ef9053bd51ade39bcf5f",
//   "giaiDoan": "Trổ chín",
//   "giaiDoanId": "6583aadf45e4c89f207aed21",
//   "ngayCapNhat": null,
//   "thanhTien": 0,
//   "loaiPhan": null,
//   "tenPhan": "",
//   "loaiThuoc": null,
//   "tenThuoc": "",
//   "ngayThucHien": "25-11-2024",
//   "ngaySauBatDau": "85",
//   "image": null,
//   "muaVu": "Thu Đông",
//   "muaVuId": "673c2dd01f8b41e75f4d39e8",
//   "chiTietCongViec": "",
//   "ghiChu": null,
//   "year": null,
//   "agrochemicals": [
//     {
//       "id": "674d743acf38884a9045807b",
//       "name": "Bum",
//       "type": "thuốc",
//       "isOrganic": false,
//       "farmingLogId": "674d743acf38884a9045807a",
//       "lieuLuong": 20,
//       "donGia": 43000,
//       "donViTinh": "gói",
//       "doiTuong": null
//     },
//     {
//       "id": "674d743acf38884a9045807c",
//       "name": "Vô H",
//       "type": "thuốc",
//       "isOrganic": false,
//       "farmingLogId": "674d743acf38884a9045807a",
//       "lieuLuong": 3,
//       "donGia": 300000,
//       "donViTinh": "chai",
//       "doiTuong": null
//     },
//     {
//       "id": "674d743acf38884a9045807d",
//       "name": "Canxi + Kẽm",
//       "type": "thuốc",
//       "isOrganic": false,
//       "farmingLogId": "674d743acf38884a9045807a",
//       "lieuLuong": 3,
//       "donGia": 250000,
//       "donViTinh": "chai",
//       "doiTuong": null
//     },
//     {
//       "id": "674d743acf38884a9045807e",
//       "name": "Nấm khuẩn",
//       "type": "thuốc",
//       "isOrganic": false,
//       "farmingLogId": "674d743acf38884a9045807a",
//       "lieuLuong": 3,
//       "donGia": 310000,
//       "donViTinh": "chai",
//       "doiTuong": null
//     },
//     {
//       "id": "674d743acf38884a9045807f",
//       "name": "Kali",
//       "type": "thuốc",
//       "isOrganic": false,
//       "farmingLogId": "674d743acf38884a9045807a",
//       "lieuLuong": 80,
//       "donGia": 12000,
//       "donViTinh": "gói",
//       "doiTuong": null
//     }
//   ]
// },
// {
//   "_id": {
//     "$oid": "674d74d8cf38884a90458080"
//   },
//   "uId": "673c02b70df7665d45340b11",
//   "xId": "",
//   "chiPhiVatTu": 2100000,
//   "chiPhiCong": 0,
//   "soLuongCong": 0,
//   "soLuongVatTu": 1,
//   "donViTinh": "",
//   "congViec": "Phun thuốc",
//   "congViecId": "66e8ef9053bd51ade39bcf62",
//   "giaiDoan": "Chín, thu hoạch",
//   "giaiDoanId": "6583aadf45e4c89f207aed22",
//   "ngayCapNhat": null,
//   "thanhTien": 0,
//   "loaiPhan": null,
//   "tenPhan": "",
//   "loaiThuoc": null,
//   "tenThuoc": "",
//   "ngayThucHien": "25-11-2024",
//   "ngaySauBatDau": "85",
//   "image": null,
//   "muaVu": "Thu Đông",
//   "muaVuId": "673c2dd01f8b41e75f4d39e8",
//   "chiTietCongViec": "",
//   "ghiChu": null,
//   "year": null,
//   "agrochemicals": [
//     {
//       "id": null,
//       "name": "Vô H",
//       "type": "thuốc",
//       "isOrganic": false,
//       "farmingLogId": null,
//       "lieuLuong": 3,
//       "donGia": 300000,
//       "donViTinh": "chai",
//       "doiTuong": null
//     },
//     {
//       "id": null,
//       "name": "Kali",
//       "type": "thuốc",
//       "isOrganic": false,
//       "farmingLogId": null,
//       "lieuLuong": 100,
//       "donGia": 12000,
//       "donViTinh": "gói",
//       "doiTuong": null
//     }
//   ]
// }]

// ---------------------- DỮ LIỆU GỐC ----------------------

const cultivationAreaBySeasonData = [
  { name: "Xuân", area: 1000 },
  { name: "Hè", area: 1200 },
  { name: "Thu", area: 900 },
  { name: "Đông", area: 800 },
]

const userCountData = [
  { name: "Thành viên", value: 150 },
  { name: "Cộng tác viên", value: 50 },
]

const seasonData = [
  { name: "Xuân", startMonth: 2, endMonth: 5 },
  { name: "Hè", startMonth: 6, endMonth: 8 },
  { name: "Thu", startMonth: 9, endMonth: 11 },
  { name: "Đông", startMonth: 12, endMonth: 1 },
]

// ---------------------- HÀM XỬ LÝ DỮ LIỆU CHART ----------------------
function getMonthName(num: number) {
  const names = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  return names[num - 1] || "Unknown"
}

function makeMonthData(logs) {
  // Ở đây “desktop” = chi phí công, “mobile” = chi phí vật tư
  const byMonth: Record<string, { chiPhiCong: number; chiPhiVatTu: number }> = {}

  logs.forEach((log) => {
    const d = new Date(log.ngayThucHien)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    if (!byMonth[key]) {
      byMonth[key] = { chiPhiCong: 0, chiPhiVatTu: 0 }
    }
    byMonth[key].chiPhiCong += log.chiPhiCong
    byMonth[key].chiPhiVatTu += log.chiPhiVatTu
  })

  return Object.keys(byMonth).map((key) => {
    const [year, mm] = key.split("-")
    const monthName = getMonthName(Number(mm)) + " " + year
    return {
      month: monthName,
      desktop: byMonth[key].chiPhiCong,
      mobile: byMonth[key].chiPhiVatTu,
    }
  })
}

function makePieData(logs) {
  // Ví dụ: name = công việc, value = số lần xuất hiện
  const countByWork: Record<string, number> = {}
  logs.forEach((log) => {
    if (!countByWork[log.congViec]) {
      countByWork[log.congViec] = 0
    }
    countByWork[log.congViec] += 1
  })

  return Object.keys(countByWork).map((workName) => ({
    name: workName,
    value: countByWork[workName],
  }))
}

function makeRadarData(logs) {
  // label = giai đoạn, value = tổng chi phí (công + vật tư)
  const byGiaiDoan: Record<string, number> = {}
  logs.forEach((log) => {
    const key = log.giaiDoan
    if (!byGiaiDoan[key]) {
      byGiaiDoan[key] = 0
    }
    byGiaiDoan[key] += log.chiPhiCong + log.chiPhiVatTu
  })

  return Object.keys(byGiaiDoan).map((giaiDoan) => ({
    label: giaiDoan,
    value: byGiaiDoan[giaiDoan],
  }))
}

// ---------------------- COMPONENT CHÍNH ----------------------
export default function StatisticsPage() {
  // Tabs chính: Thời gian
  const [selectedPeriod, setSelectedPeriod] = useState("all")
  const [farmingLogs, setFarmingLogs] = useState([])

  useEffect(() => {
    const fetchFarmingLogs = async () => {
      const res = await axios.get('/api/nhatky')
      
      setFarmingLogs(res.data)
    }
    fetchFarmingLogs()
  }, [])

  // Lọc logs theo khoảng thời gian
  const filteredLogs = useMemo(() => {
    
    if (selectedPeriod === "all") return farmingLogs

    const now = new Date()
    const periodStart = new Date()

    switch (selectedPeriod) {
      case "week":
        periodStart.setDate(now.getDate() - 7)
        break
      case "month":
        periodStart.setMonth(now.getMonth() - 1)
        break
      case "year":
        periodStart.setFullYear(now.getFullYear() - 1)
        break
    }

    return farmingLogs.filter((log) => {
      const date = new Date(log.ngayThucHien)
      return date >= periodStart
    })
  }, [selectedPeriod])

  // Dữ liệu cho các chart
  const areaBarData = useMemo(() => makeMonthData(filteredLogs), [filteredLogs])
  const pieData = useMemo(() => makePieData(filteredLogs), [filteredLogs])
  const radarData = useMemo(() => makeRadarData(filteredLogs), [filteredLogs])

  // Một vài số liệu tổng
  const totalTasks = filteredLogs.length
  const totalCost = filteredLogs.reduce((acc, log) => acc + log.chiPhiVatTu + log.chiPhiCong, 0)
  const totalRevenue = filteredLogs.reduce((acc, log) => acc + log.thanhTien, 0)
  const profit = totalRevenue - totalCost

  // Hàm export Excel
  const exportToExcel = () => {
    try {
      const workbook = XLSX.utils.book_new()

      // Sheet: Số lượng công việc
      const taskCountData = [["Tổng số công việc", totalTasks]]
      const taskCountSheet = XLSX.utils.aoa_to_sheet(taskCountData)
      XLSX.utils.book_append_sheet(workbook, taskCountSheet, "Số lượng công việc")

      // Sheet: Công việc theo loại
      const taskTypes = filteredLogs.reduce((acc: Record<string, number>, log) => {
        acc[log.congViec] = (acc[log.congViec] || 0) + 1
        return acc
      }, {})
      const taskTypeData = Object.entries(taskTypes).map(([name, value]) => [name, value])
      const taskTypeSheet = XLSX.utils.aoa_to_sheet([["Loại công việc", "Số lượng"], ...taskTypeData])
      XLSX.utils.book_append_sheet(workbook, taskTypeSheet, "Công việc theo loại")

      // Sheet: Công việc theo ngày
      const taskDateData = filteredLogs.reduce((acc: Record<string, number>, log) => {
        const dateKey = log.ngayThucHien
        acc[dateKey] = (acc[dateKey] || 0) + 1
        return acc
      }, {})
      const taskDateSheet = XLSX.utils.aoa_to_sheet([["Ngày", "Số lượng công việc"], ...Object.entries(taskDateData)])
      XLSX.utils.book_append_sheet(workbook, taskDateSheet, "Công việc theo ngày")

      // Sheet: Thống kê tài chính
      const financialData = [
        ["Chỉ số", "Giá trị (VND)"],
        ["Chi phí", totalCost],
        ["Doanh thu", totalRevenue],
        ["Lợi nhuận", profit],
      ]
      const financialSheet = XLSX.utils.aoa_to_sheet(financialData)
      XLSX.utils.book_append_sheet(workbook, financialSheet, "Thống kê tài chính")

      const cultivationAreaSheet = XLSX.utils.aoa_to_sheet([
        ["Mùa vụ", "Diện tích (ha)"],
        ...cultivationAreaBySeasonData.map((item) => [item.name, item.area]),
      ])
      XLSX.utils.book_append_sheet(workbook, cultivationAreaSheet, "Diện tích canh tác")

      const userCountSheet = XLSX.utils.aoa_to_sheet([
        ["Loại", "Số lượng"],
        ...userCountData.map((item) => [item.name, item.value]),
      ])
      XLSX.utils.book_append_sheet(workbook, userCountSheet, "Số lượng người dùng")

      const seasonSheet = XLSX.utils.aoa_to_sheet([
        ["Mùa vụ", "Tháng bắt đầu", "Tháng kết thúc"],
        ...seasonData.map((item) => [item.name, item.startMonth, item.endMonth]),
      ])
      XLSX.utils.book_append_sheet(workbook, seasonSheet, "Mùa vụ")

      XLSX.writeFile(workbook, "thong_ke_nong_nghiep.xlsx")
      toast.success("Xuất Excel thành công!")
    } catch (error) {
      console.error(error)
      toast.error("Xuất Excel thất bại!")
    }
  }

  const CultivationAreaChart = () => (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Diện tích canh tác theo mùa vụ</CardTitle>
      </CardHeader>
      <CardContent>
        <BarChartComponent data={cultivationAreaBySeasonData} xKey="name" yKey="area" />
      </CardContent>
    </Card>
  )

  const UserCountChart = () => (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Số lượng người dùng trong hợp tác xã</CardTitle>
      </CardHeader>
      <CardContent>
        <PieChartComponent data={userCountData} />
      </CardContent>
    </Card>
  )

  const SeasonChart = () => (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Mùa vụ</CardTitle>
      </CardHeader>
      <CardContent>
        <BarChartComponent data={seasonData} xKey="name" yKey="endMonth" />
      </CardContent>
    </Card>
  )

  // Bắt đầu phần hiển thị
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero / Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-lime-400 to-lime-600 text-white shadow-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-6xl px-6 py-12 flex flex-col md:flex-row items-center justify-between"
        >
          <h1 className="text-3xl md:text-4xl font-bold tracking-wide mb-4 md:mb-0">Thống Kê Nông Nghiệp</h1>
          <Button
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-white text-lime-700 hover:bg-lime-100 font-semibold px-4 py-2 rounded shadow-md transition-transform active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Excel</span>
          </Button>
        </motion.div>
      </div>

      {/* Nội dung chính */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-6xl px-4 py-6 md:py-10"
      >
        {/* Tabs chọn khoảng thời gian */}
        <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="mb-8">
          <TabsList className="bg-white border border-slate-200 rounded-md shadow-sm flex justify-center md:justify-start">
            <TabsTrigger
              value="all"
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none"
            >
              <Calendar className="w-4 h-4" />
              <span>Tất cả</span>
            </TabsTrigger>
            <TabsTrigger
              value="week"
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none"
            >
              <TrendingUpIcon className="w-4 h-4" />
              <span>Tuần</span>
            </TabsTrigger>
            <TabsTrigger
              value="month"
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none"
            >
              <TrendingUpIcon className="w-4 h-4" />
              <span>Tháng</span>
            </TabsTrigger>
            <TabsTrigger
              value="year"
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none"
            >
              <TrendingUpIcon className="w-4 h-4" />
              <span>Năm</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <p className="mb-4 text-slate-600">
              <strong>Tất cả ({farmingLogs.length})</strong> công việc.
            </p>
            <TaskCountChart data={farmingLogs} />
            <TaskDateChart data={farmingLogs} />
            <TaskTypeChart data={farmingLogs} />
            <FinancialChart data={farmingLogs} />
            <CultivationAreaChart />
            <UserCountChart />
            <SeasonChart />
          </TabsContent>

          <TabsContent value="week" className="mt-6">
            <p className="mb-4 text-slate-600">
              <strong>{filteredLogs.length}</strong> công việc trong 7 ngày qua.
            </p>
            {/* Biểu đồ Bar */}

            <TaskCountChart data={filteredLogs} />
            <TaskDateChart data={filteredLogs} />
            <TaskTypeChart data={filteredLogs} />
            <FinancialChart data={filteredLogs} />
            <CultivationAreaChart />
            <UserCountChart />
            <SeasonChart />
          </TabsContent>

          <TabsContent value="month" className="mt-6">
            <p className="mb-4 text-slate-600">
              <strong>{filteredLogs.length}</strong> công việc trong 1 tháng qua.
            </p>

            <TaskCountChart data={filteredLogs} />
            <TaskDateChart data={filteredLogs} />
            <TaskTypeChart data={filteredLogs} />
            <FinancialChart data={filteredLogs} />
            <CultivationAreaChart />
            <UserCountChart />
            <SeasonChart />
          </TabsContent>

          <TabsContent value="year" className="mt-6">
            <p className="mb-4 text-slate-600">
              <strong>{filteredLogs.length}</strong> công việc trong 1 năm qua.
            </p>

            <TaskCountChart data={filteredLogs} />
            <TaskDateChart data={filteredLogs} />
            <TaskTypeChart data={filteredLogs} />
            <FinancialChart data={filteredLogs} />
            <CultivationAreaChart />
            <UserCountChart />
            <SeasonChart />
          </TabsContent>
        </Tabs>

        {/* Khối thống kê nhanh (Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card className="shadow-lg border-t-4 border-lime-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="text-lime-500 w-5 h-5" />
                Tổng công việc
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">{totalTasks}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-t-4 border-lime-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChartIcon className="text-lime-500 w-5 h-5" />
                Chi phí
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">
                {totalCost.toLocaleString()} <span className="text-xl">VND</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-t-4 border-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="text-purple-500 w-5 h-5" />
                Lợi nhuận
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">
                {profit.toLocaleString()} <span className="text-xl">VND</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}

