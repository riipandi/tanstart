import type { Meta, StoryObj } from '@storybook/react-vite'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { Link, LinkIcon } from '#/components/link'
import { Heading, Text } from '#/components/typography'

const meta = {
  title: 'Components/Link',
  component: Link,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'muted', 'primary', 'secondary', 'danger'],
      description: 'Visual style variant'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Text size'
    },
    underline: {
      control: 'select',
      options: ['none', 'hover', 'always'],
      description: 'Underline behavior'
    },
    href: {
      control: 'text',
      description: 'Link destination'
    }
  },
  tags: [],
  args: {},
  decorators: [
    (Story) => (
      <div className='flex w-full min-w-md items-center justify-center'>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof Link>

export default meta
type Story = StoryObj<typeof meta>

export const Example: Story = {
  render: () => (
    <div className='mx-auto flex w-full max-w-lg items-center justify-center space-y-4'>
      <Link href='#'>
        Click me
        <LinkIcon />
      </Link>
    </div>
  )
}

// Variants
export const Variants: Story = {
  render: () => (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-2'>
        <p className='text-foreground-neutral-faded text-sm font-medium'>Default</p>
        <Link href='#' variant='default'>
          Default link
          <LinkIcon />
        </Link>
      </div>
      <div className='flex flex-col gap-2'>
        <p className='text-foreground-neutral-faded text-sm font-medium'>Muted</p>
        <Link href='#' variant='muted'>
          Muted link
          <LinkIcon />
        </Link>
      </div>
      <div className='flex flex-col gap-2'>
        <p className='text-foreground-neutral-faded text-sm font-medium'>Primary</p>
        <Link href='#' variant='primary'>
          Primary link
          <LinkIcon />
        </Link>
      </div>
      <div className='flex flex-col gap-2'>
        <p className='text-foreground-neutral-faded text-sm font-medium'>Secondary</p>
        <Link href='#' variant='secondary'>
          Secondary link
          <LinkIcon />
        </Link>
      </div>
      <div className='flex flex-col gap-2'>
        <p className='text-foreground-neutral-faded text-sm font-medium'>Danger</p>
        <Link href='#' variant='danger'>
          Danger link
          <LinkIcon />
        </Link>
      </div>
    </div>
  )
}

// Custom Icon
export const CustomIcon: Story = {
  render: () => (
    <div className='flex flex-col gap-4'>
      <div className='space-y-2'>
        <p className='text-foreground-neutral-faded text-sm font-medium'>Various icon examples</p>
        <div className='flex flex-col gap-3'>
          <Link href='#'>
            External link
            <LinkIcon>
              <Lucide.ExternalLink className='size-4' />
            </LinkIcon>
          </Link>
          <Link href='#'>
            Go to page
            <LinkIcon>
              <Lucide.ArrowRight className='size-4' />
            </LinkIcon>
          </Link>
          <Link href='#'>
            Download file
            <LinkIcon>
              <Lucide.Download className='size-4' />
            </LinkIcon>
          </Link>
          <Link href='mailto:hello@example.com'>
            Email us
            <LinkIcon>
              <Lucide.Mail className='size-4' />
            </LinkIcon>
          </Link>
          <Link href='tel:+1234567890'>
            Call us
            <LinkIcon>
              <Lucide.Phone className='size-4' />
            </LinkIcon>
          </Link>
        </div>
      </div>
    </div>
  )
}

// Icon Placement
export const IconPlacement: Story = {
  render: () => (
    <div className='flex flex-col gap-3'>
      <Link href='#'>
        Icon at end (default)
        <LinkIcon />
      </Link>
      <Link href='#'>
        <LinkIcon />
        Icon at start
      </Link>
      <Link href='#'>
        <LinkIcon>
          <Lucide.ChevronLeft className='size-4' />
        </LinkIcon>
        Back to previous
      </Link>
      <Link href='#'>
        Continue to next
        <LinkIcon>
          <Lucide.ChevronRight className='size-4' />
        </LinkIcon>
      </Link>
    </div>
  )
}

// Underline Variants
export const UnderlineVariants: Story = {
  render: () => (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-2'>
        <p className='text-foreground-neutral-faded text-sm font-medium'>
          Underline on hover (default)
        </p>
        <Link href='#' underline='hover'>
          Hover to see underline
          <LinkIcon />
        </Link>
      </div>
      <div className='flex flex-col gap-2'>
        <p className='text-foreground-neutral-faded text-sm font-medium'>
          Always visible underline
        </p>
        <Link href='#' underline='always'>
          Underline always visible
          <LinkIcon />
        </Link>
      </div>
      <div className='flex flex-col gap-2'>
        <p className='text-foreground-neutral-faded text-sm font-medium'>No underline</p>
        <Link href='#' underline='none'>
          Link without underline
          <LinkIcon />
        </Link>
      </div>
    </div>
  )
}

// Size Variants
export const SizeVariants: Story = {
  render: () => (
    <div className='flex flex-col gap-4'>
      <div className='space-y-2'>
        <p className='text-foreground-neutral-faded text-sm font-medium'>Small</p>
        <Link href='#' size='sm'>
          Small link
          <LinkIcon />
        </Link>
      </div>
      <div className='space-y-2'>
        <p className='text-foreground-neutral-faded text-sm font-medium'>Medium (default)</p>
        <Link href='#' size='md'>
          Medium link
          <LinkIcon />
        </Link>
      </div>
      <div className='space-y-2'>
        <p className='text-foreground-neutral-faded text-sm font-medium'>Large</p>
        <Link href='#' size='lg'>
          Large link
          <LinkIcon />
        </Link>
      </div>
    </div>
  )
}

// Using with Routing Libraries
export const RoutingLibraries: Story = {
  render: () => {
    const RouterLink = React.forwardRef<
      HTMLAnchorElement,
      React.ComponentPropsWithoutRef<'a'> & { to: string }
    >(({ to, children, ...props }, ref) => {
      return (
        <a
          ref={ref}
          href={to}
          onClick={(e) => {
            e.preventDefault()
            console.info('React Router navigating to:', to)
          }}
          {...props}
        >
          {children}
        </a>
      )
    })

    return (
      <div className='flex flex-col gap-6'>
        <div className='space-y-2'>
          <p className='text-foreground-neutral-faded text-sm font-medium'>
            Using render prop for React Router integration
          </p>
          <Text className='text-foreground-neutral-faded text-sm'>
            Check the browser console to see navigation events
          </Text>
        </div>

        <div className='flex flex-col gap-3'>
          <Link render={(props) => <RouterLink to='/dashboard' {...props} />}>
            Dashboard
            <LinkIcon>
              <Lucide.LayoutDashboard className='size-4' />
            </LinkIcon>
          </Link>
          <Link render={(props) => <RouterLink to='/settings' {...props} />}>
            Settings
            <LinkIcon>
              <Lucide.Settings className='size-4' />
            </LinkIcon>
          </Link>
          <Link render={(props) => <RouterLink to='/profile' {...props} />}>
            Profile
            <LinkIcon>
              <Lucide.User className='size-4' />
            </LinkIcon>
          </Link>
        </div>

        <div className='border-border-neutral bg-background-neutral-faded/50 space-y-3 rounded-lg border p-4'>
          <p className='text-sm font-semibold'>Example code:</p>
          <pre className='bg-background-neutral overflow-auto rounded p-3 text-xs'>
            {`// React Router integration
import { Link as RouterLink } from '@tanstack/react-router'
import { Link } from '~/components/link'

<Link render={(props) => <RouterLink to="/dashboard" {...props} />}>
  Dashboard
  <LinkIcon />
</Link>`}
          </pre>
        </div>

        <div className='border-border-neutral bg-background-neutral-faded/50 space-y-3 rounded-lg border p-4'>
          <p className='text-sm font-semibold'>With variants:</p>
          <div className='flex flex-col gap-2'>
            <Link variant='primary' render={(props) => <RouterLink to='/get-started' {...props} />}>
              Get Started
              <LinkIcon>
                <Lucide.ArrowRight className='size-4' />
              </LinkIcon>
            </Link>
            <Link variant='muted' render={(props) => <RouterLink to='/docs' {...props} />}>
              View Documentation
              <LinkIcon>
                <Lucide.BookOpen className='size-4' />
              </LinkIcon>
            </Link>
          </div>
        </div>
      </div>
    )
  }
}

// Direct Class Application
export const DirectClassApplication: Story = {
  render: () => (
    <div className='flex flex-col gap-4'>
      <Link href='#' className='text-blue-600 hover:text-blue-800'>
        Custom blue link
        <LinkIcon />
      </Link>
      <Link href='#' className='text-lg font-bold'>
        Large bold link
        <LinkIcon />
      </Link>
      <Link
        href='#'
        className='bg-background-neutral-faded text-accent-foreground rounded px-3 py-1.5'
      >
        Badge-styled link
        <LinkIcon />
      </Link>
      <Link
        href='#'
        className='border-border-neutral hover:bg-background-neutral-faded gap-2 rounded-md border p-2'
      >
        Card-styled link
        <LinkIcon />
      </Link>
    </div>
  )
}

// In Paragraph
export const InParagraph: Story = {
  render: () => (
    <div className='max-w-md space-y-4'>
      <Text className='text-foreground-neutral-faded'>
        This is a paragraph with an{' '}
        <Link href='#' underline='hover'>
          inline link
        </Link>{' '}
        in the middle of the text. You can also add{' '}
        <Link href='#'>
          links with icons
          <LinkIcon />
        </Link>{' '}
        for external resources.
      </Text>
      <Text className='text-foreground-neutral-faded'>
        Learn more about our{' '}
        <Link href='#' underline='always'>
          privacy policy
        </Link>{' '}
        and{' '}
        <Link href='#' underline='always'>
          terms of service
        </Link>
        . Questions? Feel free to{' '}
        <Link href='#' variant='primary'>
          contact us
        </Link>
        .
      </Text>
    </div>
  )
}

// Navigation Menu
export const NavigationMenu: Story = {
  render: () => (
    <nav className='border-border-neutral bg-card flex items-center gap-6 rounded-lg border p-4'>
      <Link href='#' underline='hover'>
        Home
      </Link>
      <Link href='#' underline='hover'>
        Products
      </Link>
      <Link href='#' underline='hover'>
        About
      </Link>
      <Link href='#' underline='hover'>
        Contact
      </Link>
      <Link href='#' underline='hover'>
        Docs
        <LinkIcon>
          <Lucide.BookOpen className='size-4' />
        </LinkIcon>
      </Link>
    </nav>
  )
}

// Footer Links
export const FooterLinks: Story = {
  render: () => (
    <div className='border-border-neutral bg-background-neutral-faded/50 grid grid-cols-3 gap-8 rounded-lg border p-8'>
      <div className='space-y-3'>
        <p className='text-sm font-semibold'>Product</p>
        <div className='flex flex-col gap-2 text-sm'>
          <Link href='#' variant='muted' underline='hover'>
            Features
          </Link>
          <Link href='#' variant='muted' underline='hover'>
            Pricing
          </Link>
          <Link href='#' variant='muted' underline='hover'>
            FAQ
          </Link>
        </div>
      </div>
      <div className='space-y-3'>
        <p className='text-sm font-semibold'>Company</p>
        <div className='flex flex-col gap-2 text-sm'>
          <Link href='#' variant='muted' underline='hover'>
            About
          </Link>
          <Link href='#' variant='muted' underline='hover'>
            Blog
          </Link>
          <Link href='#' variant='muted' underline='hover'>
            Careers
          </Link>
        </div>
      </div>
      <div className='space-y-3'>
        <p className='text-sm font-semibold'>Resources</p>
        <div className='flex flex-col gap-2 text-sm'>
          <Link href='#' variant='muted' underline='hover'>
            Documentation
            <LinkIcon>
              <Lucide.BookOpen className='size-3' />
            </LinkIcon>
          </Link>
          <Link href='#' variant='muted' underline='hover'>
            API Reference
            <LinkIcon>
              <Lucide.Code className='size-3' />
            </LinkIcon>
          </Link>
          <Link href='#' variant='muted' underline='hover'>
            Support
            <LinkIcon>
              <Lucide.HelpCircle className='size-3' />
            </LinkIcon>
          </Link>
        </div>
      </div>
    </div>
  )
}

// Breadcrumbs
export const Breadcrumbs: Story = {
  render: () => (
    <nav className='flex items-center gap-2 text-sm'>
      <Link href='#' variant='muted' underline='hover'>
        Home
      </Link>
      <Lucide.ChevronRight className='text-foreground-neutral-faded size-4' />
      <Link href='#' variant='muted' underline='hover'>
        Products
      </Link>
      <Lucide.ChevronRight className='text-foreground-neutral-faded size-4' />
      <Link href='#' variant='muted' underline='hover'>
        Electronics
      </Link>
      <Lucide.ChevronRight className='text-foreground-neutral-faded size-4' />
      <span className='text-foreground'>Laptop</span>
    </nav>
  )
}

// External Links
export const ExternalLinks: Story = {
  render: () => (
    <div className='flex flex-col gap-3'>
      <Link href='https://github.com' target='_blank' rel='noopener noreferrer'>
        GitHub
        <LinkIcon>
          <Lucide.ExternalLink className='size-4' />
        </LinkIcon>
      </Link>
      <Link href='https://example.com' target='_blank' rel='noopener noreferrer'>
        External website
        <LinkIcon />
      </Link>
      <Link
        href='https://docs.example.com'
        target='_blank'
        rel='noopener noreferrer'
        variant='primary'
      >
        Documentation
        <LinkIcon>
          <Lucide.BookOpen className='size-4' />
        </LinkIcon>
      </Link>
    </div>
  )
}

// Disabled State
export const DisabledState: Story = {
  render: () => (
    <div className='flex flex-col gap-3'>
      <Link href='#' aria-disabled='true' className='pointer-events-none opacity-50'>
        Disabled link
        <LinkIcon />
      </Link>
      <Link
        href='#'
        aria-disabled='true'
        variant='primary'
        className='pointer-events-none opacity-50'
      >
        Disabled primary link
        <LinkIcon />
      </Link>
    </div>
  )
}

// Call to Action
export const CallToAction: Story = {
  render: () => (
    <div className='flex flex-col gap-4'>
      <Link href='#' variant='primary' size='lg'>
        Get started
        <LinkIcon>
          <Lucide.ArrowRight className='size-5' />
        </LinkIcon>
      </Link>
      <Link href='#' variant='default' className='gap-2'>
        Learn more
        <LinkIcon>
          <Lucide.BookOpen className='size-4' />
        </LinkIcon>
      </Link>
      <Link href='#' variant='muted'>
        View documentation
        <LinkIcon>
          <Lucide.ExternalLink className='size-4' />
        </LinkIcon>
      </Link>
    </div>
  )
}

// Social Links
export const SocialLinks: Story = {
  render: () => (
    <div className='flex items-center gap-4'>
      <Link href='https://github.com' target='_blank' rel='noopener noreferrer' underline='none'>
        <LinkIcon>
          <Lucide.Github className='size-5' />
        </LinkIcon>
        GitHub
      </Link>
      <Link href='https://twitter.com' target='_blank' rel='noopener noreferrer' underline='none'>
        <LinkIcon>
          <Lucide.Twitter className='size-5' />
        </LinkIcon>
        Twitter
      </Link>
      <Link href='https://linkedin.com' target='_blank' rel='noopener noreferrer' underline='none'>
        <LinkIcon>
          <Lucide.Linkedin className='size-5' />
        </LinkIcon>
        LinkedIn
      </Link>
    </div>
  )
}

// Article Example
export const ArticleExample: Story = {
  render: () => (
    <article className='max-w-3xl space-y-6'>
      <Heading>Introduction</Heading>
      <Text>
        Typography is the art and technique of arranging type to make written language legible,
        readable, and appealing when displayed. Learn more in our{' '}
        <Link href='#' underline='hover'>
          typography guide
        </Link>
        .
      </Text>
      <Text>
        Good typography establishes a strong visual hierarchy, provides a graphic balance to the
        website, and sets the product's overall tone. Check out{' '}
        <Link href='#' variant='primary'>
          best practices
          <LinkIcon />
        </Link>{' '}
        for more details.
      </Text>

      <div className='border-border-neutral bg-background-neutral-faded/50 rounded-lg border p-4'>
        <p className='text-sm font-semibold'>💡 Additional Resources</p>
        <div className='mt-2 flex flex-col gap-2'>
          <Link href='#' variant='muted' underline='hover'>
            Typography Fundamentals
            <LinkIcon>
              <Lucide.BookOpen className='size-3' />
            </LinkIcon>
          </Link>
          <Link href='#' variant='muted' underline='hover'>
            Design Systems Guide
            <LinkIcon>
              <Lucide.FileText className='size-3' />
            </LinkIcon>
          </Link>
          <Link href='#' variant='muted' underline='hover'>
            Best Practices
            <LinkIcon>
              <Lucide.CheckCircle className='size-3' />
            </LinkIcon>
          </Link>
        </div>
      </div>
    </article>
  )
}

// Landing Page Example
export const LandingPageExample: Story = {
  render: () => (
    <div className='max-w-4xl space-y-16 py-12'>
      <div className='space-y-6 text-center'>
        <Heading>Build amazing products faster</Heading>
        <p className='text-foreground-neutral-faded text-lg'>
          The all-in-one platform for teams to design, develop, and deploy world-class applications.
        </p>
        <div className='flex justify-center gap-4'>
          <Link href='#' variant='primary' size='lg'>
            Get Started
            <LinkIcon>
              <Lucide.ArrowRight className='size-5' />
            </LinkIcon>
          </Link>
          <Link href='#' size='lg'>
            View Demo
            <LinkIcon>
              <Lucide.Play className='size-5' />
            </LinkIcon>
          </Link>
        </div>
      </div>

      <div className='grid gap-8 md:grid-cols-3'>
        <div className='space-y-2'>
          <h3 className='font-semibold'>Lightning Fast</h3>
          <p className='text-foreground-neutral-faded'>
            Optimized performance ensures your applications run at peak speed.{' '}
            <Link href='#' variant='muted' underline='hover'>
              Learn more
            </Link>
          </p>
        </div>
        <div className='space-y-2'>
          <h3 className='font-semibold'>Highly Scalable</h3>
          <p className='text-foreground-neutral-faded'>
            Grow from prototype to production without changing your infrastructure.{' '}
            <Link href='#' variant='muted' underline='hover'>
              Read docs
            </Link>
          </p>
        </div>
        <div className='space-y-2'>
          <h3 className='font-semibold'>Built for Teams</h3>
          <p className='text-foreground-neutral-faded'>
            Collaborate seamlessly with powerful team management tools.{' '}
            <Link href='#' variant='muted' underline='hover'>
              See features
            </Link>
          </p>
        </div>
      </div>

      <div className='space-y-4 text-center'>
        <Heading>Trusted by thousands</Heading>
        <p className='text-foreground-neutral-faded'>
          Join the community of developers and designers building the future.{' '}
          <Link href='#' variant='primary'>
            Join now
            <LinkIcon />
          </Link>
        </p>
      </div>
    </div>
  )
}

// Documentation Page Example
export const DocumentationExample: Story = {
  render: () => (
    <div className='max-w-3xl space-y-8'>
      <div className='space-y-2'>
        <p className='text-foreground-neutral-faded text-sm'>Components • Link</p>
        <Heading>Link Component</Heading>
        <p className='text-foreground-neutral-faded text-lg'>
          A flexible link component with support for routing libraries and custom styling.
        </p>
      </div>

      <div className='space-y-4'>
        <Heading>Installation</Heading>
        <Text>
          Install the component from npm or copy the source code directly. See{' '}
          <Link href='#' underline='hover'>
            installation guide
          </Link>{' '}
          for more details.
        </Text>

        <div className='border-border-neutral bg-background-neutral-faded/50 rounded-lg border p-4'>
          <p className='text-sm font-semibold'>Quick Links</p>
          <div className='mt-2 flex flex-wrap gap-3'>
            <Link href='#' variant='muted' underline='hover'>
              API Reference
              <LinkIcon>
                <Lucide.FileText className='size-3' />
              </LinkIcon>
            </Link>
            <Link href='#' variant='muted' underline='hover'>
              Examples
              <LinkIcon>
                <Lucide.Code className='size-3' />
              </LinkIcon>
            </Link>
            <Link href='#' variant='muted' underline='hover'>
              GitHub
              <LinkIcon>
                <Lucide.Github className='size-3' />
              </LinkIcon>
            </Link>
          </div>
        </div>
      </div>

      <div className='space-y-4'>
        <Heading>Usage</Heading>
        <Text>
          Import the Link component and use it anywhere in your application. For routing library
          integration, check the{' '}
          <Link href='#' variant='primary'>
            routing guide
            <LinkIcon />
          </Link>
          .
        </Text>
      </div>

      <div className='space-y-4'>
        <Heading>Props</Heading>
        <ul className='ml-6 list-disc space-y-2'>
          <li>
            <Text>
              <span className='font-semibold'>variant</span> - Visual style variant. See{' '}
              <Link href='#' variant='muted' underline='hover'>
                variant options
              </Link>
            </Text>
          </li>
          <li>
            <Text>
              <span className='font-semibold'>underline</span> - Underline behavior. Learn about{' '}
              <Link href='#' variant='muted' underline='hover'>
                underline styles
              </Link>
            </Text>
          </li>
        </ul>
      </div>

      <div className='border-border-neutral bg-background-neutral-faded/50 rounded-lg border p-4'>
        <p className='text-sm font-semibold'>Need Help?</p>
        <Text className='text-foreground-neutral-faded text-sm'>
          Join our community or reach out to support.
        </Text>
        <div className='mt-3 flex gap-3'>
          <Link href='#' variant='primary'>
            Discord
            <LinkIcon>
              <Lucide.MessageCircle className='size-3' />
            </LinkIcon>
          </Link>
          <Link href='#' variant='muted'>
            Support
            <LinkIcon>
              <Lucide.HelpCircle className='size-3' />
            </LinkIcon>
          </Link>
        </div>
      </div>
    </div>
  )
}
