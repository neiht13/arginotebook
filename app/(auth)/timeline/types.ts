export interface Agrochemical {
  id: string;
  name: string;
  type: string;
  isOrganic: boolean;
  farmingLogId: string;
  lieuLuong: number | string;
  donViTinh: string;
  donGia?: number;

}

export interface TimelineEntry {
  _id: string;
  congViec: string;
  giaiDoan: string;
  ngayThucHien: string;
  chiPhiCong: number;
  chiPhiVatTu: number;
  thanhTien: number;
  muaVu: string;
  soLuongCong: number;
  soLuongVatTu: number;
  image: string[] | null;
  agrochemicals: Agrochemical[];
  ngaySauBatDau?: string;
}

export interface EnhancedAgriculturalTimelineProps {
  data: TimelineEntry[];
  onAddEntry: (entry: TimelineEntry) => void;
}

