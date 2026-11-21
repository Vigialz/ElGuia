import { useEffect, useRef, useState } from 'react'
import './NotesWorkspace.css'

const getNoteId = note => note?.idNote ?? note?.id ?? note?.id_note

export default function NotesWorkspace({ rows, activeId, onSelect, onCreate, onSave, onDelete }) {
  const activeNote = rows.find(note => String(getNoteId(note)) === String(activeId)) || rows[0]
  const [draft, setDraft] = useState({ title: '', content: '' })
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const draftRef = useRef(draft)
  const activeNoteRef = useRef(activeNote)
  const dirtyRef = useRef(false)
  const saveTimerRef = useRef(null)

  useEffect(() => {
    activeNoteRef.current = activeNote
    setDraft({
      title: activeNote?.title || '',
      content: activeNote?.content || ''
    })
    draftRef.current = {
      title: activeNote?.title || '',
      content: activeNote?.content || ''
    }
    dirtyRef.current = false
    setSaveMessage('')
  }, [activeNote])

  const saveDraft = async (note, payload, silent = true) => {
    if (!note || !dirtyRef.current) return

    setSaving(true)
    setSaveMessage('Menyimpan...')
    try {
      await onSave(note, payload, silent)
      dirtyRef.current = false
      setSaveMessage('Tersimpan')
    } catch {
      setSaveMessage('Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!activeNote || !dirtyRef.current) return undefined

    clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      saveDraft(activeNoteRef.current, draftRef.current)
    }, 700)

    return () => clearTimeout(saveTimerRef.current)
  }, [draft, activeNote])

  const selectNote = note => {
    clearTimeout(saveTimerRef.current)
    saveDraft(activeNoteRef.current, draftRef.current)
    onSelect(getNoteId(note))
  }

  const save = async event => {
    event.preventDefault()
    clearTimeout(saveTimerRef.current)
    await saveDraft(activeNote, draft, false)
  }

  const removeNote = () => {
    clearTimeout(saveTimerRef.current)
    dirtyRef.current = false
    onDelete(activeNote)
  }

  const createNote = async () => {
    clearTimeout(saveTimerRef.current)
    await saveDraft(activeNoteRef.current, draftRef.current)
    onCreate()
  }

  const updateDraft = (key, value) => {
    const nextDraft = { ...draftRef.current, [key]: value }
    draftRef.current = nextDraft
    dirtyRef.current = true
    setDraft(nextDraft)
    setSaveMessage('Belum tersimpan')
  }

  return (
    <section className="notesWorkspace">
      <div className="notesTabs" aria-label="Daftar catatan">
        <div className="tabList">
          {rows.map(note => (
            <button
              type="button"
              key={getNoteId(note)}
              className={`noteTab ${String(getNoteId(activeNote)) === String(getNoteId(note)) ? 'active' : ''}`}
              onClick={() => selectNote(note)}
            >
              <span>{note.title || 'Tanpa judul'}</span>
              <small>#{getNoteId(note)}</small>
            </button>
          ))}
          {!rows.length && <div className="emptyTabs">Belum ada catatan.</div>}
        </div>
      </div>

      <form className="noteEditor" onSubmit={save}>
        {activeNote ? (
          <>
            <div className="editorTop">
              <input
                className="noteTitleInput"
                value={draft.title}
                onChange={event => updateDraft('title', event.target.value)}
                placeholder="Judul catatan"
                aria-label="Judul catatan"
                required
              />
              <div className="editorActions">
                <button type="button" className="button small danger" onClick={removeNote}>Hapus</button>
                <button className="button small" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </div>
            <textarea
              className="noteContentInput"
              value={draft.content}
              onChange={event => updateDraft('content', event.target.value)}
              placeholder="Mulai menulis..."
              aria-label="Isi catatan"
              required
            />
            <span className="saveMessage" aria-live="polite">{saveMessage}</span>
          </>
        ) : (
          <div className="empty editorEmpty">
            <strong>Mulai catatan baru</strong>
            <span>Pilih tab atau buat catatan pertama kamu.</span>
            <button type="button" className="button" onClick={createNote}>+ Tambah catatan</button>
          </div>
        )}
      </form>
    </section>
  )
}