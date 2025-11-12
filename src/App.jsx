import { useEffect, useMemo, useState } from 'react'

const API = import.meta.env.VITE_BACKEND_URL || ''

function DogForm({ onCreated }) {
  const [name, setName] = useState('')
  const [sex, setSex] = useState('')
  const [color, setColor] = useState('')
  const [birth_date, setBirthDate] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${API}/dogs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, sex, color, birth_date, notes })
      })
      const data = await res.json()
      if (res.ok) {
        onCreated()
        setName(''); setSex(''); setColor(''); setBirthDate(''); setNotes('')
      } else {
        alert(data.detail || 'Failed to create')
      }
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} className="w-full border rounded px-3 py-2" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium">Sex</label>
          <select value={sex} onChange={e=>setSex(e.target.value)} className="w-full border rounded px-3 py-2">
            <option value="">Unknown</option>
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Color</label>
          <input value={color} onChange={e=>setColor(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">Birth date</label>
        <input type="date" value={birth_date} onChange={e=>setBirthDate(e.target.value)} className="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">Notes</label>
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} className="w-full border rounded px-3 py-2" rows={3} />
      </div>
      <button disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">{loading? 'Saving...' : 'Add dog'}</button>
    </form>
  )
}

function DogRow({ dog, onSelect }){
  return (
    <div className="p-3 border rounded hover:bg-gray-50 cursor-pointer" onClick={()=>onSelect(dog)}>
      <div className="font-semibold">{dog.name}</div>
      <div className="text-sm text-gray-600">{dog.sex || 'Unknown'} {dog.color? `• ${dog.color}`: ''}</div>
    </div>
  )
}

function Pedigree({ root }){
  const renderNode = (node, depth=0) => {
    if(!node) return null
    return (
      <div className="border rounded p-2 bg-white shadow-sm">
        <div className="font-medium">{node.name}</div>
        {depth < 3 && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>{renderNode(node.sire, depth+1)}</div>
            <div>{renderNode(node.dam, depth+1)}</div>
          </div>
        )}
      </div>
    )
  }
  return (
    <div className="p-2">{renderNode(root)}</div>
  )
}

function App() {
  const [dogs, setDogs] = useState([])
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState(null)
  const [pedigree, setPedigree] = useState(null)

  const fetchDogs = async () => {
    const res = await fetch(`${API}/dogs?q=${encodeURIComponent(q)}`)
    const data = await res.json()
    setDogs(data)
  }

  useEffect(()=>{ fetchDogs() }, [])

  useEffect(()=>{
    if(selected){
      fetch(`${API}/pedigree/${selected.id}?depth=3`).then(r=>r.json()).then(setPedigree)
    } else {
      setPedigree(null)
    }
  }, [selected])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Pedigree Organizer</h1>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white p-4 rounded shadow">
              <div className="flex gap-2 mb-3">
                <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search dogs by name" className="flex-1 border rounded px-3 py-2" />
                <button onClick={fetchDogs} className="bg-gray-800 text-white px-3 py-2 rounded">Search</button>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-auto">
                {dogs.map(d=> <DogRow key={d.id} dog={d} onSelect={setSelected}/>) }
              </div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h2 className="font-semibold mb-3">Add a dog</h2>
              <DogForm onCreated={fetchDogs}/>
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="bg-white p-4 rounded shadow min-h-[500px]">
              {selected ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-xl font-bold">{selected.name}</div>
                      <div className="text-sm text-gray-600">{selected.sex || 'Unknown'} {selected.color? `• ${selected.color}`: ''}</div>
                    </div>
                  </div>
                  {pedigree ? <Pedigree root={pedigree}/> : <div className="text-gray-500">Loading pedigree...</div>}
                </>
              ) : (
                <div className="text-gray-500">Select a dog to view pedigree</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
