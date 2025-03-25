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
  lichSuSuDung?: Array<{
    ngay: string
    soLuong: number
    ghiChu?: string
  }>
  viTriLuuTru?: string
  thanhPhan?: string
  huongDanSuDung?: string
}

export type VatTuFormData = Omit<VatTu, "_id" | "uId" | "xId"> & { _id?: string }

export interface Pagination {
  currentPage: number
  itemsPerPage: number
  totalItems: number
}

