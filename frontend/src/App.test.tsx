import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from './App'
import { AppProviders } from './app/providers/AppProviders'

describe('App routing', () => {
  it('renders authentication screen by default', async () => {
    render(
      <AppProviders>
        <App />
      </AppProviders>,
    )

    expect(await screen.findByText(/sign in/i)).toBeInTheDocument()
  })
})
