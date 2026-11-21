import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { apiRequest, DEFAULT_URL } from './api'
import { RESOURCES, SAMPLE_DATA } from './config'
import DataTable from './components/DataTable'
import DataForm from './components/DataForm'
import NotesWorkspace from './components/NotesWorkspace'
import AccountDetail from './components/AccountDetail'
import { decryptVigenere, encryptVigenere } from './crypto'

const getNoteId = note => note?.idNote ?? note?.id ?? note?.id_note

export default function App() {
  const [type, setType] = useState('note')
  const [baseUrl, setBaseUrl] = useState(DEFAULT_URL)
  const [rows, setRows] = useState([])
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [activeNoteId, setActiveNoteId] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 780)
  const [passwordsDecrypted, setPasswordsDecrypted] = useState(false)
  const [accountDetails, setAccountDetails] = useState({})
  const [accountDetail, setAccountDetail] = useState(null)
  const [accountDetailLoading, setAccountDetailLoading] = useState(false)
  const noteMutationRef = useRef(Promise.resolve())
  const resource = RESOURCES[type]
  const endpoint = resource.endpoint || type

  const getRowId = row => row?.[resource.id] ?? row?.id ?? row?.idOverseer ?? row?.id_overseer

  const queueNoteMutation = operation => {
    const mutation = noteMutationRef.current.then(operation)
    noteMutationRef.current = mutation.catch(() => {})
    return mutation
  }

  const notify = (message, error = false) => {
    setToast({ message, error })
    setTimeout(() => setToast(null), 3000)
  }

  const load = useCallback(async () => {
    try {
      const response = await apiRequest(baseUrl, 'GET', `/${endpoint}`)
      const data = Array.isArray(response.data)
        ? response.data
        : response.data
          ? [response.data]
          : []

      setRows(data)
      if (type === 'password') {
        const detailEntries = await Promise.all(data.map(async row => {
          const accountId = row?.idAccount
          if (accountId == null) return null

          try {
            const detailResponse = await apiRequest(baseUrl, 'GET', `/account/${accountId}`)
            return [String(accountId), detailResponse.data || detailResponse]
          } catch {
            return null
          }
        }))

        const detailsById = Object.fromEntries(detailEntries.filter(Boolean))
        setAccountDetails(detailsById)
        setRows(data.map(row => ({
          ...row,
          ...(detailsById[String(row.idAccount)] || {})
        })))
      } else {
        setAccountDetails({})
      }
      if (type === 'note' && data.length) {
        setActiveNoteId(currentId => (
          data.some(note => String(getNoteId(note)) === String(currentId))
            ? currentId
            : getNoteId(data[0])
        ))
      }
    } catch {
      setRows(SAMPLE_DATA[type])
    }
  }, [baseUrl, type])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    const normalizedQuery = query.toLowerCase()

    return rows.filter(row => {
      const detail = type === 'password' ? accountDetails[String(row.idAccount)] : null
      return JSON.stringify({ ...row, ...(detail || {}) })
        .toLowerCase()
        .includes(normalizedQuery)
    })
  }, [accountDetails, rows, query, type])

  const save = async (payload) => {
    try {
      const id = getRowId(editing)
      const method = id == null ? 'POST' : 'PUT'
      const path = id == null ? `/${endpoint}` : `/${endpoint}/${id}`
      let requestPayload = payload
      if (type === 'password') {
        requestPayload = { ...payload }
        if (payload.password) {
          requestPayload.password = encryptVigenere(payload.password)
        } else if (id != null) {
          delete requestPayload.password
        }
      }

      const request = () => apiRequest(baseUrl, method, path, requestPayload)
      let response
      if (type === 'note') {
        response = await queueNoteMutation(request)
      } else {
        response = await request()
      }
      setFormOpen(false)
      setEditing(null)
      notify('Data berhasil disimpan')

      if (type === 'note') {
        const responseData = response?.data
        const savedNote = Array.isArray(responseData)
          ? responseData[0]
          : responseData || response

        if (savedNote && getNoteId(savedNote) != null) {
          setRows(currentRows => id == null
            ? [...currentRows, savedNote]
            : currentRows.map(row => String(getNoteId(row)) === String(id)
              ? { ...row, ...savedNote }
              : row)
          )
          if (id == null) setActiveNoteId(getNoteId(savedNote))
        }
      } else {
        await load()
      }
    } catch (error) {
      notify(error.message, true)
    }
  }

  const remove = async (row) => {
    const id = getRowId(row)
    if (!window.confirm(`Hapus data #${id}?`)) return

    try {
      const deleteNote = () => apiRequest(baseUrl, 'DELETE', `/${endpoint}/${id}`)
      if (type === 'note') {
        await queueNoteMutation(deleteNote)
        setRows(currentRows => currentRows.filter(row => String(getNoteId(row)) !== String(id)))
        setActiveNoteId(currentId => (
          String(currentId) === String(id) ? null : currentId
        ))
      } else {
        await deleteNote()
        await load()
      }
      notify('Data berhasil dihapus')
    } catch (error) {
      notify(error.message, true)
    }
  }

  const saveNote = async (note, payload) => {
    const noteId = getNoteId(note)
    if (noteId == null) {
      throw new Error('ID note tidak ditemukan, perubahan tidak disimpan')
    }

    return queueNoteMutation(async () => {
      await apiRequest(baseUrl, 'PUT', `/note/${noteId}`, {
        title: payload.title,
        content: payload.content
      })
      setRows(currentRows => currentRows.map(row => {
        const rowId = getNoteId(row)
        return String(rowId) === String(noteId)
          ? { ...row, ...payload }
          : row
      }))
    })
  }

  const selectResource = (key) => {
    setType(key)
    setQuery('')
    setSidebarOpen(false)
    setPasswordsDecrypted(false)
    setAccountDetail(null)
    if (key === 'note') setActiveNoteId(null)
  }

  const openCreateForm = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEditForm = (row) => {
    setEditing(row)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditing(null)
  }

  const decryptPasswords = () => {
    if (type !== 'password' || passwordsDecrypted) return

    setRows(currentRows => currentRows.map(row => ({
      ...row,
      password: decryptVigenere(row.password)
    })))
    setPasswordsDecrypted(true)
  }

  const showAccountDetail = async row => {
    const id = row?.idAccount
    if (id == null) return

    setAccountDetailLoading(true)
    setAccountDetail({ ...row })
    try {
      const response = await apiRequest(baseUrl, 'GET', `/account/${id}`)
      setAccountDetail(response.data || response)
    } catch (error) {
      notify(error.message, true)
      setAccountDetail(null)
    } finally {
      setAccountDetailLoading(false)
    }
  }

  return (
    <div className={`app ${sidebarOpen ? '' : 'sidebarClosed'}`}>
      <div
        className={`sidebarOverlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />
      <aside className={sidebarOpen ? 'open' : ''}>
        <div className="sidebarTop">
          <div className="brand"><span>A</span> MyApp</div>
          <button
            className="closeSidebar"
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Tutup menu navigasi"
          >
            ×
          </button>
        </div>
        <nav>
          {Object.entries(RESOURCES).map(([key, value]) => (
            <button
              key={key}
              className={type === key ? 'active' : ''}
              onClick={() => selectResource(key)}
            >
              {key === 'menu' ? '⌂' : key === 'module' ? '▦' : key === 'password' ? '▣' : '✎'} {value.label}
            </button>
          ))}
        </nav>
      </aside>

      <main>
        <header className="moduleHeader">
          <button
            className="menuButton"
            type="button"
            onClick={() => setSidebarOpen(current => !current)}
            aria-label="Buka menu navigasi"
            aria-expanded={sidebarOpen}
          >
            <span />
            <span />
            <span />
          </button>
          {type !== 'note' && (
            <h1 onClick={decryptPasswords}>{resource.label}</h1>
          )}
          {type === 'note' && (
            <div className="noteHeaderTools">
              <input
                placeholder="Cari data..."
                value={query}
                onChange={event => setQuery(event.target.value)}
                aria-label="Cari catatan"
              />
              <button
                type="button"
                className="button addButton"
                onClick={openCreateForm}
                aria-label="Tambah catatan"
                title="Tambah catatan"
              >
                +
              </button>
            </div>
          )}
          {type !== 'note' && (
            <div className="headerActions">
              <input
                placeholder="Cari data..."
                value={query}
                onChange={event => setQuery(event.target.value)}
                aria-label={`Cari ${resource.label}`}
              />
              <button
                className="button addButton"
                onClick={openCreateForm}
                aria-label={`Tambah ${resource.singular}`}
                title={`Tambah ${resource.singular}`}
              >
                +
              </button>
            </div>
          )}
        </header>

        {type === 'note' ? (
          <NotesWorkspace
            rows={filtered}
            activeId={activeNoteId}
            onSelect={setActiveNoteId}
            onCreate={openCreateForm}
            onSave={saveNote}
            onDelete={remove}
          />
        ) : (
          <section className="panel">
            <DataTable
              resource={resource}
              rows={filtered}
              onEdit={openEditForm}
              onDelete={remove}
              onDetail={type === 'password' ? showAccountDetail : undefined}
            />
          </section>
        )}
      </main>

      {formOpen && (
        <DataForm
          resource={resource}
          item={editing}
          onClose={closeForm}
          onSubmit={save}
        />
      )}

      {accountDetail && (
        <AccountDetail
          account={accountDetail}
          loading={accountDetailLoading}
          onClose={() => setAccountDetail(null)}
        />
      )}

      {toast && (
        <div className={`toast ${toast.error ? 'error' : ''}`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}
