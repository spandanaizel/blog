import { describe, it, expect, beforeEach } from 'vitest';
import { useNotificationStore } from '@/store/notificationStore';
import type { AppNotification } from '@/types';

function makeNotification(overrides: Partial<AppNotification> = {}): AppNotification {
  return {
    _id: 'n1',
    recipient: 'u1',
    sender: { _id: 'u2', name: 'Bob', username: 'bob', avatar: '' },
    type: 'like',
    message: 'Bob liked your post',
    isRead: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('useNotificationStore', () => {
  beforeEach(() => {
    useNotificationStore.setState({ notifications: [], unreadCount: 0, hasLoadedInitial: false });
  });

  it('setNotifications computes unread count from the list when not provided', () => {
    useNotificationStore.getState().setNotifications([
      makeNotification({ _id: 'a', isRead: false }),
      makeNotification({ _id: 'b', isRead: true }),
    ]);
    expect(useNotificationStore.getState().unreadCount).toBe(1);
    expect(useNotificationStore.getState().hasLoadedInitial).toBe(true);
  });

  it('setNotifications uses an explicit unread count override when given', () => {
    useNotificationStore.getState().setNotifications([makeNotification({ isRead: false })], 7);
    expect(useNotificationStore.getState().unreadCount).toBe(7);
  });

  it('addNotification prepends and increments unread count', () => {
    useNotificationStore.getState().setNotifications([makeNotification({ _id: 'old' })], 0);
    useNotificationStore.getState().addNotification(makeNotification({ _id: 'new' }));

    const state = useNotificationStore.getState();
    expect(state.notifications[0]._id).toBe('new');
    expect(state.unreadCount).toBe(1);
  });

  it('markRead marks a single notification read and decrements unread count', () => {
    useNotificationStore.getState().setNotifications(
      [makeNotification({ _id: 'a', isRead: false }), makeNotification({ _id: 'b', isRead: false })],
      2
    );
    useNotificationStore.getState().markRead('a');

    const state = useNotificationStore.getState();
    expect(state.notifications.find((n) => n._id === 'a')?.isRead).toBe(true);
    expect(state.unreadCount).toBe(1);
  });

  it('markRead is a no-op for an already-read notification', () => {
    useNotificationStore.getState().setNotifications([makeNotification({ _id: 'a', isRead: true })], 0);
    useNotificationStore.getState().markRead('a');
    expect(useNotificationStore.getState().unreadCount).toBe(0);
  });

  it('markAllRead clears unread count and marks every notification read', () => {
    useNotificationStore.getState().setNotifications(
      [makeNotification({ _id: 'a' }), makeNotification({ _id: 'b' })],
      2
    );
    useNotificationStore.getState().markAllRead();

    const state = useNotificationStore.getState();
    expect(state.unreadCount).toBe(0);
    expect(state.notifications.every((n) => n.isRead)).toBe(true);
  });

  it('appendNotifications adds to the end without affecting unread count', () => {
    useNotificationStore.getState().setNotifications([makeNotification({ _id: 'a' })], 1);
    useNotificationStore.getState().appendNotifications([makeNotification({ _id: 'b' })]);

    const state = useNotificationStore.getState();
    expect(state.notifications.map((n) => n._id)).toEqual(['a', 'b']);
    expect(state.unreadCount).toBe(1);
  });
});
