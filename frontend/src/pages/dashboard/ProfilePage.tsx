import { Link } from 'react-router-dom';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, Heart, FileText, Bookmark as BookmarkIcon, Upload, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/shared/FormField';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ActivityFeedList } from '@/components/dashboard/ActivityFeedList';
import { AsyncErrorBoundary } from '@/components/shared/AsyncErrorBoundary';
import { useAuthStore } from '@/store/authStore';
import { useUpdateProfile } from '@/hooks/useUsers';
import { useDashboardAnalytics } from '@/hooks/useAnalytics';
import { useImageUpload } from '@/hooks/useImageUpload';

const profileSchema = z.object({
  name: z.string().min(2).max(80),
  avatar: z.string().optional(),
  bio: z.string().max(280).optional(),
  website: z.string().optional(),
  twitter: z.string().optional(),
  github: z.string().optional(),
  linkedin: z.string().optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();
  const { data: stats, isLoading: statsLoading } = useDashboardAnalytics();
  const { upload, isUploading, progress } = useImageUpload();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name,
      avatar: user?.avatar,
      bio: user?.bio,
      website: user?.socialLinks?.website,
      twitter: user?.socialLinks?.twitter,
      github: user?.socialLinks?.github,
      linkedin: user?.socialLinks?.linkedin,
    },
  });

  const avatarPreview = watch('avatar');

  async function handleAvatarFile(file: File) {
    const result = await upload(file, 'avatar');
    if (result) {
      setValue('avatar', result.url, { shouldDirty: true });
    }
  }

  function onSubmit(data: ProfileForm) {
    updateProfile.mutate({
      name: data.name,
      avatar: data.avatar,
      bio: data.bio,
      socialLinks: { website: data.website, twitter: data.twitter, github: data.github, linkedin: data.linkedin },
    });
  }

  if (!user) return null;

  const statCards = [
    { label: 'Posts', value: stats?.postsCount, icon: FileText, to: undefined },
    { label: 'Followers', value: user.followersCount, icon: undefined, to: `/authors/${user.username}/followers` },
    { label: 'Following', value: user.followingCount, icon: undefined, to: `/authors/${user.username}/following` },
    { label: 'Total views', value: stats?.totalViews, icon: Eye, to: undefined },
    { label: 'Total likes', value: stats?.totalLikes, icon: Heart, to: undefined },
  ];

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="text-muted-foreground">This is how others will see you on Inkwell.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {statCards.map(({ label, value, icon: Icon, to }) => {
          const content = (
            <Card className="h-full">
              <CardContent className="flex flex-col gap-1 p-4">
                {Icon && <Icon className="h-4 w-4 text-primary" />}
                {statsLoading && value === undefined ? (
                  <Skeleton className="h-6 w-10" />
                ) : (
                  <span className="text-xl font-bold">{value ?? 0}</span>
                )}
                <span className="text-xs text-muted-foreground">{label}</span>
              </CardContent>
            </Card>
          );
          return to ? (
            <Link key={label} to={to}>
              {content}
            </Link>
          ) : (
            <div key={label}>{content}</div>
          );
        })}
      </div>

      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to="/dashboard/bookmarks">
            <BookmarkIcon className="h-3.5 w-3.5" /> View bookmarks
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="edit" className="mt-8">
        <TabsList>
          <TabsTrigger value="edit">Edit profile</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <Card>
            <CardContent className="p-6">
              <div className="mb-6 flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={avatarPreview || user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => !isUploading && avatarInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading… {progress}%
                      </>
                    ) : (
                      <>
                        <Upload className="h-3.5 w-3.5" /> Upload new photo
                      </>
                    )}
                  </Button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAvatarFile(file);
                      e.target.value = '';
                    }}
                  />
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <FormField label="Full name" htmlFor="name" error={errors.name?.message}>
                  <Input id="name" {...register('name')} />
                </FormField>

                <FormField label="Avatar URL" htmlFor="avatar" error={errors.avatar?.message}>
                  <Input id="avatar" placeholder="https://example.com/avatar.jpg" {...register('avatar')} />
                </FormField>

                <FormField label="Bio" htmlFor="bio" error={errors.bio?.message}>
                  <Textarea id="bio" maxLength={280} placeholder="Tell readers a bit about yourself" {...register('bio')} />
                </FormField>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField label="Website" htmlFor="website">
                    <Input id="website" placeholder="https://" {...register('website')} />
                  </FormField>
                  <FormField label="Twitter" htmlFor="twitter">
                    <Input id="twitter" placeholder="https://twitter.com/you" {...register('twitter')} />
                  </FormField>
                  <FormField label="GitHub" htmlFor="github">
                    <Input id="github" placeholder="https://github.com/you" {...register('github')} />
                  </FormField>
                  <FormField label="LinkedIn" htmlFor="linkedin">
                    <Input id="linkedin" placeholder="https://linkedin.com/in/you" {...register('linkedin')} />
                  </FormField>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? 'Saving…' : 'Save changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <AsyncErrorBoundary title="Couldn't load your activity">
            <ActivityFeedList />
          </AsyncErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  );
}
