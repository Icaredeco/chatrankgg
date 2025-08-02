import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cors from 'cors'
import userRoutes from './routes/users.js'
import streamerRoutes from './routes/streamers.js'
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

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigin = process.env.FRONTEND_URL?.replace(/\/$/, '')
    if (!origin || origin === allowedOrigin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}))

app.use(express.json())
app.use('/api/users', userRoutes)
app.use('/api', streamerRoutes)

app.get('/api/statut', (req, res) => {
  res.json({ message: '✅ Backend is up!' })
})

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected')

    const PORT = process.env.PORT || 5000
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
    })
  })
  .catch(err => console.error('❌ MongoDB error:', err))
