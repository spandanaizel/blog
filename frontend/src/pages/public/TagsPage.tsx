import { Hash } from 'lucide-react';
import { TagPill } from '@/components/blog/TagPill';

// Until a dedicated /api/tags endpoint exists, we surface a curated set of
// popular tags; clicking any of them runs a live filtered post query.
const ALL_TAGS = [
  'javascript', 'typescript', 'react', 'nodejs', 'python', 'ai', 'machine-learning',
  'webdev', 'career', 'productivity', 'design', 'css', 'devops', 'opensource',
  'startups', 'writing', 'cloud', 'database', 'security', 'mobile',
];

export default function TagsPage() {
  return (
    <div className="container py-10">
      <div className="mb-8 flex items-center gap-2">
        <Hash className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Browse by tag</h1>
      </div>
      <div className="flex flex-wrap gap-3">
        {ALL_TAGS.map((tag) => (
          <TagPill key={tag} tag={tag} className="px-4 py-2 text-sm" />
        ))}
      </div>
    </div>
  );
}
