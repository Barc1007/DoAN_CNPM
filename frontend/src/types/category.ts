export type CategoryType = 'expense' | 'income';

export interface Category {
  category_id: number;     
  name: string;            
  type: CategoryType; 
  icon?: string;           
  color?: string;         
}

export interface CategoryStat extends Category {
  transaction_count: number;
  total_amount: number;
  percentage: number;
  budget_limit?: number;
  alert?: number;
}

export interface CategoryData {
  summary: {
    total_amount: number;
    total_transactions: number;
    total_categories: number;
    average_per_category: number;
    top_category_name: string;
    budget?: {
      total_budget: number;
      total_remaining: number;
      budgeted_categories: number;
      over_budget_categories: number;
      near_limit_categories: number;
    };
  };
  categories: CategoryStat[];
}
