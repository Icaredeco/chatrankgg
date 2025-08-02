import mongoose from 'mongoose'
import User from './models/User.js' // Assure-toi que le chemin est correct
import dotenv from 'dotenv'

dotenv.config()

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    const result = await User.deleteMany({ })
    console.log(`✅ ${result.deletedCount} utilisateur(s) supprimé(s).`)
    await mongoose.disconnect()
  } catch (error) {
    console.error('❌ Erreur pendant la suppression :', error)
  }
}

cleanup()
