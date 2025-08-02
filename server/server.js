import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cors from 'cors'
import userRoutes from './routes/users.js'
import http from 'http'
import { Server } from 'socket.io'

dotenv.config()

const app = express()
const server = http.createServer(app)

export const io = new Server(server, {
  cors: {
    origin: '*'
  }
})

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())
app.use('/api/users', userRoutes)

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    server.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`)
    })
  })
  .catch(err => console.error('❌ MongoDB error:', err))

