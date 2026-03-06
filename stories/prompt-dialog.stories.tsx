import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '#/components/button'
import { PromptDialog, PromptDialogTrigger, PromptDialogContent } from '#/components/prompt-dialog'
import { toast, Toast } from '#/components/toast'

const meta = {
  title: 'Components/PromptDialog',
  component: PromptDialog,
  parameters: { layout: 'centered' },
  argTypes: {},
  tags: [], // ['autodocs']
  args: {},
  decorators: [
    (Story) => (
      <div className='flex w-full min-w-md items-center justify-center'>
        <Story />
        <Toast position='bottom-right' />
      </div>
    )
  ]
} satisfies Meta<typeof PromptDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Example: Story = {
  render: () => (
    <div className='flex w-full max-w-md items-center justify-center'>
      <PromptDialog>
        <PromptDialogTrigger render={<Button variant='primary' />}>
          Open Basic Dialog
        </PromptDialogTrigger>
        <PromptDialogContent
          title='Confirm Action'
          description='Are you sure you want to continue?'
          onConfirm={() =>
            toast.add({
              title: 'Action performed',
              description: 'Action performed successfully',
              type: 'success'
            })
          }
        />
      </PromptDialog>
    </div>
  )
}

// With verification text
export const WithVerification: Story = {
  render: () => {
    return (
      <PromptDialog>
        <PromptDialogTrigger render={<Button variant='danger' />}>
          Delete Entity
        </PromptDialogTrigger>
        <PromptDialogContent
          title='Please confirm'
          description='Are you sure you want to delete this entity?'
          verificationInstruction='Type {val} to confirm:'
          verificationText='DELETE'
          variant='danger'
          onConfirm={() =>
            toast.add({
              title: 'Entity deleted',
              description: 'Entity deleted successfully',
              type: 'success'
            })
          }
        />
      </PromptDialog>
    )
  }
}

// Custom button text & variant
export const CustomButtonText: Story = {
  render: () => {
    return (
      <PromptDialog>
        <PromptDialogTrigger render={<Button variant='primary' />}>Archive</PromptDialogTrigger>
        <PromptDialogContent
          title='Archive Item'
          description='Do you want to archive this item? You can restore it later.'
          confirmText='Archive'
          cancelText='No, Cancel'
          variant='confirmation'
          onConfirm={() =>
            toast.add({
              title: 'Item archived',
              description: 'Item archived successfully',
              type: 'error'
            })
          }
        />
      </PromptDialog>
    )
  }
}

// Disabled confirm until verification
export const DisabledConfirm: Story = {
  render: () => {
    return (
      <PromptDialog>
        <PromptDialogTrigger render={<Button variant='danger' />}>
          Dangerous Action
        </PromptDialogTrigger>
        <PromptDialogContent
          title='Dangerous Action'
          description='This action cannot be undone.'
          verificationInstruction='Type {val} to confirm:'
          verificationText='CONFIRM'
          variant='danger'
          confirmText='Proceed'
          cancelText='Abort'
          onConfirm={() =>
            toast.add({
              title: 'Dangerous action confirmed',
              description: 'Dangerous action confirmed successfully',
              type: 'error'
            })
          }
        />
      </PromptDialog>
    )
  }
}
