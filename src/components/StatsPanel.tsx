import { Card, CardContent } from '@/components/ui/card';
import { sections } from '@/data/sources';
import type { Source } from '@/types';
import { BookOpen, FileText, Lightbulb, CheckCircle, AlertTriangle } from 'lucide-react';

export function StatsPanel({ sources }: { sources: Source[] }) {
  const academicCount = sources.filter(s => s.category === 'academic').length;
  const officialCount = sources.filter(s => s.category === 'official').length;
  const newsCount = sources.filter(s => s.category === 'news').length;
  const policyCount = sources.filter(s => s.category === 'policy').length;
  const technicalCount = sources.filter(s => s.category === 'technical').length;

  // Count sources per section
  const sectionCounts = sections.map(sec => ({
    ...sec,
    count: sources.filter(s => s.sections.includes(sec.value as any)).length
  }));

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-900">{sources.length}</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">Total Sources</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-600" />
              <span className="text-2xl font-bold text-red-900">{academicCount}</span>
            </div>
            <p className="text-sm text-red-700 mt-1">Academic Papers</p>
          </CardContent>
        </Card>
      </div>

      {/* Source Breakdown */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-slate-700">Source Breakdown</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Official
            </span>
            <span className="font-medium text-slate-700">{officialCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              News & Media
            </span>
            <span className="font-medium text-slate-700">{newsCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              Policy & Legal
            </span>
            <span className="font-medium text-slate-700">{policyCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Technical
            </span>
            <span className="font-medium text-slate-700">{technicalCount}</span>
          </div>
        </div>
      </div>

      {/* Section Coverage */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-slate-700">Section Coverage</h4>
        <div className="space-y-2">
          {sectionCounts.map((sec) => (
            <div key={sec.value} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{sec.label}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${(sec.count / sources.length) * 100}%` }}
                  />
                </div>
                <span className="font-medium text-slate-700 w-6 text-right">{sec.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Arguments */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-amber-900 mb-2">Key Arguments to Emphasize</h4>
            <ul className="space-y-1.5 text-sm text-amber-800">
              <li className="flex items-start gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span><strong>Compliance Theater:</strong> Discord implemented invasive collection after proving they couldn't secure data</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span><strong>Regulatory Mission Creep:</strong> UK law became global policy affecting billions</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span><strong>Vendor Risk Multiplication:</strong> Each compliance requirement adds new attack surfaces</span>
              </li>
              <li className="flex items-start gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span><strong>Ineffectiveness + Harm:</strong> Age verification doesn't work AND causes privacy harm</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
