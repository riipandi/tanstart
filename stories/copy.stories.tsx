import type { Meta, StoryObj } from '@storybook/react-vite'
import * as Lucide from 'lucide-react'
import { Button } from '#/components/button'
import { Copy } from '#/components/copy'

const meta = {
  title: 'Components/Copy',
  component: Copy,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'mini']
    },
    content: {
      control: 'text'
    },
    copyMessage: {
      control: 'text'
    },
    copiedMessage: {
      control: 'text'
    }
  },
  tags: [], // ['autodocs']
  args: {},
  decorators: [
    (Story) => (
      <div className='flex w-full min-w-md items-center justify-center'>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof Copy>

export default meta
type Story = StoryObj<typeof meta>

// Basic usage
export const Default: Story = {
  args: {
    content: 'Hello, world!'
  }
}

export const MiniButton: Story = {
  args: {
    content: 'Mini copy',
    variant: 'mini'
  }
}

export const WithButton: Story = {
  render: (args) => (
    <Copy
      {...args}
      render={
        <Button variant='outline' size='sm'>
          {args.content}
        </Button>
      }
    />
  ),
  args: {
    content: 'user@email.com'
  }
}

export const CustomIcon: Story = {
  render: (args) => (
    <Copy {...args}>
      <Lucide.ClipboardEdit className='hover: text-foreground-neutral-faded-foreground size-4' />
    </Copy>
  ),
  args: {
    content: 'Custom icon'
  }
}

// Custom trigger (children)
export const CustomTrigger: Story = {
  render: (args) => (
    <Copy {...args}>
      <button type='button' className='rounded bg-zinc-100 px-3 py-1 text-xs hover:bg-zinc-200'>
        Custom Child Trigger
      </button>
    </Copy>
  ),
  args: {
    content: 'child-content'
  }
}

export const CustomDisplay: Story = {
  render: (args) => (
    <Copy {...args}>
      <code className='bg-background-neutral-faded rounded-lg px-2 py-1 font-mono text-sm'>
        pnpm add @twistail/react
      </code>
    </Copy>
  ),
  args: {
    content: 'pnpm add @twistail/react'
  }
}

export const Disabled: Story = {
  render: (args) => (
    <Copy
      {...args}
      render={
        <Button variant='outline' size='sm' disabled>
          Disabled Copy
        </Button>
      }
    />
  ),
  args: {
    content: 'disabled'
  }
}

export const CustomMessages: Story = {
  args: {
    content: 'npm install my-lib',
    copyMessage: 'Copy to clipboard',
    copiedMessage: 'Successfully copied!'
  }
}
