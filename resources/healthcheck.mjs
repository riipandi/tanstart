import { get } from 'node:http'

const HOST = process.env.HOST || 'localhost'
const PORT = process.env.PORT || 3000

get(`http://${HOST}:${PORT}/health`, (r) => {
  process.exit(r.statusCode === 200 ? 0 : 1)
}).on('error', () => {
  process.exit(1)
})
