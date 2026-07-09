import { estimateReadTime, generateExcerpt } from '../../utils/postHelpers';

describe('estimateReadTime', () => {
  it('returns at least 1 minute for very short content', () => {
    expect(estimateReadTime('<p>Hi there</p>')).toBe(1);
  });

  it('strips HTML tags before counting words', () => {
    const html = '<p>' + 'word '.repeat(200) + '</p>';
    expect(estimateReadTime(html)).toBe(1); // 200 words / 200wpm = 1 min
  });

  it('scales roughly linearly with word count', () => {
    const html = '<p>' + 'word '.repeat(800) + '</p>';
    expect(estimateReadTime(html)).toBe(4); // 800 / 200 = 4
  });
});

describe('generateExcerpt', () => {
  it('strips HTML and collapses whitespace', () => {
    const html = '<h1>Title</h1>\n\n<p>Some   content   here.</p>';
    expect(generateExcerpt(html, 100)).toBe('Title Some content here.');
  });

  it('truncates long content and appends an ellipsis', () => {
    const longText = 'a'.repeat(300);
    const excerpt = generateExcerpt(`<p>${longText}</p>`, 50);
    expect(excerpt.length).toBe(51); // 50 chars + ellipsis character
    expect(excerpt.endsWith('…')).toBe(true);
  });

  it('does not truncate content shorter than the limit', () => {
    expect(generateExcerpt('<p>Short</p>', 100)).toBe('Short');
  });
});
