'use client'
import React, { useState } from 'react';
import { CalendarDays, Tractor, Sprout, DollarSign, ImageIcon, Droplet, Leaf } from 'lucide-react';
import { TimelineEntry, Agrochemical, EnhancedAgriculturalTimelineProps } from './types';
import AddEntryModal from './AddEntryModal';

interface TimelineEntryProps {
  data: TimelineEntry;
  isLast: boolean;
}

const TimelineEntryComponent: React.FC<TimelineEntryProps> = ({ data, isLast }) => {
  const formatDate = (dateString: string) => {
    const [day, month, year] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const renderAgrochemicals = (agrochemicals: Agrochemical[]) => {
    return agrochemicals.map((item) => (
      <div key={item.id} className="flex items-center text-sm text-gray-600 mt-2">
        {item.type === 'thuốc' ? <Droplet className="mr-2 h-4 w-4 text-blue-500" /> : <Leaf className="mr-2 h-4 w-4 text-green-500" />}
        <span>{item.name}: {item.lieuLuong} {item.donViTinh}</span>
        {item.donGia && <span className="ml-2">({formatCurrency(item.donGia)}/{item.donViTinh})</span>}
      </div>
    ));
  };

  return (
    <div className="relative pb-8">
      {!isLast && (
        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
      )}
      <div className="relative flex space-x-3">
        <div>
          <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
            <Tractor className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
        </div>
        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full">
            <div className="bg-green-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center">
                <CalendarDays className="mr-2" />
                <span className="text-xl font-bold">{formatDate(data.ngayThucHien)}</span>
                {data.ngaySauBatDau && (
                  <span className="ml-2 text-sm">(Ngày {data.ngaySauBatDau})</span>
                )}
              </div>
              <span className="text-sm font-medium bg-green-700 px-2 py-1 rounded">
                {data.muaVu}
              </span>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{data.giaiDoan}</h2>
              <div className="flex items-center text-gray-600 mb-4">
                <Tractor className="mr-2" />
                <span>{data.congViec}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <Sprout className="mr-2 text-green-500" />
                  <span>Số lượng công: {data.soLuongCong}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="mr-2 text-yellow-500" />
                  <span>Chi phí công: {formatCurrency(data.chiPhiCong)}</span>
                </div>
                <div className="flex items-center">
                  <Sprout className="mr-2 text-green-500" />
                  <span>Số lượng vật tư: {data.soLuongVatTu}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="mr-2 text-yellow-500" />
                  <span>Chi phí vật tư: {formatCurrency(data.chiPhiVatTu)}</span>
                </div>
              </div>
              {data.agrochemicals.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Vật tư sử dụng:</h3>
                  {renderAgrochemicals(data.agrochemicals)}
                </div>
              )}
              {data.image && data.image.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Hình ảnh:</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.image.map((img, index) => (
                      <div key={index} className="relative group">
                        <img src={`/placeholder.svg?height=100&width=100`} alt={`Image ${index + 1}`} className="w-24 h-24 object-cover rounded" />
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ImageIcon className="text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Tổng chi phí:</span>
                  <span className="text-xl font-bold text-green-600">{formatCurrency(data.chiPhiCong + data.chiPhiVatTu)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EnhancedAgriculturalTimeline: React.FC<EnhancedAgriculturalTimelineProps> = ({ data: initialData, onAddEntry }) => {
  const [data, setData] = useState<TimelineEntry[]>(initialData);

  const handleAddEntry = (newEntry: TimelineEntry) => {
    setData(prevData => [...prevData, { ...newEntry, _id: Date.now().toString() }]);
    onAddEntry(newEntry);
  };

  return (
    <div className="max-w-3xl mx-auto my-8 flow-root">
      <div className="mb-4">
        <AddEntryModal onAddEntry={handleAddEntry} />
      </div>
      <ul role="list" className="-mb-8">
        {data.map((entry, index) => (
          <li key={entry._id}>
            <TimelineEntryComponent data={entry} isLast={index === data.length - 1} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EnhancedAgriculturalTimeline;

