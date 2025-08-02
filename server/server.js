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

app.use(cors({
  origin: process.env.FRONTEND_URL || '*'
}))
app.use(express.json())
//app.use('/api/users', userRoutes)

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
