import {
  Badge,
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Select,
  Stack,
  Switch,
  Text,
  useToast,
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { queryKeys } from '@/services/queryKeys'
import { remindersApi } from '@/services/reminders'
import type { ReminderPayload } from '@/types'

const reminderChannels = ['email', 'slack', 'webhook'] as const

const schema = z.object({
  label: z.string().min(1, 'Label is required'),
  cron_expression: z.string().min(5, 'Cron expression required'),
  channel: z.enum(reminderChannels),
})

type ReminderFormValues = z.infer<typeof schema>

export function RemindersPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReminderFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { channel: 'email' },
  })

  const remindersQuery = useQuery({
    queryKey: queryKeys.reminders,
    queryFn: remindersApi.list,
  })

  const createReminder = useMutation({
    mutationFn: remindersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reminders })
      toast({ title: 'Reminder saved', status: 'success' })
      reset({ label: '', cron_expression: '', channel: 'email' })
    },
  })

  const toggleReminder = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      remindersApi.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reminders })
    },
  })

  return (
    <Stack spacing={8} direction={{ base: 'column', lg: 'row' }} align="flex-start">
      <Box flex="1" borderWidth="1px" borderRadius="lg" p={6}>
        <Heading size="md" mb={4}>
          Active reminders
        </Heading>
        <Stack spacing={4}>
          {remindersQuery.data?.map((reminder) => (
            <Box key={reminder.id} borderWidth="1px" borderRadius="md" p={4}>
              <Heading size="sm">{reminder.label}</Heading>
              <Text fontSize="sm" color="gray.500">
                Cron: {reminder.cron_expression}
              </Text>
              <Badge mt={2}>{reminder.channel}</Badge>
              <Switch
                mt={3}
                isChecked={reminder.is_active}
                onChange={(event) =>
                  toggleReminder.mutate({
                    id: reminder.id,
                    is_active: event.target.checked,
                  })
                }
              >
                Enabled
              </Switch>
            </Box>
          ))}
          {!remindersQuery.data?.length && (
            <Text color="gray.500">No reminders yet.</Text>
          )}
        </Stack>
      </Box>

      <Box flex="1" borderWidth="1px" borderRadius="lg" p={6}>
        <Heading size="md" mb={4}>
          New reminder
        </Heading>
        <form
          onSubmit={handleSubmit((values) => {
            const payload: ReminderPayload = {
              ...values,
              is_active: true,
            }
            createReminder.mutate(payload)
          })}
        >
          <Stack spacing={4}>
            <FormControl isInvalid={Boolean(errors.label)}>
              <FormLabel>Label</FormLabel>
              <Input {...register('label')} />
              <FormErrorMessage>{errors.label?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={Boolean(errors.cron_expression)}>
              <FormLabel>Cron expression</FormLabel>
              <Input placeholder="0 9 * * MON-FRI" {...register('cron_expression')} />
              <FormErrorMessage>{errors.cron_expression?.message}</FormErrorMessage>
            </FormControl>
            <FormControl>
              <FormLabel>Channel</FormLabel>
              <Select {...register('channel')}>
                {reminderChannels.map((channel) => (
                  <option key={channel} value={channel}>
                    {channel.charAt(0).toUpperCase() + channel.slice(1)}
                  </option>
                ))}
              </Select>
            </FormControl>
            <Button
              type="submit"
              colorScheme="purple"
              isLoading={createReminder.isPending}
            >
              Save reminder
            </Button>
          </Stack>
        </form>
      </Box>
    </Stack>
  )
}
