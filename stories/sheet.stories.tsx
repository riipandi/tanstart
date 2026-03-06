import type { Meta, StoryObj } from '@storybook/react-vite'
import * as Lucide from 'lucide-react'
import { Button } from '#/components/button'
import { Input } from '#/components/input'
import { Label } from '#/components/label'
import { ScrollArea } from '#/components/scroll-area'
import { Sheet, SheetAction, SheetBody, SheetClose, SheetContent } from '#/components/sheet'
import { SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '#/components/sheet'
import { SheetDescription } from '#/components/sheet'
import { Textarea } from '#/components/textarea'

const meta = {
  title: 'Components/Sheet',
  component: Sheet,
  parameters: { layout: 'centered' },
  argTypes: {},
  tags: [], // ['autodocs']
  args: {},
  decorators: [
    (Story) => (
      <div className='flex w-full min-w-md items-center justify-center'>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

export const Example: Story = {
  args: {},
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button variant='outline' className='w-28' />}>Open Sheet</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Book Review</SheetTitle>
          <SheetDescription>Share your thoughts on your favorite novels.</SheetDescription>
        </SheetHeader>
        <SheetBody className='grid gap-5'>
          {/* Name */}
          <div className='flex flex-col gap-2'>
            <Label htmlFor='name'>Your Name</Label>
            <Input id='name' placeholder='Robert Langdon' />
          </div>
          {/* Email */}
          <div className='flex flex-col gap-2'>
            <Label htmlFor='email'>Email</Label>
            <Input id='email' type='email' placeholder='reader@hogwarts.edu' />
          </div>
          {/* Feedback */}
          <div className='flex flex-col gap-2'>
            <Label htmlFor='feedback'>Review</Label>
            <Textarea
              id='feedback'
              placeholder='What did you think about the plot twists and character development?'
              rows={4}
            />
            <p className='text-foreground-neutral-faded-foreground text-sm'>
              Please share your favorite moments from the story
            </p>
          </div>
        </SheetBody>
        <SheetFooter className='border-border-neutral mt-auto grid grid-cols-2 gap-3 border-t'>
          <SheetClose block>Cancel</SheetClose>
          <SheetAction block render={<Button type='submit' />}>
            Submit
          </SheetAction>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export const Scrollable: Story = {
  args: {},
  render: () => {
    const faqSections = [
      {
        title: "About Dan Brown's Robert Langdon Series",
        content:
          'The Robert Langdon series follows Harvard symbologist Robert Langdon as he unravels mysteries involving secret societies, religious conspiracies, and ancient puzzles. The series includes Angels & Demons, The Da Vinci Code, The Lost Symbol, Inferno, and Origin.'
      },
      {
        title: 'Harry Potter Reading Order',
        content:
          "Start with Harry Potter and the Sorcerer's Stone, followed by Chamber of Secrets, Prisoner of Azkaban, Goblet of Fire, Order of the Phoenix, Half-Blood Prince, and Deathly Hallows. Each book builds upon the previous, revealing the ultimate battle between Harry and Voldemort."
      },
      {
        title: "Dan Brown's Writing Style",
        content:
          'Brown combines fast-paced action with historical facts, religious symbolism, and scientific concepts. His novels are known for cliffhanger chapter endings, real-world locations, and controversial interpretations of art and history.'
      },
      {
        title: 'Hogwarts Houses Explained',
        content:
          "Gryffindor values bravery and daring, home to Harry, Hermione, and Ron. Slytherin prizes ambition and cunning, Voldemort's house. Ravenclaw celebrates wit and wisdom. Hufflepuff embodies loyalty and fair play, welcoming all students."
      },
      {
        title: 'The Da Vinci Code Controversy',
        content:
          'The novel sparked global debate with its claims about Jesus Christ and Mary Magdalene, the Holy Grail, and Opus Dei. While presented as fiction, many readers questioned the line between historical fact and artistic license.'
      },
      {
        title: 'Magical Creatures in Harry Potter',
        content:
          'From loyal hippogriffs like Buckbeak to mischievous house-elves like Dobby, the wizarding world is filled with fantastic beasts. Dragons, phoenixes, centaurs, and the terrifying Dementors guard Azkaban prison.'
      },
      {
        title: "Robert Langdon's Expertise",
        content:
          'As a professor of Religious Symbology and Iconology at Harvard, Langdon decodes ancient symbols, secret society rituals, and hidden messages in artworks. His knowledge makes him invaluable in solving international mysteries.'
      },
      {
        title: 'The Deathly Hallows Explained',
        content:
          'The three Deathly Hallows are the Elder Wand (unbeatable wand), the Resurrection Stone (brings back loved ones), and the Invisibility Cloak (true concealment). Only the possessor of all three becomes the Master of Death.'
      },
      {
        title: "Secret Societies in Brown's Novels",
        content:
          "From the Illuminati and Freemasons to the Priory of Sion, Brown's thrillers explore real and fictional secret organizations. These groups often protect ancient knowledge or pursue hidden agendas spanning centuries."
      }
    ]

    return (
      <Sheet>
        <SheetTrigger render={<Button variant='outline' />}>Open Sheet</SheetTrigger>
        <SheetContent className='gap-2.5 p-0'>
          <SheetHeader>
            <SheetTitle>Literary FAQ</SheetTitle>
            <SheetDescription>Explore the worlds of Dan Brown and Harry Potter</SheetDescription>
          </SheetHeader>
          <SheetBody className='grow py-0'>
            <ScrollArea className='-me-3 h-[calc(100dvh-11rem)] pe-3 text-sm' scrollbar='vertical'>
              <div className='[&_h3]:text-foreground space-y-4 [&_h3]:font-semibold'>
                {faqSections.map((faq, index) => (
                  <div key={index} className='text-accent-foreground space-y-1'>
                    <h3>{faq.title}</h3>
                    <p>{faq.content}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </SheetBody>
          <SheetFooter>
            <SheetClose block>Close</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    )
  }
}

export const SideShowcase: Story = {
  args: {},
  render: () => (
    <div className='flex items-center gap-6'>
      <Sheet>
        <SheetTrigger render={<Button variant='outline' className='w-28' />}>
          <Lucide.ArrowUp /> Top
        </SheetTrigger>
        <SheetContent side='top'>
          <SheetHeader>
            <SheetTitle>Favorite Character</SheetTitle>
            <SheetDescription>Who is your favorite literary character?</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <div className='grid gap-5'>
              {/* Name */}
              <div className='flex flex-col gap-2'>
                <Label htmlFor='name'>Your Name</Label>
                <Input id='name' placeholder='Hermione Granger' />
              </div>
              {/* Email */}
              <div className='flex flex-col gap-2'>
                <Label htmlFor='email'>Email</Label>
                <Input id='email' type='email' placeholder='reader@langdon.edu' />
              </div>
              {/* Feedback */}
              <div className='flex flex-col gap-2'>
                <Label htmlFor='feedback'>Why This Character?</Label>
                <Textarea
                  id='feedback'
                  placeholder='Tell us why you love this character and their memorable moments...'
                  rows={4}
                />
                <p className='text-foreground-neutral-faded-foreground text-sm'>
                  Share your favorite quotes and scenes
                </p>
              </div>
            </div>
          </SheetBody>
          <SheetFooter>
            <SheetClose>Cancel</SheetClose>
            <Button type='submit'>Submit</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet>
        <SheetTrigger render={<Button variant='outline' className='w-28' />}>
          <Lucide.ArrowDown /> Bottom
        </SheetTrigger>
        <SheetContent side='bottom'>
          <SheetHeader>
            <SheetTitle>Book Recommendation</SheetTitle>
            <SheetDescription>Recommend your favorite thriller or fantasy novel</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <div className='grid gap-5'>
              {/* Name */}
              <div className='flex flex-col gap-2'>
                <Label htmlFor='name'>Your Name</Label>
                <Input id='name' placeholder='Albus Dumbledore' />
              </div>
              {/* Email */}
              <div className='flex flex-col gap-2'>
                <Label htmlFor='email'>Email</Label>
                <Input id='email' type='email' placeholder='reader@poudlard.fr' />
              </div>
              {/* Feedback */}
              <div className='flex flex-col gap-2'>
                <Label htmlFor='feedback'>Book Details</Label>
                <Textarea
                  id='feedback'
                  placeholder='Which book would you recommend and why? What makes it special?'
                  rows={4}
                />
                <p className='text-foreground-neutral-faded-foreground text-sm'>
                  Include genre, author, and what readers will love
                </p>
              </div>
            </div>
          </SheetBody>
          <SheetFooter>
            <SheetClose>Cancel</SheetClose>
            <Button type='submit'>Submit</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet>
        <SheetTrigger render={<Button variant='outline' className='w-28' />}>
          <Lucide.ArrowRight /> Right
        </SheetTrigger>
        <SheetContent side='right'>
          <SheetHeader>
            <SheetTitle>Mystery Solver</SheetTitle>
            <SheetDescription>Test your knowledge of symbols and codes</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <div className='grid gap-5'>
              {/* Name */}
              <div className='flex flex-col gap-2'>
                <Label htmlFor='name'>Detective Name</Label>
                <Input id='name' placeholder='Robert Langdon' />
              </div>
              {/* Email */}
              <div className='flex flex-col gap-2'>
                <Label htmlFor='email'>Email</Label>
                <Input id='email' type='email' placeholder='symbologist@harvard.edu' />
              </div>
              {/* Feedback */}
              <div className='flex flex-col gap-2'>
                <Label htmlFor='feedback'>Your Theory</Label>
                <Textarea
                  id='feedback'
                  placeholder='What ancient symbol or code have you discovered? Explain your theory...'
                  rows={4}
                />
                <p className='text-foreground-neutral-faded-foreground text-sm'>
                  Include historical context and evidence
                </p>
              </div>
            </div>
          </SheetBody>
          <SheetFooter>
            <SheetClose>Cancel</SheetClose>
            <Button type='submit'>Submit</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet>
        <SheetTrigger render={<Button variant='outline' className='w-28' />}>
          <Lucide.ArrowLeft /> Left
        </SheetTrigger>
        <SheetContent side='left'>
          <SheetHeader>
            <SheetTitle>Spell Collection</SheetTitle>
            <SheetDescription>Share your favorite magical spells and charms</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <div className='grid gap-5'>
              {/* Name */}
              <div className='flex flex-col gap-2'>
                <Label htmlFor='name'>Wizard Name</Label>
                <Input id='name' placeholder='Harry Potter' />
              </div>
              {/* Email */}
              <div className='flex flex-col gap-2'>
                <Label htmlFor='email'>Email</Label>
                <Input id='email' type='email' placeholder='owl@hogwarts.edu' />
              </div>
              {/* Feedback */}
              <div className='flex flex-col gap-2'>
                <Label htmlFor='feedback'>Spell Details</Label>
                <Textarea
                  id='feedback'
                  placeholder='What spell do you want to share? Describe its incantation and effects...'
                  rows={4}
                />
                <p className='text-foreground-neutral-faded-foreground text-sm'>
                  Include pronunciation and practical uses
                </p>
              </div>
            </div>
          </SheetBody>
          <SheetFooter>
            <SheetClose>Cancel</SheetClose>
            <Button type='submit'>Submit</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
