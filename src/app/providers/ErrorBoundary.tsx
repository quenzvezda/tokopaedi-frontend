import { Box, Button, Container, Heading, Text } from '@chakra-ui/react'
import React from 'react'

type Props = { children: React.ReactNode }

type State = { hasError: boolean; error?: unknown }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error }
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, errorInfo)
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxW="lg" py={12}>
          <Heading size="lg" mb={3}>
            Something went wrong
          </Heading>
          <Text mb={6}>An unexpected error occurred. Please try again.</Text>
          <Box>
            <Button colorScheme="blue" onClick={this.handleReload}>
              Reload
            </Button>
          </Box>
        </Container>
      )
    }
    return <>{this.props.children}</>
  }
}

export default ErrorBoundary
