export interface Season {
  _id: string
  tenmuavu: string // Thay đổi từ muavu sang tenmuavu
  nam: string
  ngaybatdau?: string
  ngayketthuc?: string
  phuongphap?: string
  giong?: string
  dientich?: number
  soluong?: number
  giagiong?: number
  ghichu?: string
  uId: string
  xId?: string
  createdAt?: string
  updatedAt?: string
}

export interface Stage {
  _id: string
  tengiaidoan: string
  color: string
  icon?: string
  uId: string
  xId?: string
  createdAt?: string
  updatedAt?: string
}

export interface Task {
  _id: string
  tenCongViec: string
  giaidoanId: string
  icon?: string
  uId: string
  xId?: string
  createdAt?: string
  updatedAt?: string
}

