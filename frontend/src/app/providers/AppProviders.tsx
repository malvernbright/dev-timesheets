import type { PropsWithChildren } from 'react'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { theme } from './theme'
import { AuthBootstrapper } from './AuthBootstrapper'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
})

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config?.initialColorMode} />
      <QueryClientProvider client={queryClient}>
        <AuthBootstrapper />
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ChakraProvider>
  )
}
