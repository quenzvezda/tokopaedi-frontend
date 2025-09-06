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
  Stack,
  Text,
  useColorModeValue,
  useToast,
  Link,
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { toApiError } from '@/shared/lib/fetcher'

import { useRegister } from '../api/hooks'

const RegisterSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type RegisterForm = z.infer<typeof RegisterSchema>

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(RegisterSchema) })
  const { isPending, mutateAsync } = useRegister()
  const toast = useToast()
  const navigate = useNavigate()
  const cardBg = useColorModeValue('white', 'gray.800')
  const border = useColorModeValue('gray.200', 'gray.700')
  const muted = useColorModeValue('gray.600', 'gray.400')

  const onSubmit = async (values: RegisterForm) => {
    try {
      await mutateAsync(values)
      toast({ title: 'Registered successfully', status: 'success' })
      navigate('/login', { replace: true })
    } catch (err) {
      const { message } = toApiError(err)
      toast({ title: 'Registration failed', description: message, status: 'error' })
    }
  }

  return (
    <Flex minH="100vh" align="center" justify="center" bg={useColorModeValue('gray.50', 'gray.900')} px={4}>
      <Container maxW="md">
        <Stack spacing={6}>
          <Stack spacing={1} textAlign="center">
            <Heading size="lg">Create your account</Heading>
            <Text color={muted}>Enter your details to sign up</Text>
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
              <FormControl isInvalid={!!errors.username}>
                <FormLabel>Username</FormLabel>
                <Input placeholder="johndoe" autoComplete="username" {...register('username')} />
                <FormErrorMessage>{errors.username?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.email}>
                <FormLabel>Email</FormLabel>
                <Input type="email" placeholder="you@example.com" autoComplete="email" {...register('email')} />
                <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.password}>
                <FormLabel>Password</FormLabel>
                <Input type="password" placeholder="********" autoComplete="new-password" {...register('password')} />
                <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
              </FormControl>
              <Button type="submit" colorScheme="teal" isLoading={isPending}>
                Register
              </Button>
            </Stack>
          </Box>

          <Text fontSize="sm" color={muted} textAlign="center">
            Already have an account?{' '}
            <Link as={RouterLink} to="/login" color="teal.500">
              Sign in
            </Link>
          </Text>
        </Stack>
      </Container>
    </Flex>
  )
}

