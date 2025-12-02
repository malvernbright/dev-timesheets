import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Select,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { differenceInMinutes, parseISO } from 'date-fns'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { queryKeys } from '@/services/queryKeys'
import { projectsApi } from '@/services/projects'
import { timeEntriesApi } from '@/services/timeEntries'
import { serializeFilters } from '@/utils/query'
import { defaultReportRange, formatDate, formatMinutes } from '@/utils/dates'

const schema = z.object({
  project_id: z.string().min(1, 'Project is required'),
  description: z.string().optional(),
  started_at: z.string().min(1, 'Start time required'),
  ended_at: z.string().optional(),
  duration_minutes: z
    .string()
    .min(1, 'Duration must be positive')
    .refine((value) => Number(value) > 0, 'Duration must be positive'),
  is_billable: z.boolean(),
  hourly_rate: z.string().optional(),
})

type TimeEntryFormValues = z.infer<typeof schema>

const rangeDefaults = defaultReportRange()

export function TimeEntriesPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState({
    projectId: 'all',
    date_from: rangeDefaults.date_from,
    date_to: rangeDefaults.date_to,
  })

  const filtersKey = serializeFilters(filters)

  const projectsQuery = useQuery({
    queryKey: queryKeys.projects,
    queryFn: projectsApi.list,
  })

  const entriesQuery = useQuery({
    queryKey: queryKeys.timeEntries(filtersKey),
    queryFn: () =>
      timeEntriesApi.list({
        project_ids: filters.projectId === 'all' ? undefined : [Number(filters.projectId)],
        date_from: filters.date_from
          ? new Date(`${filters.date_from}T00:00:00`).toISOString()
          : undefined,
        date_to: filters.date_to
          ? new Date(`${filters.date_to}T23:59:59`).toISOString()
          : undefined,
      }),
  })

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<TimeEntryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      is_billable: true,
      started_at: `${filters.date_from}T09:00`,
      duration_minutes: '60',
    },
  })

  const createEntry = useMutation({
    mutationFn: timeEntriesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] })
      toast({ title: 'Entry logged', status: 'success' })
      reset({
        is_billable: true,
        started_at: `${filters.date_from}T09:00`,
        duration_minutes: '60',
        description: '',
        project_id: '',
        hourly_rate: '',
        ended_at: '',
      })
    },
  })

  const startedAt = useWatch({ control, name: 'started_at' })
  const endedAt = useWatch({ control, name: 'ended_at' })

  useEffect(() => {
    if (startedAt && endedAt) {
      const diff = differenceInMinutes(parseISO(endedAt), parseISO(startedAt))
      if (diff > 0) {
        setValue('duration_minutes', String(diff))
      }
    }
  }, [startedAt, endedAt, setValue])

  const projectOptions = projectsQuery.data ?? []

  return (
    <Stack spacing={8}>
      <Flex direction={{ base: 'column', lg: 'row' }} gap={6}>
        <Box flex="1" borderWidth="1px" borderRadius="lg" p={6}>
          <Heading size="md" mb={4}>
            Log time
          </Heading>
          <form
            onSubmit={handleSubmit((values) =>
              createEntry.mutate({
                project_id: Number(values.project_id),
                description: values.description || undefined,
                started_at: new Date(values.started_at).toISOString(),
                ended_at: values.ended_at
                  ? new Date(values.ended_at).toISOString()
                  : undefined,
                duration_minutes: Number(values.duration_minutes),
                is_billable: values.is_billable,
                hourly_rate: values.hourly_rate
                  ? Number(values.hourly_rate)
                  : undefined,
              }),
            )}
          >
            <Stack spacing={4}>
              <FormControl isInvalid={Boolean(errors.project_id)}>
                <FormLabel>Project</FormLabel>
                <Select placeholder="Select project" {...register('project_id')}>
                  {projectOptions.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.project_id?.message}</FormErrorMessage>
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input {...register('description')} />
              </FormControl>
              <FormControl isInvalid={Boolean(errors.started_at)}>
                <FormLabel>Started at</FormLabel>
                <Input type="datetime-local" {...register('started_at')} />
                <FormErrorMessage>{errors.started_at?.message}</FormErrorMessage>
              </FormControl>
              <FormControl>
                <FormLabel>Ended at (optional)</FormLabel>
                <Input type="datetime-local" {...register('ended_at')} />
              </FormControl>
              <FormControl isInvalid={Boolean(errors.duration_minutes)}>
                <FormLabel>Duration (minutes)</FormLabel>
                <Input type="number" {...register('duration_minutes')} />
                <FormErrorMessage>
                  {errors.duration_minutes?.message}
                </FormErrorMessage>
              </FormControl>
              <FormControl display="flex" alignItems="center">
                <Checkbox {...register('is_billable')}>Billable</Checkbox>
              </FormControl>
              <FormControl>
                <FormLabel>Hourly rate</FormLabel>
                <Input type="number" step="0.01" {...register('hourly_rate')} />
              </FormControl>
              <Button
                type="submit"
                colorScheme="purple"
                isLoading={createEntry.isPending}
              >
                Save entry
              </Button>
            </Stack>
          </form>
        </Box>

        <Box flex="1" borderWidth="1px" borderRadius="lg" p={6}>
          <Heading size="md" mb={4}>
            Filters
          </Heading>
          <Stack spacing={4}>
            <FormControl>
              <FormLabel>Project</FormLabel>
              <Select
                value={filters.projectId}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, projectId: event.target.value }))
                }
              >
                <option value="all">All projects</option>
                {projectOptions.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>From</FormLabel>
              <Input
                type="date"
                value={filters.date_from}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, date_from: event.target.value }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>To</FormLabel>
              <Input
                type="date"
                value={filters.date_to}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, date_to: event.target.value }))
                }
              />
            </FormControl>
            <Button
              variant="outline"
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ['timeEntries'] })
              }
            >
              Refresh
            </Button>
          </Stack>
        </Box>
      </Flex>

      <Box borderWidth="1px" borderRadius="lg" p={6}>
        <Heading size="md" mb={4}>
          Recent entries
        </Heading>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Project</Th>
              <Th>Description</Th>
              <Th>Started</Th>
              <Th>Duration</Th>
              <Th>Billable</Th>
            </Tr>
          </Thead>
          <Tbody>
            {entriesQuery.data?.map((entry) => (
              <Tr key={entry.id}>
                <Td>
                  {
                    projectOptions.find((project) => project.id === entry.project_id)
                      ?.name ?? 'Project'
                  }
                </Td>
                <Td>{entry.description ?? '—'}</Td>
                <Td>{formatDate(entry.started_at, 'MMM d • HH:mm')}</Td>
                <Td>{formatMinutes(entry.duration_minutes)}</Td>
                <Td>{entry.is_billable ? 'Yes' : 'No'}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        {!entriesQuery.data?.length && (
          <Text mt={4} color="gray.500">
            No entries match your filters yet.
          </Text>
        )}
      </Box>
    </Stack>
  )
}
