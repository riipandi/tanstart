import type { Meta, StoryObj } from '@storybook/react-vite'
import { Skeleton } from '#/components/skeleton'
import { Stack } from '#/components/stack'

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  parameters: { layout: 'centered' },
  argTypes: {},
  tags: [],
  args: {},
  decorators: [
    (Story) => (
      <div className='flex w-full min-w-md items-center justify-center p-4'>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Example: Story = {
  args: {},
  render: () => (
    <div className='flex w-80 flex-col gap-3'>
      <Skeleton className='h-12 w-12 rounded-full' />
      <Skeleton className='h-4 w-full' />
      <Skeleton className='h-4 w-5/6' />
    </div>
  )
}

export const Sizes: Story = {
  args: {},
  render: () => (
    <div className='flex flex-col gap-4'>
      <Skeleton className='h-4 w-32' />
      <Skeleton className='h-6 w-40' />
      <Skeleton className='h-8 w-48' />
      <Skeleton className='h-12 w-56' />
      <Skeleton className='h-16 w-64' />
    </div>
  )
}

export const Circle: Story = {
  args: {},
  render: () => (
    <div className='flex items-center gap-4'>
      <Skeleton className='h-8 w-8 rounded-full' />
      <Skeleton className='h-12 w-12 rounded-full' />
      <Skeleton className='h-16 w-16 rounded-full' />
      <Skeleton className='h-20 w-20 rounded-full' />
    </div>
  )
}

export const Card: Story = {
  args: {},
  render: () => (
    <div className='border-border-neutral w-80 rounded-md border p-4'>
      <Stack>
        <div className='flex items-center gap-3'>
          <Skeleton className='h-10 w-10 rounded-full' />
          <div className='flex flex-1 flex-col gap-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-3 w-32' />
          </div>
        </div>
        <Skeleton className='h-32 w-full' />
        <div className='flex flex-col gap-2'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-5/6' />
          <Skeleton className='h-4 w-4/6' />
        </div>
      </Stack>
    </div>
  )
}

export const List: Story = {
  args: {},
  render: () => (
    <div className='border-border-neutral w-80 rounded-md border p-4'>
      <Stack>
        {Array.from({ length: 5 }, (_, i) => i + 1).map((num) => (
          <div key={num} className='flex items-center gap-3'>
            <Skeleton className='h-10 w-10 shrink-0 rounded-full' />
            <div className='flex flex-1 flex-col gap-2'>
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-3 w-48' />
            </div>
          </div>
        ))}
      </Stack>
    </div>
  )
}

export const Form: Story = {
  args: {},
  render: () => (
    <div className='border-border-neutral w-80 rounded-md border p-4'>
      <Stack>
        <Skeleton className='h-6 w-48' />
        <div className='flex flex-col gap-2'>
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-10 w-full' />
        </div>
        <div className='flex flex-col gap-2'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-10 w-full' />
        </div>
        <div className='flex flex-col gap-2'>
          <Skeleton className='h-4 w-16' />
          <Skeleton className='h-24 w-full' />
        </div>
        <Skeleton className='h-10 w-full' />
      </Stack>
    </div>
  )
}

export const Table: Story = {
  args: {},
  render: () => (
    <div className='border-border-neutral w-full overflow-x-auto rounded-md border'>
      <div className='flex flex-col gap-1 p-4'>
        <div className='border-border-neutral flex gap-4 border-b pb-2'>
          <Skeleton className='h-6 flex-1' />
          <Skeleton className='h-6 flex-1' />
          <Skeleton className='h-6 flex-1' />
          <Skeleton className='h-6 flex-1' />
        </div>
        {Array.from({ length: 5 }, (_, i) => i + 1).map((num) => (
          <div key={num} className='flex gap-4 py-2'>
            <Skeleton className='h-10 flex-1' />
            <Skeleton className='h-10 flex-1' />
            <Skeleton className='h-10 flex-1' />
            <Skeleton className='h-10 flex-1' />
          </div>
        ))}
      </div>
    </div>
  )
}

export const AvatarGroup: Story = {
  args: {},
  render: () => (
    <div className='flex items-center gap-2'>
      {Array.from({ length: 5 }, (_, i) => i + 1).map((num) => (
        <Skeleton key={num} className='h-10 w-10 rounded-full' />
      ))}
    </div>
  )
}

export const Gallery: Story = {
  args: {},
  render: () => (
    <div className='border-border-neutral grid w-80 grid-cols-2 gap-3 rounded-md border p-4'>
      {Array.from({ length: 6 }, (_, i) => i + 1).map((num) => (
        <div key={num} className='flex flex-col gap-2'>
          <Skeleton className='h-24 w-full' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-3 w-2/3' />
        </div>
      ))}
    </div>
  )
}
