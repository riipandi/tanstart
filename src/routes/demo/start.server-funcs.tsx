import { createFileRoute, useRouter } from '@tanstack/react-router'
import { createMiddleware, createServerFn } from '@tanstack/react-start'
import fs from 'node:fs'
import { useCallback, useState } from 'react'

const loggingMiddleware = createMiddleware().server(async ({ next, request }) => {
  console.info('REQ:', request.url)
  return next()
})

const loggedServerFn = createServerFn({ method: 'GET' }).middleware([loggingMiddleware])

const TODOS_FILE = 'todos.json'

async function readTodos() {
  return JSON.parse(
    await fs.promises.readFile(TODOS_FILE, 'utf-8').catch(() =>
      JSON.stringify(
        [
          { id: 1, name: 'Get groceries' },
          { id: 2, name: 'Buy a new phone' }
        ],
        null,
        2
      )
    )
  )
}

const getTodos = loggedServerFn({
  method: 'GET'
}).handler(async () => await readTodos())

const addTodo = createServerFn({ method: 'POST' })
  .inputValidator((d: string) => d)
  .handler(async ({ data }) => {
    const todos = await readTodos()
    todos.push({ id: todos.length + 1, name: data })
    await fs.promises.writeFile(TODOS_FILE, JSON.stringify(todos, null, 2))
    return todos
  })

export const Route = createFileRoute('/demo/start/server-funcs')({
  component: Home,
  loader: async () => await getTodos()
})

function Home() {
  const router = useRouter()
  let todos = Route.useLoaderData()

  const [todo, setTodo] = useState('')

  const submitTodo = useCallback(async () => {
    todos = await addTodo({ data: todo })
    setTodo('')
    router.invalidate()
  }, [addTodo, todo])

  return (
    <div className='bg-background-page flex min-h-screen items-center justify-center p-4'>
      <div className='border-sidebar-border/10 bg-sidebar/50 w-full max-w-2xl rounded-xl border-8 p-8 shadow-lg backdrop-blur-md'>
        <h1 className='text-sidebar-foreground mb-4 text-2xl'>
          Start Server Functions - Todo Example
        </h1>
        <ul className='mb-4 space-y-2'>
          {todos?.map((t: { id: number; name: string }) => (
            <li
              key={t.id}
              className='border-sidebar/30 bg-sidebar/20 rounded-lg border p-3 shadow backdrop-blur-sm'
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
