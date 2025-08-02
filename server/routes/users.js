import express from 'express'
import User from '../models/User.js'
import { riotAccountAPI, riotGameAPI } from '../utils/riotAPI.js'
import { io } from '../server.js'


const router = express.Router()

router.post('/add', async (req, res) => {
  const { riotName, riotTag, streamerCode } = req.body

  if (!streamerCode) {
    return res.status(400).json({ error: 'Streamer code is required' })
  }

  try {
    const { data: account } = await riotAccountAPI.get(
      `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(riotName)}/${encodeURIComponent(riotTag)}`
    )
    const puuid = account.puuid

    const { data: summoner } = await riotGameAPI.get(
      `/lol/summoner/v4/summoners/by-puuid/${puuid}`
    )

    console.log(summoner)
    const { data: ranked } = await riotGameAPI.get(
      `/lol/league/v4/entries/by-puuid/${summoner.puuid}`
      
    )

    const { data: matchIds } = await riotAccountAPI.get(
      `/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20`
    )

    const roleCount = {
      TOP: 0,
      JUNGLE: 0,
      MIDDLE: 0,
      ADC: 0,
      SUPPORT: 0
    }

    for (const matchId of matchIds) {
      try {
        const { data: match } = await riotAccountAPI.get(`/lol/match/v5/matches/${matchId}`)
        const participant = match.info.participants.find(p => p.puuid === puuid)
        if (participant) {
          const role = participant.teamPosition
          if (roleCount.hasOwnProperty(role)) {
            roleCount[role]++
          }
        }
      } catch (err) {
        console.warn(`❌ Match ${matchId} skipped: ${err.message}`)
      }
    }

    console.log(roleCount)

    const mainRole = Object.entries(roleCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'UNKNOWN'

    console.log(mainRole)
    const soloQ = ranked.find(q => q.queueType === 'RANKED_SOLO_5x5')
    const rank = soloQ ? `${soloQ.tier} ${soloQ.rank}` : 'Unranked'
    
    const user = new User({
      summonerName: account.gameName,
      tag : riotTag,
      puuid,
      rank,
      streamerCode,
      mainRole
    })

    await user.save()
    io.emit('new-user', user)
    res.status(201).json({ message: 'User saved', user })

  } catch (err) {
    console.error('❌ Error Riot:', err.response?.data || err.message)
    
    res.status(500).json({ error: 'Failed to fetch user data' })
  }
})

router.get('/:streamerCode', async (req, res) => {
  const { streamerCode } = req.params

  try {
    const users = await User.aggregate([
      { $match: { streamerCode } },
      { $sort: { searchedAt: -1 } },
      {
        $group: {
          _id: "$summonerName",
          summonerName: { $first: "$summonerName" },
          tag: { $first: "$tag" },
          puuid: { $first: "$puuid" },
          rank: { $first: "$rank" },
          mainRole: { $first: "$mainRole" },
          searchedAt: { $first: "$searchedAt" },
          streamerCode: { $first: "$streamerCode" },
        }
      },
      { $sort: { searchedAt: -1 } }
    ])

    res.json(users)
  } catch (err) {
    console.error('❌ Failed to aggregate users:', err)
    res.status(500).json({ error: 'Failed to fetch latest users per player' })
  }
})



export default router