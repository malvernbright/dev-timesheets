import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  Textarea,
  useToast,
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { integrationsApi } from '@/services/integrations'
import { queryKeys } from '@/services/queryKeys'

const schema = z.object({
  provider: z.string().min(2, 'Provider name required'),
  access_token: z.string().min(1, 'Access token required'),
  details: z.string().optional(),
})

type IntegrationFormValues = z.infer<typeof schema>

export function IntegrationsPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IntegrationFormValues>({
    resolver: zodResolver(schema),
  })

  const tokensQuery = useQuery({
    queryKey: queryKeys.integrations,
    queryFn: integrationsApi.list,
  })

  const upsertToken = useMutation({
    mutationFn: integrationsApi.upsert,
    onSuccess: () => {
      toast({ title: 'Token saved', status: 'success' })
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations })
      reset({ provider: '', access_token: '', details: '' })
    },
  })

  return (
    <Stack spacing={8} direction={{ base: 'column', lg: 'row' }} align="flex-start">
      <Box flex="1" borderWidth="1px" borderRadius="lg" p={6}>
        <Heading size="md" mb={4}>
          Connected tools
        </Heading>
        <Stack spacing={4}>
          {tokensQuery.data?.map((token) => (
            <Box key={token.id} borderWidth="1px" borderRadius="md" p={4}>
              <Heading size="sm" textTransform="capitalize">
                {token.provider}
              </Heading>
              <Text fontSize="sm" color="gray.500">
                {token.details ?? 'No metadata stored.'}
              </Text>
            </Box>
          ))}
          {!tokensQuery.data?.length && (
            <Text color="gray.500">No integrations saved yet.</Text>
          )}
        </Stack>
      </Box>

      <Box flex="1" borderWidth="1px" borderRadius="lg" p={6}>
        <Heading size="md" mb={4}>
          Store access token
        </Heading>
        <form onSubmit={handleSubmit((values) => upsertToken.mutate(values))}>
          <Stack spacing={4}>
            <FormControl isInvalid={Boolean(errors.provider)}>
              <FormLabel>Provider</FormLabel>
              <Input placeholder="asana" {...register('provider')} />
              <FormErrorMessage>{errors.provider?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={Boolean(errors.access_token)}>
              <FormLabel>Access token</FormLabel>
              <Input {...register('access_token')} />
              <FormErrorMessage>{errors.access_token?.message}</FormErrorMessage>
            </FormControl>
            <FormControl>
              <FormLabel>Details</FormLabel>
              <Textarea {...register('details')} rows={3} />
            </FormControl>
            <Button
              type="submit"
              colorScheme="purple"
              isLoading={upsertToken.isPending}
            >
              Save token
            </Button>
          </Stack>
        </form>
      </Box>
    </Stack>
  )
}
