import { useEffect, useMemo, useState } from 'react';
import { FilterPanel } from '@/components/FilterPanel';
import { SourceCard } from '@/components/SourceCard';
import { StatsPanel } from '@/components/StatsPanel';
import type { Source } from '@/types';
import { seedSources } from '@/data/sources';
import { clearDraftSources, downloadJson, loadDraftSources, saveDraftSources, uniqueTagsFromSources, readJsonFile } from '@/lib/draftSources';
import type { FilterState } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  BookOpen, 
  GraduationCap, 
  X,
  ExternalLink,
  ArrowUpDown
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

type SortOption = 'relevance' | 'date-newest' | 'date-oldest' | 'author';

function App() {
  const emptyFilters = (): FilterState => ({ search: '', categories: [], tags: [], sections: [] });
  const [filters, setFilters] = useState<FilterState>(emptyFilters());
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [viewMode, setViewMode] = useState<'official' | 'draft'>('official');

  // Reset filters when switching between Official/Draft so the page never boots into a confusing filtered state.
  useEffect(() => {
    setFilters(emptyFilters());
  }, [viewMode]);
  const [officialSources, setOfficialSources] = useState<Source[]>([]);
  const [draftSources, setDraftSources] = useState<Source[]>(() => loadDraftSources());

  const activeSources = viewMode === 'official' ? officialSources : draftSources;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('./sources.json', { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error('sources.json must be an array');
        if (!cancelled) setOfficialSources(data as Source[]);
      } catch {
        if (!cancelled) setOfficialSources(seedSources);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    saveDraftSources(draftSources);
  }, [draftSources]);

  const availableTags = useMemo(() => uniqueTagsFromSources(activeSources), [activeSources]);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formCategory, setFormCategory] = useState<Source['category']>('official');
  const [formTags, setFormTags] = useState('');
  const [formSections, setFormSections] = useState<Source['sections']>(['1.0']);
  const [formKeyInsight, setFormKeyInsight] = useState('');
  const [formCitation, setFormCitation] = useState('');
  const [formDescription, setFormDescription] = useState('');

  function resetEditor() {
    setEditingId(null);
    setFormTitle('');
    setFormAuthor('');
    setFormDate('');
    setFormUrl('');
    setFormCategory('official');
    setFormTags('');
    setFormSections(['1.0']);
    setFormKeyInsight('');
    setFormCitation('');
    setFormDescription('');
  }

  function openAdd() {
    resetEditor();
    setEditorOpen(true);
  }

  function openEdit(source: Source) {
    setEditingId(source.id);
    setFormTitle(source.title || '');
    setFormAuthor(source.author || '');
    setFormDate(source.date || '');
    setFormUrl(source.url || '');
    setFormCategory(source.category);
    setFormTags((source.tags || []).join(', '));
    setFormSections(source.sections || ['1.0']);
    setFormKeyInsight(source.keyInsight || '');
    setFormCitation(source.citation || '');
    setFormDescription(source.description || '');
    setEditorOpen(true);
  }

  function upsertDraft() {
    const id = editingId || `src-${Date.now().toString(16)}`;
    const cleanedTags = formTags.split(',').map(t => t.trim()).filter(Boolean);

    const item: Source = {
      id,
      title: formTitle.trim(),
      author: formAuthor.trim() || undefined,
      date: formDate.trim() || undefined,
      url: formUrl.trim(),
      category: formCategory,
      tags: cleanedTags,
      sections: formSections,
      keyInsight: formKeyInsight.trim(),
      citation: formCitation.trim(),
      description: formDescription.trim(),
    };

    setDraftSources(prev => {
      const exists = prev.some(s => s.id === id);
      if (exists) return prev.map(s => (s.id === id ? item : s));
      return [item, ...prev];
    });
    setEditorOpen(false);
    resetEditor();
  }

  function deleteDraft(id: string) {
    if (!confirm('Delete this source from your draft list?')) return;
    setDraftSources(prev => prev.filter(s => s.id !== id));
  }

  function copyOfficialToDraft() {
    if (!officialSources.length) return;
    if (!confirm('Replace your draft list with the official shared list?')) return;
    setDraftSources(officialSources);
    setViewMode('draft');
  }

  function exportDraftForPublish() {
    downloadJson('sources.json', draftSources);
  }

  async function importDraft(file: File) {
    const parsed = await readJsonFile(file);
    if (!Array.isArray(parsed)) throw new Error('JSON must be an array of sources');
    setDraftSources(parsed as Source[]);
  }

  function resetDraft() {
    if (!confirm('Clear your local draft list? (Does NOT affect the official list)')) return;
    clearDraftSources();
    setDraftSources([]);
  }



  const filteredSources = useMemo(() => {
    let result = activeSources.filter(source => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          source.title.toLowerCase().includes(searchLower) ||
          source.description.toLowerCase().includes(searchLower) ||
          source.author?.toLowerCase().includes(searchLower) ||
          source.tags.some(tag => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.categories.length > 0) {
        if (!filters.categories.includes(source.category)) return false;
      }

      // Section filter
      if (filters.sections.length > 0) {
        const hasMatchingSection = source.sections.some(sec => 
          filters.sections.includes(sec)
        );
        if (!hasMatchingSection) return false;
      }

      // Tag filter
      if (filters.tags.length > 0) {
        const hasMatchingTag = source.tags.some(tag => 
          filters.tags.includes(tag)
        );
        if (!hasMatchingTag) return false;
      }

      return true;
    });

    // Sort results
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'date-newest':
          return (b.date || '').localeCompare(a.date || '');
        case 'date-oldest':
          return (a.date || '').localeCompare(b.date || '');
        case 'author':
          return (a.author || '').localeCompare(b.author || '');
        case 'relevance':
        default:
          // Relevance: prioritize sources matching more filter criteria
          let aScore = 0;
          let bScore = 0;
          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            if (a.title.toLowerCase().includes(searchLower)) aScore += 3;
            if (b.title.toLowerCase().includes(searchLower)) bScore += 3;
            if (a.author?.toLowerCase().includes(searchLower)) aScore += 2;
            if (b.author?.toLowerCase().includes(searchLower)) bScore += 2;
          }
          return bScore - aScore;
      }
    });

    return result;
  }, [filters, sortBy]);

  const activeFilterCount = filters.categories.length + 
    filters.tags.length + 
    filters.sections.length;

  const clearAllFilters = () => {
    setFilters({ search: '', categories: [], tags: [], sections: [] });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Discord OSA Research Hub</h1>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Resources for UK Online Safety Act & Age Verification Analysis
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <a 
                href="https://doi.org/10.21427/rj5h-9450" 
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700"
              >
                <GraduationCap className="h-4 w-4" />
                <span>Key Paper</span>
                <ExternalLink className="h-3 w-3" />
              </a>

              <div className="hidden md:flex items-center gap-2">
                <Button variant={viewMode === 'official' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('official')}>
                  Official
                </Button>
                <Button variant={viewMode === 'draft' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('draft')}>
                  Draft
                </Button>

                {viewMode === 'draft' && (
                  <>
                    <Button size="sm" onClick={openAdd}>Add</Button>
                    <Button variant="outline" size="sm" onClick={exportDraftForPublish} title="Download sources.json to commit into your repo">
                      Export sources.json
                    </Button>

                    <label className="inline-flex">
                      <input
                        type="file"
                        accept="application/json"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (!f) return
                          importDraft(f).catch((err) => alert('Import failed: ' + (err?.message || err)))
                          e.currentTarget.value = ''
                        }}
                      />
                      <Button variant="outline" size="sm" asChild>
                        <span>Import JSON</span>
                      </Button>
                    </label>

                    <Button variant="outline" size="sm" onClick={copyOfficialToDraft} title="Copy the shared list into your draft so you can edit">
                      Copy Official → Draft
                    </Button>
                    <Button variant="destructive" size="sm" onClick={resetDraft} title="Clear your local draft">
                      Clear Draft
                    </Button>
                  </>
                )}
              </div>

              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <Filter className="h-4 w-4 mr-1.5" />
                    Filters
                    {activeFilterCount > 0 && (
                      <Badge variant="secondary" className="ml-1.5 h-5 px-1.5">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <div className="p-4 border-b border-slate-200">
                    <h2 className="font-semibold text-slate-900">Filters</h2>
                  </div>
                  <ScrollArea className="h-[calc(100vh-60px)] p-4">
                    <FilterPanel filters={filters} onFilterChange={setFilters} availableTags={availableTags} />
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {viewMode === 'official' ? (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="font-semibold text-slate-900">Official sources (public)</div>
            <div className="text-sm text-slate-600">
              This list is loaded from <code className="px-1 py-0.5 bg-slate-100 rounded">public/sources.json</code>.
              Visitors can view it, but edits aren&apos;t saved to the site.
            </div>
            <div className="text-sm text-slate-600 mt-2">
              To publish updates: switch to <strong>Draft</strong>, edit, click <strong>Export sources.json</strong>, then replace <code className="px-1 py-0.5 bg-slate-100 rounded">public/sources.json</code> in your GitHub repo and commit.
            </div>
          </div>
        ) : (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <div className="font-semibold text-amber-900">Draft sources (private to this browser)</div>
            <div className="text-sm text-amber-800">
              Changes here are saved to <strong>localStorage</strong> on this device only.
              Export <code className="px-1 py-0.5 bg-amber-100 rounded">sources.json</code> to publish.
            </div>
          </div>
        )}

        <div className="flex gap-6">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter Sources
                </h2>
                <FilterPanel filters={filters} onFilterChange={setFilters} availableTags={availableTags} />
              </div>
              
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <StatsPanel sources={activeSources} />
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Search Bar & Active Filters */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Search by title, author, description, or tags..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10 h-11"
                />
              </div>
              
              {/* Active Filters */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                  <span className="text-sm text-slate-500">Active:</span>
                  {filters.categories.map(cat => (
                    <Badge 
                      key={cat} 
                      variant="secondary"
                      className="cursor-pointer hover:bg-slate-200"
                      onClick={() => setFilters({ 
                        ...filters, 
                        categories: filters.categories.filter(c => c !== cat) 
                      })}
                    >
                      {cat}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                  {filters.sections.map(sec => (
                    <Badge 
                      key={sec} 
                      variant="secondary"
                      className="cursor-pointer hover:bg-slate-200"
                      onClick={() => setFilters({ 
                        ...filters, 
                        sections: filters.sections.filter(s => s !== sec) 
                      })}
                    >
                      Section {sec}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                  {filters.tags.map(tag => (
                    <Badge 
                      key={tag} 
                      variant="secondary"
                      className="cursor-pointer hover:bg-slate-200"
                      onClick={() => setFilters({ 
                        ...filters, 
                        tags: filters.tags.filter(t => t !== tag) 
                      })}
                    >
                      {tag}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                  <button 
                    onClick={clearAllFilters}
                    className="text-sm text-red-600 hover:text-red-700 ml-2"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-900">{filteredSources.length}</span> of{' '}
                <span className="font-semibold text-slate-900">{activeSources.length}</span> sources
              </p>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs text-slate-500">Sort by:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="text-sm border border-slate-200 rounded-md px-2 py-1 bg-white font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="relevance">Relevance</option>
                  <option value="date-newest">Date (Newest)</option>
                  <option value="date-oldest">Date (Oldest)</option>
                  <option value="author">Author (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Source Grid */}
            {filteredSources.length > 0 ? (
              <div className="grid gap-4">
                {filteredSources.map((source) => (
                  <SourceCard key={source.id} source={source} mode={viewMode} onEdit={openEdit} onDelete={deleteDraft} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No sources found</h3>
                <p className="text-slate-600 mb-4">Try adjusting your filters or search terms</p>
                <Button onClick={clearAllFilters} variant="outline">
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-600">
              Built for InfoSec research on regulatory compliance and security risks
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>{activeSources.length} curated sources</span>
              <span>•</span>
              <span>APA citations included</span>
            </div>
          </div>
        </div>
      </footer>
      <Dialog open={editorOpen} onOpenChange={(open) => { setEditorOpen(open); if (!open) resetEditor(); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit draft source' : 'Add draft source'}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Title</label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Source title" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Author / Org</label>
              <Input value={formAuthor} onChange={(e) => setFormAuthor(e.target.value)} placeholder="Optional" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Date</label>
              <Input value={formDate} onChange={(e) => setFormDate(e.target.value)} placeholder="YYYY-MM-DD (optional)" />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">URL</label>
              <Input value={formUrl} onChange={(e) => setFormUrl(e.target.value)} placeholder="https://…" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Category</label>
              <select
                className="w-full h-11 rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as Source['category'])}
              >
                <option value="news">news</option>
                <option value="academic">academic</option>
                <option value="official">official</option>
                <option value="policy">policy</option>
                <option value="technical">technical</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Sections</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {(['1.0','2.0','3.0','4.0','5.0'] as const).map((sec) => {
                  const on = formSections.includes(sec)
                  return (
                    <Button
                      key={sec}
                      type="button"
                      size="sm"
                      variant={on ? 'default' : 'outline'}
                      onClick={() => {
                        setFormSections((prev) => on ? (prev.filter(s => s !== sec) as any) : ([...prev, sec] as any))
                      }}
                    >
                      {sec}
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Tags (comma-separated)</label>
              <Input value={formTags} onChange={(e) => setFormTags(e.target.value)} placeholder="e.g., age-verification, privacy, threat-modeling" />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Key insight</label>
              <Input value={formKeyInsight} onChange={(e) => setFormKeyInsight(e.target.value)} placeholder="1-line takeaway" />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Citation</label>
              <Textarea value={formCitation} onChange={(e) => setFormCitation(e.target.value)} rows={2} placeholder="Your preferred citation format" />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Description / Notes</label>
              <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={4} placeholder="Why you&apos;re using it, what it supports, quotes, etc." />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => { setEditorOpen(false); resetEditor(); }}>Cancel</Button>
            <Button
              onClick={() => {
                if (!formTitle.trim() || !formUrl.trim()) {
                  alert('Title and URL are required.')
                  return
                }
                if (!formSections.length) {
                  alert('Select at least one section.')
                  return
                }
                upsertDraft()
              }}
            >
              {editingId ? 'Save' : 'Add'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default App;