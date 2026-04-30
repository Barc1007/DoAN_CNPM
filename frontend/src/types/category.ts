export interface Category {
  category_id: number;     
  name: string;            
  type: 'expense' | 'income'; 
  icon?: string;           
  color?: string;         
}

export interface CategoryStat extends Category {
  transaction_count: number;
  total_amount: number;      
  percentage: number;        
}

export interface CategoryData {
  summary: {
    total_amount: number;
    total_transactions: number;
    total_categories: number;
    average_per_category: number;
    top_category_name: string;
  };
  categories: CategoryStat[];
}