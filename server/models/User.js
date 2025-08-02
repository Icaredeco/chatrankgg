import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  summonerName: { type: String, required: true },
  tag : { type: String, required: true },
  puuid: { type: String, required: true },
  rank: { type: String, required: true },
  streamerCode: { type: String, required: true },
  mainRole: { type: String, default: 'UNKNOWN' },
  searchedAt: { type: Date, default: Date.now }
})


export default mongoose.model('User', userSchema)
