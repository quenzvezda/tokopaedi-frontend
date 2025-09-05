import { useState } from 'react'
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import { login } from '../api'
import { useAuth } from '../AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Login() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation() as any
  const from = location.state?.from?.pathname || '/'
  const { setAccessToken } = useAuth()

  const cardBg = useColorModeValue('white', 'gray.800')
  const border = useColorModeValue('gray.200', 'gray.700')
  const muted = useColorModeValue('gray.600', 'gray.400')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const data = await login({ usernameOrEmail, password })
      const token = (data as any).accessToken
      if (token) setAccessToken(token)
      toast({ title: 'Signed in', status: 'success' })
      navigate(from, { replace: true })
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Invalid credentials'
      toast({ title: 'Login failed', description: message, status: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Flex minH="100vh" align="center" justify="center" bg={useColorModeValue('gray.50', 'gray.900')} px={4}>
      <Container maxW="md">
        <Stack spacing={6}>
          <Stack spacing={1} textAlign="center">
            <Heading size="lg">Sign in</Heading>
            <Text color={muted}>Use your username/email and password</Text>
          </Stack>

          <Box
            as="form"
            onSubmit={handleSubmit}
            bg={cardBg}
            borderWidth="1px"
            borderColor={border}
            borderRadius="lg"
            p={{ base: 6, md: 8 }}
            boxShadow={{ base: 'sm', md: 'md' }}
          >
            <Stack spacing={4}>
              <FormControl id="usernameOrEmail" isRequired>
                <FormLabel>Username or Email</FormLabel>
                <Input
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="admin@local.test"
                  autoComplete="username"
                />
              </FormControl>

              <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <InputRightElement width="4.5rem">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowPassword((s) => !s)}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <Button colorScheme="blue" type="submit" isLoading={isSubmitting}>
                Sign in
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Flex>
  )
}
