export interface Agrochemical {
    id: string
    name: string
    type: "thuốc" | "phân" | string
    isOrganic: boolean
    farmingLogId: string
    lieuLuong: number
    donViTinh: string
    donGia?: number
    vattuId?: string
  }
  
  export interface TimelineEntry {
    _id: string
    uId?: string
    xId?: string
    congViec: string
    congViecId?: string
    giaiDoan: string
    giaiDoanId?: string
    ngayThucHien: string
    chiPhiCong: number
    chiPhiVatTu: number
    thanhTien?: number
    muaVu: string
    muaVuId?: string
    soLuongCong: number
    soLuongVatTu: number
    chiTietCongViec?: string
    ghiChu?: string
    ngaySauBatDau?: number
    image?: Array<{
      src: string
      alt: string
      _pendingUpload?: boolean
    }>
    agrochemicals?: Agrochemical[]
  }
  
  export interface TimelineCalendarProps {
    data: TimelineEntry[]
    onAddEntry: (entry: TimelineEntry) => void
    onDeleteEntry: (id: string) => void
    onEditEntry: (entry: TimelineEntry) => void
    isOffline: boolean
  }
  
  export interface ModernTimelineProps {
    data: TimelineEntry[]
    onAddEntry: (entry: TimelineEntry) => void
    onDeleteEntry: (id: string) => void
    onEditEntry: (entry: TimelineEntry) => void
    isOffline: boolean
  }
  
  