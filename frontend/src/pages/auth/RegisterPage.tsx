import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { registerFormSchema, type RegisterFormValues } from '@/utils/validators/authSchemas';
import { useRegister } from '@/hooks/useAuth';
import { FormField } from '@/components/shared/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  const registerUser = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerFormSchema) });

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <h1 className="text-2xl font-bold">Create your account</h1>
      <p className="mt-1 text-sm text-muted-foreground">Join Inkwell and start publishing in minutes.</p>

      <form
        className="mt-6 space-y-4"
        onSubmit={handleSubmit((data) =>
          registerUser.mutate({
            name: data.name,
            username: data.username,
            email: data.email,
            password: data.password,
          })
        )}
      >
        <FormField label="Full name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" placeholder="Ada Lovelace" {...register('name')} />
        </FormField>

        <FormField label="Username" htmlFor="username" error={errors.username?.message}>
          <Input id="username" placeholder="ada_lovelace" {...register('username')} />
        </FormField>

        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <Input id="password" type="password" placeholder="At least 8 characters" {...register('password')} />
        </FormField>

        <FormField label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
          <Input id="confirmPassword" type="password" placeholder="••••••••" {...register('confirmPassword')} />
        </FormField>

        <Button type="submit" className="w-full" disabled={registerUser.isPending}>
          {registerUser.isPending ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </motion.div>
  );
}
