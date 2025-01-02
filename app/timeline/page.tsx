'use client'
import { useEffect, useState } from 'react';
import EnhancedAgriculturalTimeline from './EnhancedAgriculturalTimeline';
import { TimelineEntry } from './types';

const initialTimelineData: TimelineEntry[] = [
  {
    "_id": "674832beb7b52c16eaeababe",
    "congViec": "Cấy dặm",
    "giaiDoan": "Lúa mạ",
    "ngayThucHien": "22-09-2024",
    "chiPhiCong": 450000,
    "chiPhiVatTu": 0,
    "thanhTien": 0,
    "muaVu": "Thu Đông",
    "soLuongCong": 1,
    "soLuongVatTu": 0,
    "image": null,
    "agrochemicals": [],
    "ngaySauBatDau": "21"
  },
  {
    "_id": "67483de6b7b52c16eaeababf",
    "congViec": "Phun thuốc",
    "giaiDoan": "Lúa mạ",
    "ngayThucHien": "03-09-2024",
    "chiPhiCong": 0,
    "chiPhiVatTu": 95000,
    "thanhTien": 0,
    "muaVu": "Thu Đông",
    "soLuongCong": 0,
    "soLuongVatTu": 2,
    "image": ['image1.png', 'image2.jpg'],
    "agrochemicals": [
      {
        "id": "67483df2846bdceecb1b3d64",
        "name": "Diet mam",
        "type": "thuốc",
        "isOrganic": false,
        "farmingLogId": "67483de6b7b52c16eaeababf",
        "lieuLuong": "2",
        "donViTinh": "l"
      }
    ]
  },
  {
    "_id": "67492bc4b7b52c16eaeabac1",
    "congViec": "Bón phân",
    "giaiDoan": "Lúa mạ",
    "ngayThucHien": "11-09-2024",
    "chiPhiCong": 0,
    "chiPhiVatTu": 250000,
    "thanhTien": 0,
    "muaVu": "Thu Đông",
    "soLuongCong": 0,
    "soLuongVatTu": 1,
    "image": null,
    "agrochemicals": [
      {
        "id": "67493a77cf64535a4203fb55",
        "name": "ure",
        "type": "phân",
        "isOrganic": false,
        "farmingLogId": "67492bc4b7b52c16eaeabac1",
        "lieuLuong": 25,
        "donGia": 10000,
        "donViTinh": "kg"
      }
    ],
    "ngaySauBatDau": "10"
  }
];

export default function TimelinePage() {
  const [timelineData, setTimelineData] = useState<TimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true)

 useEffect(() => {
  setTimelineData(initialTimelineData)
  setIsLoading(false)
 },[])

  const handleAddEntry = (newEntry: TimelineEntry) => {
    setTimelineData(prevData => [...prevData, { ...newEntry, _id: Date.now().toString() }]);
    // Here you would typically send the new entry to your backend API
    console.log('New entry added:', newEntry);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Enhanced Agricultural Timeline</h1>
      <EnhancedAgriculturalTimeline data={timelineData} isLoading={isLoading} onAddEntry={handleAddEntry} />
    </div>
  );
}

