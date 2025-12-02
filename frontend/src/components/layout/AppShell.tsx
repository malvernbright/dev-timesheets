import {
  Avatar,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  HStack,
  Icon,
  IconButton,
  Text,
  useColorMode,
  useColorModeValue,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import type { PropsWithChildren } from 'react'
import { LuBell, LuChartPie, LuClock4, LuFolder, LuLayoutDashboard, LuLogOut, LuMenu, LuPuzzle } from 'react-icons/lu'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

const navLinks = [
  { label: 'Dashboard', path: '/', icon: LuLayoutDashboard },
  { label: 'Time Entries', path: '/time-entries', icon: LuClock4 },
  { label: 'Projects', path: '/projects', icon: LuFolder },
  { label: 'Reports', path: '/reports', icon: LuChartPie },
  { label: 'Reminders', path: '/reminders', icon: LuBell },
  { label: 'Integrations', path: '/integrations', icon: LuPuzzle },
]

function ColorModeToggle() {
  const { colorMode, toggleColorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  return (
    <Button size="sm" variant="ghost" onClick={toggleColorMode}>
      {isDark ? 'Light' : 'Dark'}
    </Button>
  )
}

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation()
  return (
    <VStack align="stretch" spacing={1} mt={6}>
      {navLinks.map((link) => {
        const isActive =
          location.pathname === link.path ||
          location.pathname.startsWith(`${link.path}/`)
        return (
          <Button
            key={link.path}
            as={Link}
            to={link.path}
            justifyContent="flex-start"
            variant={isActive ? 'solid' : 'ghost'}
            colorScheme={isActive ? 'purple' : undefined}
            leftIcon={<Icon as={link.icon} boxSize={5} />}
            onClick={onNavigate}
          >
            {link.label}
          </Button>
        )
      })}
    </VStack>
  )
}

export function AppShell({ children }: PropsWithChildren) {
  const sidebarBg = useColorModeValue('white', 'gray.800')
  const headerBg = useColorModeValue('white', 'gray.900')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/auth/login', { replace: true })
  }

  return (
    <Flex minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Box
        w="64"
        borderRightWidth="1px"
        borderColor={borderColor}
        bg={sidebarBg}
        display={{ base: 'none', md: 'block' }}
        px={6}
        py={8}
      >
        <Text fontSize="lg" fontWeight="bold">
          Dev Timesheets
        </Text>
        <NavContent />
      </Box>

      <Drawer placement="left" isOpen={isOpen} onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton mt={2} />
          <DrawerBody mt={12}>
            <NavContent onNavigate={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Flex direction="column" flex="1">
        <Flex
          as="header"
          align="center"
          justify="space-between"
          px={{ base: 4, md: 8 }}
          py={4}
          borderBottomWidth="1px"
          borderColor={borderColor}
          bg={headerBg}
        >
          <HStack spacing={4}>
            <IconButton
              aria-label="Open menu"
              icon={<LuMenu />}
              display={{ base: 'inline-flex', md: 'none' }}
              onClick={onOpen}
              variant="ghost"
            />
            <Text fontWeight="semibold">Dev Timesheets</Text>
          </HStack>
          <HStack spacing={4}>
            <ColorModeToggle />
            <Avatar size="sm" name={user?.full_name ?? user?.email ?? 'User'} />
            <Button
              size="sm"
              variant="outline"
              colorScheme="red"
              leftIcon={<LuLogOut />}
              onClick={handleLogout}
            >
              Log out
            </Button>
          </HStack>
        </Flex>

        <Box as="main" flex="1" px={{ base: 4, md: 8 }} py={6}>
          {children}
        </Box>
      </Flex>
    </Flex>
  )
}
