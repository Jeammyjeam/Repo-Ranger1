import type { Repository } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CalendarClock, CalendarPlus, Database, Eye, GitFork, Scale, Star } from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import { TimeAgo } from './time-ago';

function Stat({ icon: Icon, label, value, children }: { icon: React.ElementType, label: string, value?: string | number, children?: React.ReactNode }) {
  if ((value === undefined || value === null) && !children) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
      <div>
        <div className="text-sm font-medium">{children || value}</div>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function RepoStats({ repo }: { repo: Repository }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Repository Stats</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-y-4 gap-x-2">
        <Stat icon={Star} label="Stars" value={repo.stargazers_count.toLocaleString()} />
        <Stat icon={GitFork} label="Forks" value={repo.forks_count.toLocaleString()} />
        <Stat icon={Eye} label="Watchers" value={repo.subscribers_count?.toLocaleString()} />
        <Stat icon={AlertTriangle} label="Open Issues" value={repo.open_issues_count.toLocaleString()} />
        <Stat icon={Database} label="Size" value={repo.size ? formatBytes(repo.size * 1024) : 'N/A'} />
        <Stat icon={Scale} label="License" value={repo.license?.name || 'Not specified'} />
        <Stat icon={CalendarPlus} label="Created">
            {repo.created_at ? <TimeAgo dateString={repo.created_at} /> : 'N/A'}
        </Stat>
        <Stat icon={CalendarClock} label="Updated">
            {repo.updated_at ? <TimeAgo dateString={repo.updated_at} /> : 'N/A'}
        </Stat>
      </CardContent>
    </Card>
  );
}
