import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const [streamers, setStreamers] = useState([])
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/streamers`)
      .then(res => res.json())
      .then(data => setStreamers(data))
      .catch(err => console.error('Erreur streamers :', err))
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/${search}`)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Chatrank.gg</h1>
      <form onSubmit={handleSubmit} className="mb-6">
        <input
          type="text"
          placeholder="Rechercher un streamer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">Voir</button>
      </form>

      <h2 className="text-xl font-semibold mb-2">🎮 Communautés actives</h2>
      <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {streamers.map(({ _id, count }) => (
          <li
            key={_id}
            className="border p-4 rounded cursor-pointer hover:bg-gray-100"
            onClick={() => navigate(`/lobby/${_id}`)}
          >
            <p className="text-lg font-bold">{_id}</p>
            <p>{count} joueur(s)</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
