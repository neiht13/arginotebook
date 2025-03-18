export interface Season {
    _id: string
    muavu: string
    nam: string
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
  
  