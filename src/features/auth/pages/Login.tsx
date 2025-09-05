import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormErrorMessage,
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
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useLocation } from 'react-router-dom'
import { z } from 'zod'

import { toApiError } from '@/shared/lib/fetcher'

import { useLogin } from '../api/hooks'


const LoginSchema = z.object({
  usernameOrEmail: z.string().min(1, 'Username or Email is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof LoginSchema>

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: { pathname?: string } } }
  const from = location.state?.from?.pathname || '/'
  const { isPending, mutateAsync } = useLogin()

  const cardBg = useColorModeValue('white', 'gray.800')
  const border = useColorModeValue('gray.200', 'gray.700')
  const muted = useColorModeValue('gray.600', 'gray.400')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(LoginSchema), defaultValues: { usernameOrEmail: '', password: '' } })

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await mutateAsync(values)
      toast({ title: 'Signed in', status: 'success' })
      navigate(from, { replace: true })
    } catch (err: unknown) {
      const { message } = toApiError(err)
      toast({ title: 'Login failed', description: message, status: 'error' })
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
            onSubmit={handleSubmit(onSubmit)}
            bg={cardBg}
            borderWidth="1px"
            borderColor={border}
            borderRadius="lg"
            p={{ base: 6, md: 8 }}
            boxShadow={{ base: 'sm', md: 'md' }}
          >
            <Stack spacing={4}>
              <FormControl id="usernameOrEmail" isRequired isInvalid={!!errors.usernameOrEmail}>
                <FormLabel>Username or Email</FormLabel>
                <Input
                  {...register('usernameOrEmail')}
                  placeholder="admin@local.test"
                  autoComplete="username"
                />
                {errors.usernameOrEmail && (
                  <FormErrorMessage>{errors.usernameOrEmail.message}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl id="password" isRequired isInvalid={!!errors.password}>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="********"
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
                {errors.password && <FormErrorMessage>{errors.password.message}</FormErrorMessage>}
              </FormControl>

              <Button colorScheme="blue" type="submit" isLoading={isPending}>
                Sign in
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Flex>
  )
}
