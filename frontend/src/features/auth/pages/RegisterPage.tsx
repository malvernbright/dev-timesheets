import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Link,
  Stack,
  useToast,
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { authApi } from '@/features/auth/api'
import { useAuthStore } from '@/store/authStore'

const schema = z.object({
  full_name: z.string().min(2, 'Enter your name'),
  email: z.string().email('Provide a valid email'),
  password: z.string().min(8, 'Minimum 8 characters'),
  timezone: z.string().min(2),
})

type RegisterFormValues = z.infer<typeof schema>

export function RegisterPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const setSession = useAuthStore((state) => state.setSession)
  const setUser = useAuthStore((state) => state.setUser)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { timezone: 'UTC' },
  })

  const mutation = useMutation({
    mutationFn: async (values: RegisterFormValues) => {
      const tokens = await authApi.register(values)
      setSession(tokens)
      const profile = await authApi.me()
      setUser(profile)
    },
    onSuccess: () => {
      toast({
        title: 'Account created',
        status: 'success',
      })
      navigate('/', { replace: true })
    },
    onError: () => {
      toast({
        title: 'Unable to register',
        description: 'Please try again with different credentials.',
        status: 'error',
      })
    },
  })

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))}>
      <Stack spacing={4}>
        <FormControl isInvalid={Boolean(errors.full_name)}>
          <FormLabel>Full name</FormLabel>
          <Input {...register('full_name')} autoComplete="name" />
          <FormErrorMessage>{errors.full_name?.message}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={Boolean(errors.email)}>
          <FormLabel>Email</FormLabel>
          <Input type="email" {...register('email')} autoComplete="email" />
          <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={Boolean(errors.password)}>
          <FormLabel>Password</FormLabel>
          <Input type="password" {...register('password')} autoComplete="new-password" />
          <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={Boolean(errors.timezone)}>
          <FormLabel>Timezone</FormLabel>
          <Input {...register('timezone')} />
          <FormErrorMessage>{errors.timezone?.message}</FormErrorMessage>
        </FormControl>
        <Button type="submit" colorScheme="purple" isLoading={mutation.isPending}>
          Create account
        </Button>
        <Link as={RouterLink} to="/auth/login" color="purple.500" textAlign="center">
          Already have an account? Sign in
        </Link>
      </Stack>
    </form>
  )
}
