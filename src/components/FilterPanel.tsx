import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { categories, sections } from '@/data/sources';
import type { FilterState } from '@/types';
import { Search, X } from 'lucide-react';

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availableTags: string[];
}

export function FilterPanel({ filters, onFilterChange, availableTags }: FilterPanelProps) {
  const toggleArrayFilter = (key: keyof FilterState, value: string) => {
    const current = filters[key] as string[];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onFilterChange({ ...filters, [key]: updated });
  };

  const clearFilters = () => {
    onFilterChange({ search: '', categories: [], tags: [], sections: [] });
  };

  const hasActiveFilters = filters.categories.length > 0 || 
    filters.tags.length > 0 || 
    filters.sections.length > 0 ||
    filters.search.length > 0;

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search sources..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="pl-9"
          />
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors"
        >
          <X className="h-4 w-4" />
          Clear all filters
        </button>
      )}

      {/* Categories */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-700">Source Type</Label>
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.value} className="flex items-center space-x-2">
              <Checkbox
                id={`cat-${cat.value}`}
                checked={filters.categories.includes(cat.value)}
                onCheckedChange={() => toggleArrayFilter('categories', cat.value)}
              />
              <Label
                htmlFor={`cat-${cat.value}`}
                className="text-sm cursor-pointer flex items-center gap-2"
              >
                <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                {cat.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-700">Assignment Section</Label>
        <div className="space-y-2">
          {sections.map((sec) => (
            <div key={sec.value} className="flex items-start space-x-2">
              <Checkbox
                id={`sec-${sec.value}`}
                checked={filters.sections.includes(sec.value)}
                onCheckedChange={() => toggleArrayFilter('sections', sec.value)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <Label
                  htmlFor={`sec-${sec.value}`}
                  className="text-sm cursor-pointer font-medium"
                >
                  {sec.label}
                </Label>
                <p className="text-xs text-slate-500 leading-tight">{sec.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-700">Topics & Tags</Label>
        <ScrollArea className="h-64">
          <div className="flex flex-wrap gap-1.5 pr-4">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleArrayFilter('tags', tag)}
                className={`text-xs px-2 py-1 rounded-full transition-all ${
                  filters.tags.includes(tag)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
