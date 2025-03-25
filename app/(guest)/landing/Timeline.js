'use client'
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select";

const groupByGiaiDoan = (items) => {
  items?.sort((a, b) => {
    const parseDate = (dateStr) => {
      const [day, month, year] = dateStr.split("-").map(Number);
      return new Date(year, month - 1, day);
    };

    const dateA = parseDate(a.ngayThucHien);
    const dateB = parseDate(b.ngayThucHien);

    return dateA - dateB;
  });

  return items?.reduce((groups, item) => {
    const { giaiDoan } = item;
    if (!groups[giaiDoan]) {
      groups[giaiDoan] = [];
    }
    groups[giaiDoan].push(item);
    return groups;
  }, {});
};

export default function Timeline({ nhatky, muavu }) {
  const [selectedMuaVu, setSelectedMuaVu] = useState(Array.of(muavu).findLast._id);

  // Lọc nhật ký theo mùa vụ nếu có chọn
  const filteredNhatKy = selectedMuaVu
    ? nhatky.filter((item) => item.muaVuId === selectedMuaVu)
    : nhatky;

  const groupedItems = groupByGiaiDoan(filteredNhatKy);
  const giaiDoans = groupedItems && Object.keys(groupedItems);

  return (
    <div id="timeline" className="bg-green-50 py-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-3">
          <div></div>
          <h2 className="text-3xl font-bold text-center text-pretty">Nhật ký canh tác</h2>
          <div className="bg-white rounded-lg">
            <Select onValueChange={(value) => setSelectedMuaVu(value)}>
              <SelectTrigger aria-label="Mùa vụ">
                <SelectValue placeholder="Chọn mùa vụ" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Mùa vụ</SelectLabel>
                  {muavu.map((item) => (
                    <SelectItem key={item._id} value={item._id}>
                      {item.muavu +" "+ item.nam}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="relative wrap overflow-hidden p-4 md:p-10 h-full">
          <div className="border-2-2 absolute border-opacity-20 border-gray-700 h-full border left-[15px] md:left-1/2"></div>
          {groupedItems && giaiDoans.length === 0 ? (
            <p className="text-center text-gray-500">Không có dữ liệu để hiển thị.</p>
          ) : (
            groupedItems && giaiDoans.map((giaiDoan, stageIndex) => (
              <div key={giaiDoan} className="mb-12">
                {/* Tiêu đề giai đoạn */}
                <div className="flex justify-center mb-6">
                  <span className="z-20 px-4 py-2 bg-green-800 text-white rounded-full text-sm font-semibold">
                    {stageIndex + 1}. {giaiDoan}
                  </span>
                </div>
                {groupedItems[giaiDoan].map((item, index) => (
                  <div
                    className={`mb-8 flex justify-between items-center w-full ${
                      index % 2 === 0 ? "md:flex-row-reverse" : "md:flex-row"
                    }`}
                    key={index}
                  >
                    <div className="order-1 md:w-5/12 hidden md:block"></div>
                    <div className="z-20 flex items-center order-1 bg-green-800 shadow-xl w-8 h-8 rounded-full">
                      <h1 className="mx-auto font-semibold text-lg text-white">
                        {index + 1}
                      </h1>
                    </div>
                    <Card className="order-1 w-full md:w-5/12 px-4 py-4">
                      <div className="flex flex-col md:flex-row">
                        <CardContent className="flex-1 px-6 py-0">
                          <time className="mb-1 text-sm font-normal leading-none text-green-500 dark:text-gray-500">
                            {item.ngayThucHien} {parseInt(item.ngaySauBatDau) > 0 ? ` - ${item.ngaySauBatDau} NSS` : "" }

                          </time>
                          {item.congViec && (
                            <h3 className="text-lg font-semibold text-green-900 dark:text-white">
                              {item.congViec}
                            </h3>
                          )}
                          {item.chiTietCongViec && (
                            <p className="text-base font-normal text-gray-700 dark:text-gray-400">
                              {item.chiTietCongViec}
                            </p>
                          )}
                          {/* Hiển thị thông tin agrochemicals */}
                          {item.agrochemicals && item.agrochemicals.length > 0 && (
                            <div className="mt-2">
                              <h4 className="text-sm font-semibold text-gray-800">Liều lượng sử dụng /ha:</h4>
                              <ul className="list-disc list-inside">
                                {item.agrochemicals.map((agro, idx) => (
                                  <li key={idx} className="text-sm text-gray-700">
                                    {agro.name} - {agro.lieuLuong} {agro.donViTinh} 
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {/* Hiển thị badge cho công việc */}
                          <div className="grid grid-cols-2 mt-2">
                            {item.congViec === "Bón phân" && (
                              <Badge variant="secondary">
                                <span role="img" aria-label="fertilizer">🌱</span> Bón phân
                              </Badge>
                            )}
                            {item.congViec === "Phun thuốc" && (
                              <Badge variant="secondary">
                                <span role="img" aria-label="spray">💦</span> Phun thuốc
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                        {item.image && (
                          <div className="md:w-1/3">
                            <img
                              src={`https://gaochauthanhdt.vn/api/images/download?filename=${item.image}`}
                              alt="Hình ảnh hoạt động"
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
