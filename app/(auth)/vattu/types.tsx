export interface VatTu {
    _id?: string
    ten: string
    loai: "thuốc" | "phân" | "khác"
    huuCo: boolean
    soLuong: number
    donViTinh: string
    donGia: number
    nhaCungCap?: string
    ngayMua?: string
    hanSuDung?: string
    ghiChu?: string
    uId?: string
    xId?: string
  }
  
  export type VatTuFormData = Omit<VatTu, "_id" | "uId" | "xId"> & { _id?: string }
  
  