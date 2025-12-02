import {
  Box,
  Card,
  CardBody,
  Heading,
  HStack,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { queryKeys } from '@/services/queryKeys'
import { projectsApi } from '@/services/projects'
import { reportsApi } from '@/services/reports'
import { defaultReportRange, formatMinutes } from '@/utils/dates'

export function DashboardPage() {
  const range = defaultReportRange()
  const summaryQuery = useQuery({
    queryKey: queryKeys.reportsSummary(JSON.stringify(range)),
    queryFn: () => reportsApi.summarize(range),
  })

  const projectsQuery = useQuery({
    queryKey: queryKeys.projects,
    queryFn: projectsApi.list,
  })

  const exportsQuery = useQuery({
    queryKey: queryKeys.exports,
    queryFn: reportsApi.listExports,
  })

  return (
    <Stack spacing={6}>
      <Heading size="lg">Welcome back</Heading>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <StatCard
          label="Tracked this week"
          value={
            summaryQuery.data
              ? formatMinutes(summaryQuery.data.total_minutes)
              : '—'
          }
          loading={summaryQuery.isLoading}
        />
        <StatCard
          label="Billable"
          value={
            summaryQuery.data
              ? formatMinutes(summaryQuery.data.total_billable_minutes)
              : '—'
          }
          loading={summaryQuery.isLoading}
        />
        <StatCard
          label="Active projects"
          value={projectsQuery.data?.filter((p) => !p.is_archived).length ?? 0}
          loading={projectsQuery.isLoading}
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Card>
          <CardBody>
            <HStack justify="space-between" mb={4}>
              <Heading size="md">Projects</Heading>
              <Link to="/projects">Manage</Link>
            </HStack>
            <Stack spacing={3}>
              {projectsQuery.isLoading && <Spinner />}
              {projectsQuery.data?.slice(0, 5).map((project) => (
                <Box
                  key={project.id}
                  borderWidth="1px"
                  borderRadius="md"
                  p={3}
                >
                  <Text fontWeight="medium">{project.name}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {project.description ?? 'No description'}
                  </Text>
                </Box>
              ))}
              {!projectsQuery.isLoading && !projectsQuery.data?.length && (
                <Text color="gray.500">No projects yet.</Text>
              )}
            </Stack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <HStack justify="space-between" mb={4}>
              <Heading size="md">Latest exports</Heading>
              <Link to="/reports">View all</Link>
            </HStack>
            <Stack spacing={3}>
              {exportsQuery.isLoading && <Spinner />}
              {exportsQuery.data?.slice(0, 4).map((exportItem) => (
                <Box key={exportItem.id} borderWidth="1px" borderRadius="md" p={3}>
                  <Text fontWeight="medium">Request #{exportItem.id}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {exportItem.format.toUpperCase()} • {exportItem.status}
                  </Text>
                </Box>
              ))}
              {!exportsQuery.isLoading && !exportsQuery.data?.length && (
                <Text color="gray.500">No exports yet.</Text>
              )}
            </Stack>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Stack>
  )
}

function StatCard({
  label,
  value,
  loading,
}: {
  label: string
  value: string | number
  loading?: boolean
}) {
  return (
    <Card>
      <CardBody>
        <Text fontSize="sm" color="gray.500">
          {label}
        </Text>
        <Heading size="lg" mt={2}>
          {loading ? <Spinner size="sm" /> : value}
        </Heading>
      </CardBody>
    </Card>
  )
}
