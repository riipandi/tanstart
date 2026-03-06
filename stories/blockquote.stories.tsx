import type { Meta, StoryObj } from '@storybook/react-vite'
import { Blockquote, BlockquoteAuthor } from '#/components/blockquote'

const meta = {
  title: 'Components/Blockquote',
  component: Blockquote,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'muted', 'primary', 'danger', 'success', 'warning']
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg']
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
} satisfies Meta<typeof Blockquote>

export default meta
type Story = StoryObj<typeof meta>

// Basic
export const Default: Story = {
  render: () => (
    <Blockquote className='max-w-2xl'>
      The only way to do great work is to love what you do.
      <BlockquoteAuthor>Steve Jobs</BlockquoteAuthor>
    </Blockquote>
  )
}

export const WithoutAuthor: Story = {
  render: () => (
    <Blockquote className='max-w-2xl'>
      The only way to do great work is to love what you do.
    </Blockquote>
  )
}

// Variants
export const VariantDefault: Story = {
  args: {
    variant: 'default'
  },
  render: (args) => (
    <Blockquote {...args} className='max-w-2xl'>
      Design is not just what it looks like and feels like. Design is how it works.
      <BlockquoteAuthor>Steve Jobs</BlockquoteAuthor>
    </Blockquote>
  )
}

export const VariantMuted: Story = {
  args: {
    variant: 'muted'
  },
  render: (args) => (
    <Blockquote {...args} className='max-w-2xl'>
      Simplicity is the ultimate sophistication.
      <BlockquoteAuthor>Leonardo da Vinci</BlockquoteAuthor>
    </Blockquote>
  )
}

export const VariantPrimary: Story = {
  args: {
    variant: 'primary'
  },
  render: (args) => (
    <Blockquote {...args} className='max-w-2xl'>
      Innovation distinguishes between a leader and a follower.
      <BlockquoteAuthor>Steve Jobs</BlockquoteAuthor>
    </Blockquote>
  )
}

export const VariantDanger: Story = {
  args: {
    variant: 'danger'
  },
  render: (args) => (
    <Blockquote {...args} className='max-w-2xl'>
      Failure is simply the opportunity to begin again, this time more intelligently.
      <BlockquoteAuthor>Henry Ford</BlockquoteAuthor>
    </Blockquote>
  )
}

export const VariantSuccess: Story = {
  args: {
    variant: 'success'
  },
  render: (args) => (
    <Blockquote {...args} className='max-w-2xl'>
      Success is not final, failure is not fatal: it is the courage to continue that counts.
      <BlockquoteAuthor>Winston Churchill</BlockquoteAuthor>
    </Blockquote>
  )
}

export const VariantWarning: Story = {
  args: {
    variant: 'warning'
  },
  render: (args) => (
    <Blockquote {...args} className='max-w-2xl'>
      The greatest glory in living lies not in never falling, but in rising every time we fall.
      <BlockquoteAuthor>Nelson Mandela</BlockquoteAuthor>
    </Blockquote>
  )
}

// Sizes
export const SizeSmall: Story = {
  args: {
    size: 'sm'
  },
  render: (args) => (
    <Blockquote {...args} className='max-w-xl'>
      Small blockquote example.
      <BlockquoteAuthor>Author Name</BlockquoteAuthor>
    </Blockquote>
  )
}

export const SizeMedium: Story = {
  args: {
    size: 'md'
  },
  render: (args) => (
    <Blockquote {...args} className='max-w-2xl'>
      Medium blockquote example with more content to showcase the default size.
      <BlockquoteAuthor>Author Name</BlockquoteAuthor>
    </Blockquote>
  )
}

export const SizeLarge: Story = {
  args: {
    size: 'lg'
  },
  render: (args) => (
    <Blockquote {...args} className='max-w-3xl'>
      Large blockquote example with even more content to demonstrate how the larger size handles
      longer quotations effectively.
      <BlockquoteAuthor>Author Name</BlockquoteAuthor>
    </Blockquote>
  )
}

// Long Content
export const LongQuote: Story = {
  render: () => (
    <Blockquote className='max-w-3xl'>
      Your work is going to fill a large part of your life, and the only way to be truly satisfied
      is to do what you believe is great work. And the only way to do great work is to love what you
      do. If you haven't found it yet, keep looking. Don't settle. As with all matters of the heart,
      you'll know when you find it.
      <BlockquoteAuthor>Steve Jobs</BlockquoteAuthor>
    </Blockquote>
  )
}

// Multiple Authors
export const MultipleAuthors: Story = {
  render: () => (
    <div className='space-y-6'>
      <Blockquote className='max-w-2xl'>
        The future belongs to those who believe in the beauty of their dreams.
        <BlockquoteAuthor>Eleanor Roosevelt</BlockquoteAuthor>
      </Blockquote>
      <Blockquote variant='primary' className='max-w-2xl'>
        Be yourself; everyone else is already taken.
        <BlockquoteAuthor>Oscar Wilde</BlockquoteAuthor>
      </Blockquote>
      <Blockquote variant='muted' className='max-w-2xl'>
        In three words I can sum up everything I've learned about life: it goes on.
        <BlockquoteAuthor>Robert Frost</BlockquoteAuthor>
      </Blockquote>
    </div>
  )
}

// Article Example
export const ArticleExample: Story = {
  render: () => (
    <article className='max-w-3xl space-y-6'>
      <h1 className='text-3xl font-bold'>The Power of Great Design</h1>
      <p className='text-foreground-neutral-faded-foreground'>
        Design is more than just aesthetics—it's about solving problems and creating meaningful
        experiences for users.
      </p>

      <p>
        Throughout history, great designers have understood that their work goes beyond making
        things look beautiful. It's about creating solutions that work seamlessly and intuitively.
      </p>

      <Blockquote variant='primary'>
        Design is not just what it looks like and feels like. Design is how it works.
        <BlockquoteAuthor>Steve Jobs</BlockquoteAuthor>
      </Blockquote>

      <p>
        This philosophy has guided countless innovations in technology and design. When we focus on
        how things work, not just how they look, we create products that truly serve their users.
      </p>

      <Blockquote variant='muted' size='sm'>
        Simplicity is the ultimate sophistication.
        <BlockquoteAuthor>Leonardo da Vinci</BlockquoteAuthor>
      </Blockquote>

      <p>
        By embracing simplicity and focusing on function, designers can create experiences that are
        both beautiful and effective.
      </p>
    </article>
  )
}

// Testimonial Example
export const TestimonialExample: Story = {
  render: () => (
    <div className='max-w-4xl space-y-8'>
      <h2 className='text-2xl font-bold'>What Our Customers Say</h2>

      <div className='grid gap-6 md:grid-cols-2'>
        <Blockquote variant='success' size='sm'>
          This product has completely transformed how our team works. Highly recommended!
          <BlockquoteAuthor>Sarah Johnson, CEO at TechCorp</BlockquoteAuthor>
        </Blockquote>

        <Blockquote variant='primary' size='sm'>
          The best investment we've made this year. The results speak for themselves.
          <BlockquoteAuthor>Michael Chen, CTO at StartupXYZ</BlockquoteAuthor>
        </Blockquote>

        <Blockquote variant='default' size='sm'>
          Outstanding support and incredible features. Worth every penny!
          <BlockquoteAuthor>Emily Rodriguez, Designer</BlockquoteAuthor>
        </Blockquote>

        <Blockquote variant='muted' size='sm'>
          Simple, powerful, and exactly what we needed. Can't imagine working without it.
          <BlockquoteAuthor>David Kim, Product Manager</BlockquoteAuthor>
        </Blockquote>
      </div>
    </div>
  )
}

// Showcase
export const AllVariants: Story = {
  render: () => (
    <div className='space-y-6'>
      <Blockquote variant='default' className='max-w-2xl'>
        Default variant blockquote
        <BlockquoteAuthor>Author Name</BlockquoteAuthor>
      </Blockquote>

      <Blockquote variant='muted' className='max-w-2xl'>
        Muted variant blockquote
        <BlockquoteAuthor>Author Name</BlockquoteAuthor>
      </Blockquote>

      <Blockquote variant='primary' className='max-w-2xl'>
        Primary variant blockquote
        <BlockquoteAuthor>Author Name</BlockquoteAuthor>
      </Blockquote>

      <Blockquote variant='danger' className='max-w-2xl'>
        Danger variant blockquote
        <BlockquoteAuthor>Author Name</BlockquoteAuthor>
      </Blockquote>

      <Blockquote variant='success' className='max-w-2xl'>
        Success variant blockquote
        <BlockquoteAuthor>Author Name</BlockquoteAuthor>
      </Blockquote>

      <Blockquote variant='warning' className='max-w-2xl'>
        Warning variant blockquote
        <BlockquoteAuthor>Author Name</BlockquoteAuthor>
      </Blockquote>
    </div>
  )
}

export const AllSizes: Story = {
  render: () => (
    <div className='space-y-6'>
      <Blockquote size='sm' className='max-w-xl'>
        Small size blockquote example
        <BlockquoteAuthor>Author Name</BlockquoteAuthor>
      </Blockquote>

      <Blockquote size='md' className='max-w-2xl'>
        Medium size blockquote example
        <BlockquoteAuthor>Author Name</BlockquoteAuthor>
      </Blockquote>

      <Blockquote size='lg' className='max-w-3xl'>
        Large size blockquote example
        <BlockquoteAuthor>Author Name</BlockquoteAuthor>
      </Blockquote>
    </div>
  )
}

// Blog Post Example
export const BlogPostExample: Story = {
  render: () => (
    <article className='max-w-3xl space-y-6'>
      <header className='space-y-2'>
        <h1 className='text-4xl font-bold'>The Art of Minimalism in Design</h1>
        <p className='text-foreground-neutral-faded-foreground'>
          Exploring how less can truly be more in modern design
        </p>
      </header>

      <p>
        Minimalism has become one of the most influential design philosophies of our time. It's not
        just about removing elements—it's about finding the essence of what matters.
      </p>

      <Blockquote variant='primary' size='lg'>
        Perfection is achieved, not when there is nothing more to add, but when there is nothing
        left to take away.
        <BlockquoteAuthor>Antoine de Saint-Exupéry</BlockquoteAuthor>
      </Blockquote>

      <p>
        This principle guides designers to focus on what truly matters, removing distractions and
        highlighting the core message or functionality.
      </p>

      <div className='bg-background-neutral-faded rounded-lg p-6'>
        <Blockquote variant='muted' size='sm'>
          Less is more.
          <BlockquoteAuthor>Ludwig Mies van der Rohe</BlockquoteAuthor>
        </Blockquote>
      </div>

      <p>
        By embracing minimalism, we create designs that are timeless, elegant, and highly
        functional—qualities that resonate with users across all platforms and devices.
      </p>
    </article>
  )
}
