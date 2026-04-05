// 产品数据结构
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

// 报价单项数据结构
export interface QuoteItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

// 报价单数据结构
export interface Quote {
  id: string;
  name: string;
  items: QuoteItem[];
  totalPrice: number;
  createdAt: Date;
}

// 分享链接数据结构
export interface ShareLink {
  id: string;
  quoteId: string;
  expiresAt: Date;
  isViewed: boolean;
}