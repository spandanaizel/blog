import { registerSchema, loginSchema } from '../../utils/validators/authValidators';
import { createPostSchema } from '../../utils/validators/postValidators';
import { changePasswordSchema, updateProfileSchema } from '../../utils/validators/userValidators';

describe('registerSchema', () => {
  it('accepts a valid registration payload', () => {
    const result = registerSchema.safeParse({
      name: 'Ada Lovelace',
      username: 'ada_lovelace',
      email: 'ada@example.com',
      password: 'supersecret123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a username with invalid characters', () => {
    const result = registerSchema.safeParse({
      name: 'Ada',
      username: 'ada lovelace!',
      email: 'ada@example.com',
      password: 'supersecret123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a password shorter than 8 characters', () => {
    const result = registerSchema.safeParse({
      name: 'Ada',
      username: 'ada',
      email: 'ada@example.com',
      password: 'short',
    });
    expect(result.success).toBe(false);
  });

  it('lowercases the username', () => {
    const result = registerSchema.safeParse({
      name: 'Ada',
      username: 'AdaLovelace',
      email: 'ada@example.com',
      password: 'supersecret123',
    });
    expect(result.success && result.data.username).toBe('adalovelace');
  });
});

describe('loginSchema', () => {
  it('rejects an invalid email', () => {
    expect(loginSchema.safeParse({ email: 'not-an-email', password: 'x' }).success).toBe(false);
  });

  it('rejects an empty password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: '' }).success).toBe(false);
  });
});

describe('createPostSchema', () => {
  it('accepts a minimal valid post', () => {
    const result = createPostSchema.safeParse({ title: 'Hello World', content: 'A long enough piece of content.' });
    expect(result.success).toBe(true);
  });

  it('rejects content shorter than 10 characters', () => {
    const result = createPostSchema.safeParse({ title: 'Hi', content: 'short' });
    expect(result.success).toBe(false);
  });

  it('rejects more than 10 tags', () => {
    const result = createPostSchema.safeParse({
      title: 'Hello World',
      content: 'A long enough piece of content.',
      tags: Array.from({ length: 11 }, (_, i) => `tag${i}`),
    });
    expect(result.success).toBe(false);
  });
});

describe('changePasswordSchema', () => {
  it('requires both current and new password', () => {
    expect(changePasswordSchema.safeParse({ currentPassword: 'old', newPassword: 'newpassword123' }).success).toBe(true);
    expect(changePasswordSchema.safeParse({ newPassword: 'newpassword123' }).success).toBe(false);
  });
});

describe('updateProfileSchema', () => {
  it('allows a partial update with only social links', () => {
    const result = updateProfileSchema.safeParse({ socialLinks: { github: 'https://github.com/me' } });
    expect(result.success).toBe(true);
  });
});
