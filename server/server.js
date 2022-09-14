import fastify from 'fastify'
import { PrismaClient } from '@prisma/client'
import sensible from '@fastify/sensible'
import cors from '@fastify/cors'

const app = fastify()
app.register(sensible)
app.register(cors, {
  origin: 'http://localhost:3000',
  credentials: true,
})
const prisma = new PrismaClient()

app.get('/posts', async (request, reply) => {
  console.log('hitting posts')
  const posts = await commitToDb(
    prisma.post.findMany({
      select: {
        id: true,
        title: true,
      },
    })
  )
  reply.send(posts)
})

const commitToDb = async (promise) => {
  const [error, data] = await app.to(promise)
  if (error) {
    await app.httpErrors.internalServerError(error.message)
    throw error
  } else {
    return data
  }
}

//get post
app.get('/post/:id', async (request, reply) => {
  const { id } = request.params
  const post = await prisma.post.findUnique({
    where: { id: id },
    include: { comments: true },
  })
  reply.send(post)
})

app.get('/', async (request, reply) => {
  console.log("hitting '/'")
  const users = await prisma.user.findMany()
  reply.send(users)
})

app.listen({ port: 3001 })
