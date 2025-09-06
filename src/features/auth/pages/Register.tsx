import {
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
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
    <Box p={8} display="flex" justifyContent="center">
      <Card w="sm">
        <CardBody>
          <Stack spacing={4}>
            <Heading size="md">Create your account</Heading>
            <Text fontSize="sm" color="gray.500">
              Registration is not available yet. This form is a placeholder.
            </Text>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={3}>
                <FormControl isInvalid={!!errors.username}>
                  <FormLabel>Username</FormLabel>
                  <Input placeholder="johndoe" {...register('username')} />
                  <FormErrorMessage>{errors.username?.message}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!errors.email}>
                  <FormLabel>Email</FormLabel>
                  <Input type="email" placeholder="you@example.com" {...register('email')} />
                  <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!errors.password}>
                  <FormLabel>Password</FormLabel>
                  <Input type="password" placeholder="********" {...register('password')} />
                  <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
                </FormControl>
                <Button type="submit" colorScheme="teal" isLoading={isPending}>
                  Register
                </Button>
              </Stack>
            </form>
          </Stack>
        </CardBody>
      </Card>
    </Box>
  )
}

