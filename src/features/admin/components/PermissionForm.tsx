import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Code,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Select,
  ModalBody,
  ModalFooter,
  Stack,
  Text,
  Textarea,
  useClipboard,
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { FiCheck, FiCopy } from 'react-icons/fi'

import type { PermissionRequest } from '@/features/admin/types'
import { bulkActionOptions, permissionFormSchema, singleActionOptions } from '@/features/admin/types/permission.zod'

interface PermissionFormProps {
  initialValues?: { name?: string; description?: string | null }
  mode: 'create' | 'edit'
  existingPermissionNames: string[]
  currentName?: string
  onSubmit: (payload: PermissionRequest[]) => Promise<void> | void
  onCancel: () => void
  isSubmitting: boolean
  serviceInputRef?: React.MutableRefObject<HTMLInputElement | null> | null
}

const sanitizeNamePart = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')

type SingleAction = (typeof singleActionOptions)[number]
type BulkAction = (typeof bulkActionOptions)[number]

const isSingleAction = (value: string): value is SingleAction =>
  (singleActionOptions as readonly string[]).includes(value)

const isBulkAction = (value: string): value is BulkAction =>
  (bulkActionOptions as readonly string[]).includes(value)

type PermissionFormValues = {
  service: string
  subject: string
  action: SingleAction
  description?: string
  bulkActions?: BulkAction[]
}

const buildDefaultValues = (
  initialValues?: PermissionFormProps['initialValues'],
): PermissionFormValues => {
  const fallback: PermissionFormValues = {
    service: '',
    subject: '',
    action: 'read',
    description: initialValues?.description?.trim() ?? '',
    bulkActions: [],
  }

  if (!initialValues?.name) return fallback

  const normalized = initialValues.name.trim().toLowerCase()
  const [serviceRaw = '', subjectRaw = '', ...rest] = normalized.split(':')
  const actionRaw = rest.length > 0 ? rest.join(':') : ''

  const service = sanitizeNamePart(serviceRaw)
  const subject = sanitizeNamePart(subjectRaw)
  const actionCandidate = sanitizeNamePart(actionRaw)

  return {
    service,
    subject,
    action: isSingleAction(actionCandidate) ? actionCandidate : 'read',
    description: initialValues.description?.trim() ?? '',
    bulkActions: [],
  }
}

const actionSelectBaseOptions: SingleAction[] = ['read', 'write', 'update', 'delete']

export const PermissionForm = ({
  initialValues,
  mode,
  existingPermissionNames,
  currentName,
  onSubmit,
  onCancel,
  isSubmitting,
  serviceInputRef,
}: PermissionFormProps) => {
  const defaultValues = React.useMemo(() => buildDefaultValues(initialValues), [initialValues])

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionFormSchema),
    mode: 'onChange',
    defaultValues,
  })

  React.useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const serviceValue = watch('service')
  const subjectValue = watch('subject')
  const actionValue = watch('action')
  const bulkActions = watch('bulkActions')
  const descriptionValue = watch('description') ?? ''

  const serviceListId = React.useId()
  const subjectListId = React.useId()

  const suggestions = React.useMemo(() => {
    const serviceSet = new Set<string>()
    const subjectSet = new Set<string>()
    for (const name of existingPermissionNames) {
      const normalized = name.trim().toLowerCase()
      const [service, subject] = normalized.split(':')
      if (service) serviceSet.add(service)
      if (subject) subjectSet.add(subject)
    }
    return {
      services: Array.from(serviceSet).sort(),
      subjects: Array.from(subjectSet).sort(),
    }
  }, [existingPermissionNames])

  const handleNamePartChange = React.useCallback(
    (field: 'service' | 'subject', value: string) => {
      const sanitized = sanitizeNamePart(value)
      setValue(field, sanitized, { shouldValidate: true, shouldDirty: true })
    },
    [setValue],
  )

  const handleActionChange = React.useCallback(
    (value: string) => {
      const sanitized = sanitizeNamePart(value)
      if (isSingleAction(sanitized)) {
        setValue('action', sanitized, { shouldValidate: true, shouldDirty: true })
      }
    },
    [setValue],
  )

  const previewNames = React.useMemo(() => {
    if (!serviceValue || !subjectValue) return []
    const hasBulkSelection =
      mode === 'create' && Array.isArray(bulkActions) && bulkActions.length > 0
    const actionsSource = hasBulkSelection ? bulkActions : [actionValue]
    const uniqueActions = Array.from(new Set(actionsSource))
    return uniqueActions.map((action) => `${serviceValue}:${subjectValue}:${action}`)
  }, [actionValue, bulkActions, mode, serviceValue, subjectValue])

  const normalizedExisting = React.useMemo(() => {
    const set = new Set<string>()
    for (const name of existingPermissionNames) {
      set.add(name.trim().toLowerCase())
    }
    return set
  }, [existingPermissionNames])

  const normalizedCurrentName = currentName?.trim().toLowerCase() ?? null

  const duplicateNames = React.useMemo(() => {
    if (previewNames.length === 0) return []
    return Array.from(
      new Set(
        previewNames.filter((name) => normalizedExisting.has(name) && name !== normalizedCurrentName),
      ),
    )
  }, [normalizedCurrentName, normalizedExisting, previewNames])

  const hasDuplicates = duplicateNames.length > 0

  const { hasCopied, onCopy, setValue: setClipboardValue } = useClipboard('')

  React.useEffect(() => {
    setClipboardValue(previewNames.join('\n'))
  }, [previewNames, setClipboardValue])

  const descriptionRef = React.useRef<HTMLTextAreaElement | null>(null)
  const adjustTextareaHeight = React.useCallback((element: HTMLTextAreaElement) => {
    const computedLineHeight = window.getComputedStyle(element).lineHeight || '20'
    const parsedLineHeight = Number.parseFloat(computedLineHeight)
    const lineHeight = Number.isFinite(parsedLineHeight) && parsedLineHeight > 0 ? parsedLineHeight : 20
    const maxHeight = lineHeight * 8
    element.style.height = 'auto'
    const next = Math.min(element.scrollHeight, maxHeight)
    element.style.height = `${next}px`
    element.style.overflowY = element.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }, [])

  React.useEffect(() => {
    if (descriptionRef.current) {
      adjustTextareaHeight(descriptionRef.current)
    }
  }, [adjustTextareaHeight, descriptionValue])

  const descriptionRegister = register('description')
  const serviceRegister = register('service')
  const subjectRegister = register('subject')

  const actionOptionsForSelect = React.useMemo(() => {
    const base = [...actionSelectBaseOptions]
    if (actionValue === 'create' && !base.includes('create')) base.push('create')
    return base
  }, [actionValue])

  const isSaveDisabled =
    !isValid || previewNames.length === 0 || hasDuplicates || isSubmitting

  const onFormSubmit = handleSubmit((values) => {
    const selectedBulkActions = values.bulkActions ?? []
    const actions =
      mode === 'create' && selectedBulkActions.length > 0 ? selectedBulkActions : [values.action]
    const uniqueActions = Array.from(new Set(actions))
    const description = values.description?.trim()
    const payload: PermissionRequest[] = uniqueActions.map((action) => ({
      name: `${values.service}:${values.subject}:${action}`,
      description: description ? description : undefined,
    }))
    return onSubmit(payload)
  })

  const descriptionLength = descriptionValue.length

  return (
    <Box as="form" onSubmit={onFormSubmit} noValidate>
      <ModalBody>
        <Stack spacing={6}>
          <Stack spacing={4}>
            <FormControl isInvalid={!!errors.service}>
              <FormLabel htmlFor="service">Service</FormLabel>
              <Input
                id="service"
                name={serviceRegister.name}
                value={serviceValue}
                onChange={(event) => handleNamePartChange('service', event.target.value)}
                onBlur={serviceRegister.onBlur}
                ref={(node) => {
                  serviceRegister.ref(node)
                  if (serviceInputRef) {
                    serviceInputRef.current = node
                  }
                }}
                autoComplete="off"
                placeholder="mis. iam"
                list={suggestions.services.length > 0 ? serviceListId : undefined}
              />
              {suggestions.services.length > 0 && (
                <datalist id={serviceListId}>
                  {suggestions.services.map((service) => (
                    <option key={service} value={service} />
                  ))}
                </datalist>
              )}
              <FormErrorMessage>{errors.service?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.subject}>
              <FormLabel htmlFor="subject">Subject</FormLabel>
              <Input
                id="subject"
                name={subjectRegister.name}
                value={subjectValue}
                onChange={(event) => handleNamePartChange('subject', event.target.value)}
                onBlur={subjectRegister.onBlur}
                ref={subjectRegister.ref}
                autoComplete="off"
                placeholder="mis. permission"
                list={suggestions.subjects.length > 0 ? subjectListId : undefined}
              />
              {suggestions.subjects.length > 0 && (
                <datalist id={subjectListId}>
                  {suggestions.subjects.map((subject) => (
                    <option key={subject} value={subject} />
                  ))}
                </datalist>
              )}
              <FormErrorMessage>{errors.subject?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.action}>
              <FormLabel htmlFor="action">Action</FormLabel>
              <Select
                id="action"
                name="action"
                value={actionValue}
                onChange={(event) => handleActionChange(event.target.value)}
              >
                {actionOptionsForSelect.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{errors.action?.message}</FormErrorMessage>
            </FormControl>
          </Stack>

          {mode === 'create' && (
            <Stack spacing={3}>
              <Text fontWeight="semibold" fontSize="sm">
                Bulk Create (opsional)
              </Text>
              <Controller
                control={control}
                name="bulkActions"
                render={({ field: { value, onChange } }) => (
                  <CheckboxGroup
                    value={value ?? []}
                    onChange={(vals) => {
                      const next = Array.isArray(vals)
                        ? vals
                            .map((v) => v.toString().toLowerCase())
                            .filter((v): v is BulkAction => isBulkAction(v))
                        : []
                      onChange(Array.from(new Set(next)))
                    }}
                  >
                    <HStack spacing={4} wrap="wrap">
                      {bulkActionOptions.map((action) => (
                        <Checkbox key={action} value={action}>
                          {action}
                        </Checkbox>
                      ))}
                    </HStack>
                  </CheckboxGroup>
                )}
              />
              <Text fontSize="sm" color="gray.600">
                Pilih beberapa aksi untuk membuat permission sekaligus. Setiap aksi akan dikirim dalam
                request terpisah.
              </Text>
            </Stack>
          )}

          <Stack spacing={3}>
            <Text fontWeight="semibold" fontSize="sm">
              Preview
            </Text>
            {previewNames.length === 0 ? (
              <Text fontSize="sm" color="gray.500">
                Lengkapi Service, Subject, dan Action untuk melihat preview.
              </Text>
            ) : (
              <Stack spacing={1}>
                {previewNames.map((name) => (
                  <Code key={name} display="block" p={2} borderRadius="md" fontFamily="mono">
                    {name}
                  </Code>
                ))}
              </Stack>
            )}
            <Flex justify="space-between" align="center">
              <Text fontSize="sm" color="gray.600">
                {previewNames.length} {previewNames.length === 1 ? 'permission' : 'permissions'}
              </Text>
              <IconButton
                aria-label="Copy permission preview"
                icon={hasCopied ? <FiCheck /> : <FiCopy />}
                onClick={onCopy}
                isDisabled={previewNames.length === 0}
                size="sm"
                variant="ghost"
              />
            </Flex>
          </Stack>

          <FormControl isInvalid={!!errors.description}>
            <FormLabel htmlFor="description">Description</FormLabel>
            <Textarea
              id="description"
              name={descriptionRegister.name}
              value={descriptionValue}
              onChange={(event) => {
                descriptionRegister.onChange(event)
                if (event.target instanceof HTMLTextAreaElement) {
                  adjustTextareaHeight(event.target)
                }
              }}
              onBlur={descriptionRegister.onBlur}
              ref={(node) => {
                descriptionRegister.ref(node)
                descriptionRef.current = node
              }}
              rows={3}
              resize="none"
              maxLength={240}
              placeholder="Jelaskan detail izin"
            />
            <Flex justify="space-between" mt={2} align="center">
              <FormHelperText m={0} fontSize="sm">
                Jelaskan tujuan & cakupan izin. Hindari mengulang nama permission.
              </FormHelperText>
              <Text fontSize="xs" color={descriptionLength > 240 ? 'red.500' : 'gray.500'}>
                {descriptionLength}/240
              </Text>
            </Flex>
            <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
          </FormControl>
        </Stack>
      </ModalBody>

      <ModalFooter
        position="sticky"
        bottom={0}
        zIndex="docked"
        bg="white"
        borderTopWidth="1px"
        boxShadow="sm"
      >
        <Stack spacing={3} w="full">
          {hasDuplicates && (
            <Box
              borderRadius="md"
              borderWidth="1px"
              borderColor="red.200"
              bg="red.50"
              px={3}
              py={2}
            >
              <Text fontSize="sm" color="red.600">
                Permission sudah ada: {duplicateNames.join(', ')}
              </Text>
            </Box>
          )}
          <Flex justify="space-between" align="center" gap={3}>
            <Button onClick={onCancel} variant="ghost" type="button">
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              type="submit"
              isLoading={isSubmitting}
              isDisabled={isSaveDisabled}
            >
              Save
            </Button>
          </Flex>
        </Stack>
      </ModalFooter>
    </Box>
  )
}
