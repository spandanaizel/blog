import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { resetPasswordFormSchema, type ResetPasswordFormValues } from '@/utils/validators/authSchemas';
import { useResetPassword } from '@/hooks/useAuth';
import { FormField } from '@/components/shared/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const resetPassword = useResetPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordFormSchema) });

  if (!token) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-7 w-7 text-destructive" />
        </div>
        <h1 className="mt-4 text-xl font-bold">Invalid reset link</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This password reset link is missing or malformed. Request a new one to continue.
        </p>
        <Link to="/forgot-password" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <h1 className="text-2xl font-bold">Set a new password</h1>
      <p className="mt-1 text-sm text-muted-foreground">Choose something you haven't used before.</p>

      <form
        className="mt-6 space-y-4"
        onSubmit={handleSubmit((data) => resetPassword.mutate({ token, password: data.password }))}
      >
        <FormField label="New password" htmlFor="password" error={errors.password?.message}>
          <Input id="password" type="password" placeholder="At least 8 characters" {...register('password')} />
        </FormField>

        <FormField label="Confirm new password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
          <Input id="confirmPassword" type="password" placeholder="••••••••" {...register('confirmPassword')} />
        </FormField>

        <Button type="submit" className="w-full" disabled={resetPassword.isPending}>
          {resetPassword.isPending ? 'Resetting…' : 'Reset password'}
        </Button>
      </form>
    </motion.div>
  );
}
