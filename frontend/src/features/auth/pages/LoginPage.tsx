import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Link,
  Stack,
  useToast,
} from '@chakra-ui/react'
import { useMutation } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { authApi } from '@/features/auth/api'
import { useAuthStore } from '@/store/authStore'

const schema = z.object({
  email: z.string().email('Provide a valid email'),
  password: z.string().min(8, 'Minimum 8 characters'),
})

type LoginFormValues = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const setSession = useAuthStore((state) => state.setSession)
  const setUser = useAuthStore((state) => state.setUser)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const tokens = await authApi.login(values)
      setSession(tokens)
      const profile = await authApi.me()
      setUser(profile)
    },
    onSuccess: () => {
      const redirectTo = (location.state as { from?: string })?.from ?? '/'
      toast({
        title: 'Welcome back!',
        status: 'success',
      })
      navigate(redirectTo, { replace: true })
    },
    onError: () => {
      toast({
        title: 'Login failed',
        description: 'Please check your credentials and try again.',
        status: 'error',
      })
    },
  })

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))}>
      <Stack spacing={4}>
      <FormControl isInvalid={Boolean(errors.email)}>
        <FormLabel>Email</FormLabel>
        <Input type="email" {...register('email')} autoComplete="email" />
        <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={Boolean(errors.password)}>
        <FormLabel>Password</FormLabel>
        <Input type="password" {...register('password')} autoComplete="current-password" />
        <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
      </FormControl>
      <Button type="submit" colorScheme="purple" isLoading={mutation.isPending}>
        Sign in
      </Button>
      <Alert status="info" variant="subtle">
        <AlertIcon />
        <Stack spacing={0}>
          <AlertTitle>New to Dev Timesheets?</AlertTitle>
          <AlertDescription>
            <Link as={RouterLink} to="/auth/register" color="purple.500">
              Create an account
            </Link>
          </AlertDescription>
        </Stack>
      </Alert>
      </Stack>
    </form>
  )
}
