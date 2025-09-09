import { FormControl, FormLabel, Input, Button, FormErrorMessage, VStack } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { PermissionRequest } from '@/features/admin/services/permission.service'
import { permissionSchema } from '@/features/admin/services/permission.zod'

type PermissionFormValues = z.infer<typeof permissionSchema>

interface PermissionFormProps {
  initialValues?: PermissionRequest
  onSubmit: (data: PermissionRequest) => void
  isSubmitting: boolean
}

export const PermissionForm = ({ initialValues, onSubmit, isSubmitting }: PermissionFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionSchema),
    defaultValues: initialValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack spacing={4}>
        <FormControl isInvalid={!!errors.name}>
          <FormLabel htmlFor="name">Name</FormLabel>
          <Input id="name" {...register('name')} />
          <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.description}>
          <FormLabel htmlFor="description">Description</FormLabel>
          <Input id="description" {...register('description')} />
          <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
        </FormControl>
        <Button mt={4} colorScheme="teal" isLoading={isSubmitting} type="submit">
          Save
        </Button>
      </VStack>
    </form>
  )
}
