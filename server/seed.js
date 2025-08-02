// seed.js

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Player from './models/User.js' // adapte ce chemin si besoin

dotenv.config()

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/chatrank'

const tiers = [
  'IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM',
  'EMERALD', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER'
]
const roles = ['TOP', 'JUNGLE', 'MIDDLE', 'ADC', 'SUPPORT'];

const repartition = [
  220, // UNRANKED
  140, // IRON
  450, // BRONZE
  340, // SILVER
  320, // GOLD
  160, // PLATINUM
  102, // EMERALD
  67, // DIAMOND
  28, // MASTER
  14, // GRANDMASTER
  4, // CHALLENGER
]

const divisions = ['I', 'II', 'III', 'IV']

function getRandomRank() {
  const tier = tiers[Math.floor(Math.random() * tiers.length)]
  const division = divisions[Math.floor(Math.random() * divisions.length)]
  return `${tier} ${division}`
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('🧠 Connecté à MongoDB')

    const fakePlayers = []
    var total = 0

    for (let i = 0; i < repartition[0]; i++) {
      const name = `TestUser${ i + 1 + total}`
      const randomRole = roles[Math.floor(Math.random() * roles.length)];

      fakePlayers.push({
        summonerName: name,
        puuid: `puuid-${i}`,
        rank: 'UNRANKED',
        tag: 'EUW',
        searchedAt: new Date(),
        mainRole: randomRole,
        streamerCode: 'testprofil'
        })

    }
    total += repartition[0]
    for (let i = 0; i < repartition[1]; i++) {
      const name = `TestUser${ i + 1 + total}`
      const randomRole = roles[Math.floor(Math.random() * roles.length)];

      fakePlayers.push({
        summonerName: name,
        puuid: `puuid-${i}`,
        rank: 'IRON',
        tag: 'EUW',
        searchedAt: new Date(),
        mainRole: randomRole,
        streamerCode: 'testprofil'
        })
    }
    total += repartition[1]
    for (let i = 0; i < repartition[2]; i++) {
      const name = `TestUser${ i + 1 + total}`
      const randomRole = roles[Math.floor(Math.random() * roles.length)];

      fakePlayers.push({
        summonerName: name,
        puuid: `puuid-${i}`,
        rank: 'BRONZE',
        tag: 'EUW',
        searchedAt: new Date(),
        mainRole: randomRole,
        streamerCode: 'testprofil'
        })

    }
    total += repartition[2]
    for (let i = 0; i < repartition[3]; i++) {
      const name = `TestUser${ i + 1 + total}`
      const randomRole = roles[Math.floor(Math.random() * roles.length)];

      fakePlayers.push({
        summonerName: name,
        puuid: `puuid-${i}`,
        rank: 'SILVER',
        tag: 'EUW',
        searchedAt: new Date(),
        mainRole: randomRole,
        streamerCode: 'testprofil'
        })

    }
    total += repartition[3]
    for (let i = 0; i < repartition[4]; i++) {
      const name = `TestUser${ i + 1 + total}`
      const randomRole = roles[Math.floor(Math.random() * roles.length)];
      
      fakePlayers.push({
        summonerName: name,
        puuid: `puuid-${i}`,
        rank: 'GOLD',
        tag: 'EUW',
        searchedAt: new Date(),
        mainRole: randomRole,
        streamerCode: 'testprofil'
        })

    }
    total += repartition[4]
    for (let i = 0; i < repartition[5]; i++) {
      const name = `TestUser${ i + 1 + total}`
      const randomRole = roles[Math.floor(Math.random() * roles.length)];
      
      fakePlayers.push({
        summonerName: name,
        puuid: `puuid-${i}`,
        rank: 'PLATINUM',
        tag: 'EUW',
        searchedAt: new Date(),
        mainRole: randomRole,
        streamerCode: 'testprofil'
        })

    }
    total += repartition[5]
    for (let i = 0; i < repartition[6]; i++) {
      const name = `TestUser${ i + 1 + total}`
      const randomRole = roles[Math.floor(Math.random() * roles.length)];
      
      fakePlayers.push({
        summonerName: name,
        puuid: `puuid-${i}`,
        rank: 'EMERALD',
        tag: 'EUW',
        searchedAt: new Date(),
        mainRole: randomRole,
        streamerCode: 'testprofil'
        })

    }
    total += repartition[6]
    for (let i = 0; i < repartition[7]; i++) {
      const name = `TestUser${ i + 1 + total}`
      const randomRole = roles[Math.floor(Math.random() * roles.length)];
      
      fakePlayers.push({
        summonerName: name,
        puuid: `puuid-${i}`,
        rank: 'DIAMOND',
        tag: 'EUW',
        searchedAt: new Date(),
        mainRole: randomRole,
        streamerCode: 'testprofil'
        })

    }
    total += repartition[7]
    for (let i = 0; i < repartition[8]; i++) {
      const name = `TestUser${ i + 1 + total}`
      const randomRole = roles[Math.floor(Math.random() * roles.length)];
      
      fakePlayers.push({
        summonerName: name,
        puuid: `puuid-${i}`,
        rank: 'MASTER',
        tag: 'EUW',
        searchedAt: new Date(),
        mainRole: randomRole,
        streamerCode: 'testprofil'
        })

    }
    total += repartition[8]
    for (let i = 0; i < repartition[9]; i++) {
      const name = `TestUser${ i + 1 + total}`
      const randomRole = roles[Math.floor(Math.random() * roles.length)];
      
      fakePlayers.push({
        summonerName: name,
        puuid: `puuid-${i}`,
        rank: 'GRANDMASTER',
        tag: 'EUW',
        searchedAt: new Date(),
        mainRole: randomRole,
        streamerCode: 'testprofil'
        })

    }
    total += repartition[9]
    for (let i = 0; i < repartition[10]; i++) {
      const name = `TestUser${ i + 1 + total}`
      const randomRole = roles[Math.floor(Math.random() * roles.length)];
      
      fakePlayers.push({
        summonerName: name,
        puuid: `puuid-${i}`,
        rank: 'CHALLENGER',
        tag: 'EUW',
        searchedAt: new Date(),
        mainRole: randomRole,
        streamerCode: 'testprofil'
        })

    }

    await Player.insertMany(fakePlayers)
    console.log('✅ Données insérées avec succès !')

    process.exit()
  } catch (err) {
    console.error('❌ Erreur pendant le seed :', err)
    process.exit(1)
  }
}

seed()
