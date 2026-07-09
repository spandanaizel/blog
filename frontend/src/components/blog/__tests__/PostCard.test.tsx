import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';
import { PostCard } from '@/components/blog/PostCard';
import type { Post } from '@/types';

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    _id: 'p1',
    title: 'Understanding React Server Components',
    slug: 'understanding-react-server-components',
    excerpt: 'A deep dive into how RSCs change the rendering model.',
    coverImage: '',
    tags: ['react'],
    category: 'web-development',
    author: { _id: 'u1', name: 'Grace Hopper', username: 'grace', avatar: '' },
    readTime: 6,
    views: 120,
    likesCount: 4,
    commentsCount: 2,
    bookmarks: [],
    status: 'published',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('PostCard', () => {
  it('renders the title, author, and stats', () => {
    renderWithProviders(<PostCard post={makePost()} />);

    expect(screen.getByText('Understanding React Server Components')).toBeInTheDocument();
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByText('6 min read')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('links to the post detail page', () => {
    renderWithProviders(<PostCard post={makePost()} />);
    const links = screen.getAllByRole('link');
    expect(links.some((a) => a.getAttribute('href') === '/blog/understanding-react-server-components')).toBe(true);
  });

  it('falls back to a letter placeholder when there is no cover image', () => {
    renderWithProviders(<PostCard post={makePost({ coverImage: '' })} />);
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('falls back to likes.length when likesCount is absent', () => {
    const post = makePost({ likesCount: undefined, likes: ['a', 'b', 'c'] });
    renderWithProviders(<PostCard post={post} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
