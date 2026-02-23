export interface Source {
  id: string;
  title: string;
  author?: string;
  date?: string;
  url: string;
  category: 'news' | 'academic' | 'official' | 'policy' | 'technical';
  tags: string[];
  sections: ('1.0' | '2.0' | '3.0' | '4.0' | '5.0')[];
  keyInsight: string;
  citation: string;
  description: string;
}

export interface FilterState {
  search: string;
  categories: string[];
  tags: string[];
  sections: string[];
}
