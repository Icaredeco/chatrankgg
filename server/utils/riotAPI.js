import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const riotToken = process.env.RIOT_API_KEY

if (!riotToken) {
  throw new Error("❌ RIOT_API_KEY is missing from environment variables")
}

// Pour les routes d'account et de match (regions de *routing*)
export const riotAccountAPI = axios.create({
  baseURL: 'https://europe.api.riotgames.com',
  headers: {
    'X-Riot-Token': riotToken
  }
})

// Pour les routes de jeu (regions classiques comme EUW1)
export const riotGameAPI = axios.create({
  baseURL: 'https://euw1.api.riotgames.com',
  headers: {
    'X-Riot-Token': riotToken
  }
})
