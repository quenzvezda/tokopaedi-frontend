import { AddIcon, DeleteIcon } from '@chakra-ui/icons'
import {
  Box,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  IconButton,
  Flex,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  HStack,
  Center,
  Stack,
  Skeleton,
} from '@chakra-ui/react'
import React from 'react'
import { Link, useParams } from 'react-router-dom'

import {
  useGetRole,
  useGetRolePermissions,
  useRemovePermissionFromRole,
} from '../api/hooks'
import { AssignPermissionModal } from '../components/AssignPermissionModal'

import type { Permission } from '../types'

export default function RolePermissionsPage() {
  const { id } = useParams()
  const roleId = Number(id)
  const { data: role } = useGetRole(roleId)
  const { data, isLoading, isError, error, refetch } = useGetRolePermissions(roleId)
  const removeMutation = useRemovePermissionFromRole()
  const {
    isOpen: isAssignOpen,
    onOpen: onAssignOpen,
    onClose: onAssignClose,
  } = useDisclosure()
  const {
    isOpen: isAlertOpen,
    onOpen: onAlertOpen,
    onClose: onAlertClose,
  } = useDisclosure()
  const cancelRef = React.useRef<HTMLButtonElement>(null)
  const [selectedPermission, setSelectedPermission] = React.useState<Permission | null>(null)

  const handleRemoveClick = (perm: Permission) => {
    setSelectedPermission(perm)
    onAlertOpen()
  }

  const confirmRemove = () => {
    if (selectedPermission) {
      removeMutation.mutate(
        { roleId, permissionId: selectedPermission.id },
        {
          onSuccess: () => {
            onAlertClose()
            setSelectedPermission(null)
          },
        },
      )
    }
  }

  return (
    <Box>
      <Button as={Link} to="/admin/roles" variant="link" mb={4}>
        &lt; Roles
      </Button>
      <Flex justify="space-between" align="center" mb={8}>
        <Heading as="h2" size="lg">
          {role ? `${role.name} Permission` : 'Permission'}
        </Heading>
        <Button leftIcon={<AddIcon />} colorScheme="teal" onClick={onAssignOpen}>
          Assign Permission
        </Button>
      </Flex>

      {isLoading ? (
        <Table
          variant="striped"
          colorScheme="gray"
          size="sm"
          sx={{
            'th, td': { py: 2, px: 3, fontSize: 'sm' },
            'thead th': {
              position: 'sticky',
              top: 0,
              zIndex: 1,
              bg: 'gray.100',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontSize: 'xs',
              color: 'gray.500',
            },
            'tbody tr:hover td': { bg: 'gray.100' },
          }}
        >
          <Thead>
            <Tr>
              <Th textAlign="right" width="6ch">ID</Th>
              <Th>Name</Th>
              <Th textAlign="right" width="140px">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <Tr key={i}>
                <Td textAlign="right" width="6ch">
                  <Skeleton height="16px" />
                </Td>
                <Td>
                  <Skeleton height="16px" />
                </Td>
                <Td textAlign="right">
                  <Skeleton height="16px" />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : isError ? (
        <Center py={10}>
          <Stack spacing={2} align="center">
            <Heading size="md">Error</Heading>
            <Text color="red.500">{error?.message || 'Failed to load permissions'}</Text>
            <Button onClick={() => refetch()}>Retry</Button>
          </Stack>
        </Center>
      ) : data && data.length === 0 ? (
        <Center py={10}>
          <Stack spacing={2} align="center">
            <Heading size="md">Tidak ada hasil</Heading>
            <Text color="gray.500">Belum ada permission pada role ini</Text>
          </Stack>
        </Center>
      ) : (
        data && (
          <Table
            variant="striped"
            colorScheme="gray"
            size="sm"
            sx={{
              'th, td': { py: 2, px: 3, fontSize: 'sm' },
              'thead th': {
                position: 'sticky',
                top: 0,
                zIndex: 1,
                bg: 'gray.100',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: 'xs',
                color: 'gray.500',
              },
              'tbody tr:hover td': { bg: 'teal.50' },
            }}
          >
            <Thead>
              <Tr>
                <Th textAlign="right" width="6ch">ID</Th>
                <Th>Name</Th>
                <Th textAlign="right" width="140px">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.map((perm) => (
                <Tr key={perm.id}>
                  <Td textAlign="right" width="6ch">{perm.id}</Td>
                  <Td>
                    <Text fontFamily="mono" fontWeight="medium">{perm.name}</Text>
                  </Td>
                  <Td textAlign="right">
                    <HStack spacing={2} justify="flex-end">
                      <IconButton
                        aria-label="Remove permission"
                        icon={<DeleteIcon />}
                        colorScheme="red"
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveClick(perm)}
                        isLoading={removeMutation.isPending}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )
      )}

      <AlertDialog isOpen={isAlertOpen} leastDestructiveRef={cancelRef} onClose={onAlertClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Remove Permission
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertClose}>
                No
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmRemove}
                ml={3}
                isLoading={removeMutation.isPending}
              >
                Yes
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <AssignPermissionModal
        isOpen={isAssignOpen}
        onClose={onAssignClose}
        roleId={roleId}
      />
    </Box>
  )
}
