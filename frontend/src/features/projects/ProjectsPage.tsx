import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  useToast,
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { queryKeys } from '@/services/queryKeys'
import { projectsApi } from '@/services/projects'

const schema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  color: z.string().optional(),
})

type ProjectFormValues = z.infer<typeof schema>

export function ProjectsPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(schema),
  })

  const projectsQuery = useQuery({
    queryKey: queryKeys.projects,
    queryFn: projectsApi.list,
  })

  const createProject = useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects })
      toast({ title: 'Project created', status: 'success' })
      reset()
    },
  })

  return (
    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} alignItems="flex-start">
      <Stack spacing={4}>
        <Heading size="md">Projects</Heading>
        {projectsQuery.data?.map((project) => (
          <Box
            key={project.id}
            borderWidth="1px"
            borderRadius="md"
            p={4}
            bg="white"
            _dark={{ bg: 'gray.800' }}
          >
            <Heading size="sm">{project.name}</Heading>
            <Text color="gray.500">{project.description ?? 'No description yet.'}</Text>
            {project.color && (
              <Text fontSize="sm" mt={2}>
                Color: {project.color}
              </Text>
            )}
            {project.is_archived && (
              <Text mt={2} color="orange.400" fontSize="sm">
                Archived
              </Text>
            )}
          </Box>
        ))}
        {!projectsQuery.isLoading && !projectsQuery.data?.length && (
          <Text color="gray.500">No projects yet. Create one to get started.</Text>
        )}
      </Stack>

      <Box
        borderWidth="1px"
        borderRadius="lg"
        p={6}
        bg="white"
        _dark={{ bg: 'gray.800' }}
      >
        <Heading size="md" mb={4}>
          Create project
        </Heading>
        <form onSubmit={handleSubmit((values) => createProject.mutate(values))}>
          <Stack spacing={4}>
            <FormControl isInvalid={Boolean(errors.name)}>
              <FormLabel>Name</FormLabel>
              <Input {...register('name')} placeholder="Marketing site redesign" />
              <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
            </FormControl>
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea {...register('description')} rows={3} />
            </FormControl>
            <FormControl>
              <FormLabel>Color</FormLabel>
              <Input {...register('color')} placeholder="e.g. #6C63FF" />
            </FormControl>
            <Button
              type="submit"
              colorScheme="purple"
              isLoading={createProject.isPending}
            >
              Save project
            </Button>
          </Stack>
        </form>
      </Box>
    </SimpleGrid>
  )
}
