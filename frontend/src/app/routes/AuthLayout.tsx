import { Box, Flex, Heading, Text, useColorModeValue } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  const bg = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Flex minH="100vh" align="center" justify="center" bg={bg} px={4}>
      <Box
        w="full"
        maxW="md"
        bg={cardBg}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        p={{ base: 6, md: 8 }}
        boxShadow="lg"
      >
        <Heading size="lg" mb={2}>
          Dev Timesheets
        </Heading>
        <Text mb={6} color="gray.500">
          Log time, generate reports, and stay on top of projects.
        </Text>
        <Outlet />
      </Box>
    </Flex>
  )
}
