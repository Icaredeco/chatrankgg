// routes/streamers.js

import express from 'express'
import User from '../models/User.js' // Assure-toi que ce modèle existe bien

const router = express.Router()

// Route pour récupérer tous les streamers avec au moins un joueur
router.get('/streamers', async (req, res) => {
  try {
    const data = await User.aggregate([
      { $group: { _id: "$streamerCode", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])
    res.json(data)
  } catch (err) {
    console.error('Erreur API /streamers :', err)
    res.status(500).json({ error: 'Erreur lors de la récupération des streamers' })
  }
})

export default router
