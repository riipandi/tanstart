import { faker } from '@faker-js/faker'

const range = (len: number) => {
  const arr = []
  for (let i = 0; i < len; i++) {
    arr.push(i)
  }
  return arr
}

export type Person = {
  id: number
  firstName: string
  lastName: string
  age: number
  visits: number
  progress: number
  status: 'relationship' | 'complicated' | 'single'
}

const newPerson = (num: number) => {
  const statusList: Person['status'][] = ['relationship', 'complicated', 'single']
  const status = faker.helpers.shuffle(statusList)[0] ?? 'single'
  return {
    id: num,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    age: faker.number.int(40),
    visits: faker.number.int(1000),
    progress: faker.number.int(100),
    status
  }
}

export function makeData(...lens: number[]) {
  type PersonRow = Person & { subRows?: PersonRow[] }
  const makeDataLevel = (depth = 0): PersonRow[] => {
    const len = lens[depth]
    if (typeof len !== 'number') {
      return []
    }
    return range(len).map((index) => {
      const person = newPerson(index)
      return {
        ...person,
        status: person.status ?? 'single',
        subRows: typeof lens[depth + 1] === 'number' ? makeDataLevel(depth + 1) : undefined
      }
    })
  }
  return makeDataLevel()
}
