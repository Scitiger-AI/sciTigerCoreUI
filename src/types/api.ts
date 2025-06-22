// API响应基础接口
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  results?: T;
  errors?: any;
}

// 分页数据接口
export interface PaginatedData<T> {
  count?: number;
  next?: string | null;
  previous?: string | null;
  total: number;
  page_size: number;
  current_page: number;
  total_pages: number;
  results: T[];
  links?: {
    next: string | null;
    previous: string | null;
  };
}
