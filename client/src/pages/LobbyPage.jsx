import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import LobbyCanvas from './LobbyCanvas'

export default function LobbyPage() {
  const { streamerCode } = useParams()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${streamerCode}`)
        const data = await res.json()
        setUsers(data)
      } catch (err) {
        console.error("Erreur lors du fetch des utilisateurs :", err)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [streamerCode])

  return (
    <div className="w-full h-screen overflow-hidden relative text-white">
      {/* 🎥 Vidéo de fond */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute w-full h-full object-cover z-0 opacity-20"
      >
        <source src="/bgfluid.mp4" type="video/mp4" />
      </video>
      <div className="absolute w-full h-full z-0 backdrop-blur-sm" />

      {loading ? (
        <div className="flex items-center justify-center h-full relative z-10">
          <p className="text-xl font-bold">Chargement du lobby...</p>
        </div>
      ) : (
        <>
          <div className="absolute inset-0 z-10">
            <LobbyCanvas users={users} />
          </div>
          <div className="absolute top-4 left-4 z-20 bg-black/60 p-4 rounded shadow">
            <h1 className="text-2xl font-bold">
              Lobby : <span className="text-blue-400">{streamerCode}</span>
            </h1>
            <p className="text-sm text-gray-300">Joueurs affichés : {users.length}</p>
          </div>
        </>
      )}
    </div>
  )
}
