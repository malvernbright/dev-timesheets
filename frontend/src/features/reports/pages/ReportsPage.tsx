import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
  VStack,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { queryKeys } from '@/services/queryKeys'
import { projectsApi } from '@/services/projects'
import { reportsApi } from '@/services/reports'
import { defaultReportRange, formatMinutes } from '../../../utils/dates'
import { serializeFilters } from '@/utils/query'

const initialRange = defaultReportRange()

export function ReportsPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState({
    projectIds: [] as string[],
    date_from: initialRange.date_from,
    date_to: initialRange.date_to,
  })
  const [format, setFormat] = useState<'csv' | 'pdf'>('csv')

  const filtersKey = serializeFilters(filters)

  const projectsQuery = useQuery({
    queryKey: queryKeys.projects,
    queryFn: projectsApi.list,
  })

  const summaryQuery = useQuery({
    queryKey: queryKeys.reportsSummary(filtersKey),
    queryFn: () =>
      reportsApi.summarize({
        project_ids: filters.projectIds.length
          ? filters.projectIds.map((id) => Number(id))
          : undefined,
        date_from: filters.date_from,
        date_to: filters.date_to,
      }),
  })

  const exportsQuery = useQuery({
    queryKey: queryKeys.exports,
    queryFn: reportsApi.listExports,
  })

  const exportMutation = useMutation({
    mutationFn: () =>
      reportsApi.requestExport({
        project_ids: filters.projectIds.length
          ? filters.projectIds.map((id) => Number(id))
          : undefined,
        date_from: filters.date_from,
        date_to: filters.date_to,
        format,
      }),
    onSuccess: () => {
      toast({ title: 'Export queued', status: 'success' })
      queryClient.invalidateQueries({ queryKey: queryKeys.exports })
    },
  })

  return (
    <Stack spacing={8}>
      <Box borderWidth="1px" borderRadius="lg" p={6}>
        <Heading size="md" mb={4}>
          Filters
        </Heading>
        <Stack spacing={4} direction={{ base: 'column', md: 'row' }}>
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
        </Stack>
        <FormControl mt={4}>
          <FormLabel>Projects</FormLabel>
          <CheckboxGroup
            value={filters.projectIds}
            onChange={(values) =>
              setFilters((prev) => ({
                ...prev,
                projectIds: values as string[],
              }))
            }
          >
            <Wrap spacing={3}>
              {projectsQuery.data?.map((project) => (
                <WrapItem key={project.id}>
                  <Checkbox value={String(project.id)}>{project.name}</Checkbox>
                </WrapItem>
              ))}
            </Wrap>
          </CheckboxGroup>
        </FormControl>
      </Box>

      <Box borderWidth="1px" borderRadius="lg" p={6}>
        <Heading size="md" mb={4}>
          Summary
        </Heading>
        {!summaryQuery.data && <Text color="gray.500">No data yet.</Text>}
        {summaryQuery.data && (
          <>
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th>Project</Th>
                  <Th>Minutes</Th>
                  <Th>Billable</Th>
                </Tr>
              </Thead>
              <Tbody>
                {summaryQuery.data.summary.map((row) => (
                  <Tr key={row.project_id}>
                    <Td>{row.project_name}</Td>
                    <Td>{formatMinutes(row.total_minutes)}</Td>
                    <Td>{formatMinutes(row.total_billable_minutes)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <HStack spacing={6} mt={4}>
              <StatBox
                label="Total minutes"
                value={formatMinutes(summaryQuery.data.total_minutes)}
              />
              <StatBox
                label="Billable"
                value={formatMinutes(summaryQuery.data.total_billable_minutes)}
              />
            </HStack>
          </>
        )}
      </Box>

      <Box borderWidth="1px" borderRadius="lg" p={6}>
        <Heading size="md" mb={4}>
          Export
        </Heading>
        <Stack direction={{ base: 'column', md: 'row' }} align="center">
          <RadioGroup value={format} onChange={(value) => setFormat(value as 'csv' | 'pdf')}>
            <HStack spacing={6}>
              <Radio value="csv">CSV</Radio>
              <Radio value="pdf">PDF</Radio>
            </HStack>
          </RadioGroup>
          <Button
            colorScheme="purple"
            onClick={() => exportMutation.mutate()}
            isLoading={exportMutation.isPending}
          >
            Request export
          </Button>
        </Stack>
      </Box>

      <Box borderWidth="1px" borderRadius="lg" p={6}>
        <Heading size="md" mb={4}>
          Export history
        </Heading>
        <Stack spacing={3}>
          {exportsQuery.data?.map((item) => (
            <Box key={item.id} borderWidth="1px" borderRadius="md" p={4}>
              <Text fontWeight="semibold">
                Request #{item.id} • {item.format.toUpperCase()}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Status: {item.status}
              </Text>
              {item.file_path && (
                <Text fontSize="sm" mt={2}>
                  File ready at <strong>{item.file_path}</strong>
                </Text>
              )}
            </Box>
          ))}
          {!exportsQuery.data?.length && (
            <Text color="gray.500">No exports requested yet.</Text>
          )}
        </Stack>
      </Box>
    </Stack>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <VStack
      align="flex-start"
      borderWidth="1px"
      borderRadius="md"
      p={4}
      minW="200px"
    >
      <Text fontSize="sm" color="gray.500">
        {label}
      </Text>
      <Text fontWeight="bold" fontSize="lg">
        {value}
      </Text>
    </VStack>
  )
}
