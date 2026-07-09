import { Link } from 'react-router-dom';
import { Code2, Cpu, Globe, Briefcase, Heart, Layers } from 'lucide-react';

const CATEGORIES = [
  { name: 'Technology', slug: 'technology', icon: Cpu, description: 'Tools, trends, and the future of tech' },
  { name: 'Programming', slug: 'programming', icon: Code2, description: 'Languages, frameworks, and code craft' },
  { name: 'AI', slug: 'ai', icon: Layers, description: 'Machine learning and artificial intelligence' },
  { name: 'Web Development', slug: 'web-development', icon: Globe, description: 'Frontend, backend, and everything between' },
  { name: 'Career', slug: 'career', icon: Briefcase, description: 'Growth, job search, and workplace stories' },
  { name: 'Lifestyle', slug: 'lifestyle', icon: Heart, description: 'Balance, habits, and life outside the screen' },
];

export default function CategoriesPage() {
  return (
    <div className="container py-10">
      <h1 className="mb-8 text-3xl font-bold">Browse by category</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map(({ name, slug, icon: Icon, description }) => (
          <Link
            key={slug}
            to={`/categories/${slug}`}
            className="group rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-semibold group-hover:text-primary">{name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
