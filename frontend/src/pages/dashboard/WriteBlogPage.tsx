import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Eye, Pencil, Save, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CoverImagePicker } from '@/components/editor/CoverImagePicker';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { TagInput } from '@/components/editor/TagInput';
import { usePost, useCreatePost, useUpdatePost } from '@/hooks/usePosts';

const CATEGORIES = ['technology', 'programming', 'ai', 'web-development', 'career', 'lifestyle'];
const DRAFT_KEY = 'inkwell-draft-autosave';

interface DraftState {
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  coverImagePublicId: string | null;
  tags: string[];
  category: string;
}

const emptyDraft: DraftState = {
  title: '',
  content: '',
  excerpt: '',
  coverImage: '',
  coverImagePublicId: null,
  tags: [],
  category: 'technology',
};

export default function WriteBlogPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // present when editing an existing post by its slug/id route
  const isEditing = Boolean(id);

  const { data } = usePost(isEditing ? id : undefined);
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  const [draft, setDraft] = useState<DraftState>(emptyDraft);
  const [preview, setPreview] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout>>();

  // Load an existing post into the form when editing
  useEffect(() => {
    if (data?.post) {
      const p = data.post;
      setDraft({
        title: p.title,
        content: p.content || '',
        excerpt: p.excerpt,
        coverImage: p.coverImage,
        coverImagePublicId: null,
        tags: p.tags,
        category: p.category,
      });
    }
  }, [data]);

  // Restore local autosave for a brand-new post
  useEffect(() => {
    if (!isEditing) {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        try {
          setDraft(JSON.parse(saved));
        } catch {
          /* ignore corrupted draft */
        }
      }
    }
  }, [isEditing]);

  // Debounced local autosave
  useEffect(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      if (draft.title || draft.content) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        setLastSaved(new Date());
      }
    }, 1500);
    return () => clearTimeout(autosaveTimer.current);
  }, [draft]);

  function update<K extends keyof DraftState>(key: K, value: DraftState[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function persist(status: 'draft' | 'published') {
    const payload = { ...draft, status };
    if (isEditing && data?.post) {
      updatePost.mutate(
        { id: data.post._id, payload },
        {
          onSuccess: (post) => {
            localStorage.removeItem(DRAFT_KEY);
            navigate(status === 'published' ? `/blog/${post.slug}` : '/dashboard/drafts');
          },
        }
      );
    } else {
      createPost.mutate(payload, {
        onSuccess: (post) => {
          localStorage.removeItem(DRAFT_KEY);
          navigate(status === 'published' ? `/blog/${post.slug}` : '/dashboard/drafts');
        },
      });
    }
  }

  const isSaving = createPost.isPending || updatePost.isPending;
  const canPublish = draft.title.trim().length > 2 && draft.content.trim().length > 20;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{isEditing ? 'Edit post' : 'Write a new post'}</h1>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="hidden text-xs text-muted-foreground sm:inline">
              Draft saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={() => setPreview((p) => !p)}>
            {preview ? <Pencil className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {preview ? 'Edit' : 'Preview'}
          </Button>
        </div>
      </div>

      {preview ? (
        <article className="rounded-lg border border-border bg-card p-6">
          {draft.coverImage && (
            <img src={draft.coverImage} alt="Cover" loading="lazy" className="mb-6 aspect-[16/7] w-full rounded-lg object-cover" />
          )}
          <h1 className="text-3xl font-extrabold">{draft.title || 'Untitled post'}</h1>
          <div
            className="prose prose-slate mt-6 max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: draft.content || '<p class="text-muted-foreground">Nothing to preview yet.</p>' }}
          />
        </article>
      ) : (
        <div className="space-y-6">
          <CoverImagePicker
            value={draft.coverImage}
            onChange={(url, publicId) => {
              setDraft((d) => ({ ...d, coverImage: url, coverImagePublicId: publicId }));
            }}
          />

          <Input
            value={draft.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Your post title"
            className="h-14 border-none px-0 text-3xl font-bold shadow-none focus-visible:ring-0"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Category</label>
              <Select value={draft.category} onValueChange={(v) => update('category', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c.replace(/-/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Tags</label>
              <TagInput tags={draft.tags} onChange={(tags) => update('tags', tags)} />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Excerpt (optional)</label>
            <Input
              value={draft.excerpt}
              onChange={(e) => update('excerpt', e.target.value)}
              placeholder="A short summary shown on listing pages…"
              maxLength={300}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Content</label>
            <RichTextEditor content={draft.content} onChange={(html) => update('content', html)} />
          </div>
        </div>
      )}

      <div className="mt-8 flex items-center justify-end gap-3 border-t border-border pt-6">
        <Button variant="outline" onClick={() => persist('draft')} disabled={isSaving || !draft.title}>
          <Save className="h-4 w-4" /> Save draft
        </Button>
        <Button onClick={() => persist('published')} disabled={isSaving || !canPublish}>
          <Send className="h-4 w-4" /> {isEditing && data?.post.status === 'published' ? 'Update' : 'Publish'}
        </Button>
      </div>
    </div>
  );
}
