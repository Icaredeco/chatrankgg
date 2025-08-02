import { useState } from 'react'
import { useParams } from 'react-router-dom'

export default function SearchPage() {
  const { streamerCode } = useParams()
  const [riotName, setRiotName] = useState('')
  const [riotTag, setRiotTag] = useState('')
  const [message, setMessage] = useState('')

  const handleSearch = async () => {
    if (!riotName || !riotTag) {
      setMessage('Remplis les deux champs')
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riotName, riotTag, streamerCode })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`✅ ${data.user.summonerName} #${data.user.tag} enregistré avec rang ${data.user.rank} (rôle : ${data.user.mainRole})`)
      } else {
        setMessage(`❌ ${data.error || 'Erreur inconnue'}`)
      }

    } catch (err) {
      setMessage(`❌ Erreur côté client : ${err.message}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded shadow-lg w-full max-w-md">
        <h1 className="text-xl font-bold mb-4 text-center">
          Connecte ton compte pour le streamer <span className="text-blue-400">{streamerCode}</span>
        </h1>

        <input
          type="text"
          placeholder="Pseudo Riot"
          className="w-full p-2 mb-3 rounded bg-gray-700 border border-gray-600"
          value={riotName}
          onChange={(e) => setRiotName(e.target.value)}
        />

        <input
          type="text"
          placeholder="#Tag"
          className="w-full p-2 mb-4 rounded bg-gray-700 border border-gray-600"
          value={riotTag}
          onChange={(e) => setRiotTag(e.target.value)}
        />

        <button
          onClick={handleSearch}
          className="w-full bg-blue-600 hover:bg-blue-500 transition-colors p-2 rounded font-semibold"
        >
          Rechercher
        </button>

        {message && <p className="mt-4 text-sm text-center">{message}</p>}
      </div>
    </div>
  )
}
