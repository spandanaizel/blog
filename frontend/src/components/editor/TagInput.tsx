import { useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function TagInput({
  tags,
  onChange,
  max = 10,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  max?: number;
}) {
  const [value, setValue] = useState('');

  function addTag() {
    const cleaned = value.trim().toLowerCase().replace(/\s+/g, '-');
    if (!cleaned || tags.includes(cleaned) || tags.length >= max) {
      setValue('');
      return;
    }
    onChange([...tags, cleaned]);
    setValue('');
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium"
          >
            #{tag}
            <button onClick={() => onChange(tags.filter((t) => t !== tag))} aria-label={`Remove ${tag}`}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      {tags.length < max && (
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              addTag();
            }
          }}
          onBlur={addTag}
          placeholder="Add a tag and press Enter"
          className="mt-2"
        />
      )}
    </div>
  );
}
