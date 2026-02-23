import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Source } from '@/types';
import { categories } from '@/data/sources';
import { ExternalLink, Quote, Lightbulb, FileText, Calendar, User } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface SourceCardProps {
  source: Source;
  mode?: 'official' | 'draft';
  onEdit?: (source: Source) => void;
  onDelete?: (id: string) => void;
}

export function SourceCard({ source, mode = 'official', onEdit, onDelete }: SourceCardProps) {
  const category = categories.find(c => c.value === source.category);
  const categoryColor = category?.color || 'bg-gray-500';
  const categoryLabel = category?.label || source.category;

  const sectionColors: Record<string, string> = {
    '1.0': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    '2.0': 'bg-blue-100 text-blue-700 border-blue-200',
    '3.0': 'bg-amber-100 text-amber-700 border-amber-200',
    '4.0': 'bg-purple-100 text-purple-700 border-purple-200',
    '5.0': 'bg-rose-100 text-rose-700 border-rose-200'
  };

  return (
    <Card className="hover:shadow-lg transition-shadow border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2.5 h-2.5 rounded-full ${categoryColor}`} />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                {categoryLabel}
              </span>
            </div>
            <h3 className="font-semibold text-slate-900 leading-tight">
              {source.title}
            </h3>
          </div>
          {mode === 'draft' && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit?.(source)}>
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => onDelete?.(source.id)}>
                Delete
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-600">
          {source.author && (
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {source.author}
            </span>
          )}
          {source.date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {source.date}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Sections */}
        <div className="flex flex-wrap gap-1.5">
          {source.sections.map((sec) => (
            <Badge 
              key={sec} 
              variant="outline" 
              className={`text-xs font-medium ${sectionColors[sec]}`}
            >
              Section {sec}
            </Badge>
          ))}
        </div>

        {/* Key Insight */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-indigo-900 leading-relaxed">
              {source.keyInsight}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 leading-relaxed">
          {source.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {source.tags.slice(0, 6).map((tag) => (
            <span 
              key={tag}
              className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full"
            >
              {tag}
            </span>
          ))}
          {source.tags.length > 6 && (
            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
              +{source.tags.length - 6} more
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => window.open(source.url, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-1.5" />
            Open Source
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary" size="sm" className="flex-1">
                <Quote className="h-4 w-4 mr-1.5" />
                Citation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  APA Citation
                </DialogTitle>
              </DialogHeader>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-800 leading-relaxed font-mono">
                  {source.citation}
                </p>
              </div>
              <Button 
                onClick={() => navigator.clipboard.writeText(source.citation)}
                className="w-full"
              >
                Copy to Clipboard
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
