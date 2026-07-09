import { useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { useImageUpload } from '@/hooks/useImageUpload';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ content, onChange, placeholder, className }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading, progress } = useImageUpload();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: { HTMLAttributes: { class: 'rounded-md bg-secondary p-3 text-sm' } } }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ HTMLAttributes: { class: 'rounded-md' } }),
      Placeholder.configure({ placeholder: placeholder || 'Start writing your story…' }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-slate dark:prose-invert max-w-none focus:outline-none min-h-[320px] px-4 py-3',
      },
    },
  });

  if (!editor) return null;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !editor) return;

    // Upload first, then insert — avoids embedding bulky base64 data directly
    // in the post's saved HTML, and keeps the editor in sync with what's
    // actually stored (a real Cloudinary URL, or the graceful local fallback).
    const result = await upload(file, 'editor');
    if (result) {
      editor.chain().focus().setImage({ src: result.url, alt: file.name }).run();
    }
  }

  return (
    <div className={cn('overflow-hidden rounded-lg border border-input', className)}>
      <EditorToolbar
        editor={editor}
        onInsertImage={() => fileInputRef.current?.click()}
        isUploadingImage={isUploading}
        uploadProgress={progress}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
      <EditorContent editor={editor} className="bg-background" />
    </div>
  );
}
