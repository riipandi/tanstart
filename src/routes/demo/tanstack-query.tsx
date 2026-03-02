import { useQuery, useMutation } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useState } from 'react'

export const Route = createFileRoute('/demo/tanstack-query')({
  component: TanStackQueryDemo
})

type Todo = {
  id: number
  name: string
}

function TanStackQueryDemo() {
  const { data, refetch } = useQuery<Todo[]>({
    queryKey: ['todos'],
    queryFn: () => fetch('/demo/api/tq-todos').then((res) => res.json()),
    initialData: []
  })

  const { mutate: addTodo } = useMutation({
    mutationFn: (todo: string) =>
      fetch('/demo/api/tq-todos', {
        method: 'POST',
        body: JSON.stringify(todo)
      }).then((res) => res.json()),
    onSuccess: () => refetch()
  })

  const [todo, setTodo] = useState('')

  const submitTodo = useCallback(async () => {
    await addTodo(todo)
    setTodo('')
  }, [addTodo, todo])

  return (
    <div className='bg-background-page flex min-h-screen items-center justify-center p-4'>
      <div className='border-sidebar-border/10 bg-sidebar/50 w-full max-w-2xl rounded-xl border-8 p-8 shadow-xl backdrop-blur-md'>
        <h1 className='text-sidebar-foreground mb-4 text-2xl'>TanStack Query Todos list</h1>
        <ul className='mb-4 space-y-2'>
          {data?.map((t) => (
            <li
              key={t.id}
              className='border-sidebar/30 bg-sidebar/20 rounded-lg border p-3 shadow-md backdrop-blur-sm'
            >
              <span className='text-sidebar-foreground text-lg'>{t.name}</span>
            </li>
          ))}
        </ul>
        <div className='flex flex-col gap-2'>
          <input
            type='text'
            value={todo}
            onChange={(e) => setTodo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                submitTodo()
              }
            }}
            placeholder='Enter a new todo...'
            className='border-sidebar/30 bg-sidebar/20 text-sidebar-foreground placeholder-on-background-neutral focus:ring-border-primary w-full rounded-lg border px-4 py-3 backdrop-blur-sm focus:border-transparent focus:ring-2 focus:outline-none'
          />
          <button
            type='button'
            disabled={todo.trim().length === 0}
            onClick={submitTodo}
            className='bg-background-primary text-on-brand hover:bg-background-primary/80 disabled:bg-background-primary/50 rounded-lg px-4 py-3 font-bold transition-colors disabled:cursor-not-allowed'
          >
            Add todo
          </button>
        </div>
      </div>
    </div>
  )
}
