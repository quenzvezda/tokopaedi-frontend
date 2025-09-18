import { ChakraProvider, Modal, ModalContent, ModalOverlay } from '@chakra-ui/react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { type ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { PermissionForm } from '../components/PermissionForm'

type PermissionFormProps = ComponentProps<typeof PermissionForm>

const renderPermissionForm = (props?: Partial<PermissionFormProps>) => {
  const onSubmit = props?.onSubmit ?? vi.fn().mockResolvedValue(undefined)
  const mergedProps: PermissionFormProps = {
    mode: props?.mode ?? 'create',
    existingPermissionNames: props?.existingPermissionNames ?? [],
    onSubmit,
    onCancel: props?.onCancel ?? vi.fn(),
    isSubmitting: props?.isSubmitting ?? false,
    initialValues: props?.initialValues,
    currentName: props?.currentName,
    serviceInputRef: props?.serviceInputRef,
  }

  const result = render(
    <ChakraProvider>
      <Modal isOpen onClose={() => {}} trapFocus={false} blockScrollOnMount={false}>
        <ModalOverlay />
        <ModalContent>
          <PermissionForm {...mergedProps} />
        </ModalContent>
      </Modal>
    </ChakraProvider>,
  )

  return { ...result, onSubmit }
}

describe('PermissionForm', () => {
  it('builds permission name from parts and submits sanitized payload', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderPermissionForm()

    const serviceInput = await screen.findByLabelText(/Service/i)
    await user.type(serviceInput, ' IAM ')

    const subjectInput = screen.getByLabelText(/Subject/i)
    await user.type(subjectInput, ' Permission ')

    const actionSelect = screen.getByLabelText(/Action/i)
    await user.selectOptions(actionSelect, 'write')

    const saveButton = screen.getByRole('button', { name: /save/i })
    await waitFor(() => expect(saveButton).toBeEnabled())

    await user.click(saveButton)

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit).toHaveBeenCalledWith([
      { name: 'iam:permission:write', description: undefined },
    ])
  })

  it('prevents saving duplicate permission names', async () => {
    const user = userEvent.setup()
    renderPermissionForm({ existingPermissionNames: ['iam:permission:read'] })

    const serviceInput = await screen.findByLabelText(/Service/i)
    await user.type(serviceInput, 'iam')

    const subjectInput = screen.getByLabelText(/Subject/i)
    await user.type(subjectInput, 'permission')

    const duplicateWarning = await screen.findByText(/Permission sudah ada/i)
    expect(duplicateWarning).toBeInTheDocument()

    const saveButton = screen.getByRole('button', { name: /save/i })
    expect(saveButton).toBeDisabled()
  })

  it('submits multiple payloads when bulk actions selected', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderPermissionForm()

    const serviceInput = await screen.findByLabelText(/Service/i)
    await user.type(serviceInput, 'catalog')

    const subjectInput = screen.getByLabelText(/Subject/i)
    await user.type(subjectInput, 'product')

    await user.click(screen.getByLabelText(/^read$/i))
    await user.click(screen.getByLabelText(/^update$/i))

    const saveButton = screen.getByRole('button', { name: /save/i })
    await waitFor(() => expect(saveButton).toBeEnabled())

    await user.click(saveButton)

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit).toHaveBeenCalledWith([
      { name: 'catalog:product:read', description: undefined },
      { name: 'catalog:product:update', description: undefined },
    ])
  })
})
