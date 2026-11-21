import { useEffect, useState } from 'react'
import './DataForm.css'

function initialValues(fields, item) {
  return Object.fromEntries(
    fields.map(field => [
      field.key,
      item?.[field.key] ?? (field.key === 'typeAccout' ? item?.typeAccount : undefined) ?? (field.type === 'checkbox' ? false : '')
    ])
  )
}

export default function DataForm({ resource, item, onClose, onSubmit }) {
  const [values, setValues] = useState(() => initialValues(resource.fields, item))
  const [saving, setSaving] = useState(false)
  useEffect(() => setValues(initialValues(resource.fields, item)), [resource, item])

  const submit = async event => {
    event.preventDefault(); setSaving(true)
    const payload = { ...values }

    resource.fields.forEach(field => {
      if (field.type === 'number') {
        payload[field.key] = Number(payload[field.key])
      }
    })

    try { await onSubmit(payload) } finally { setSaving(false) }
  }

  const updateValue = (key, value) => {
    setValues(currentValues => ({ ...currentValues, [key]: value }))
  }

  return (
    <div
      className="backdrop"
      onMouseDown={event => event.target === event.currentTarget && onClose()}
    >
      <form className="modal" onSubmit={submit}>
        <div className="modalHead">
          <strong>{item ? 'Edit' : 'Tambah'} {resource.singular}</strong>
          <button type="button" className="iconButton" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modalBody">
          {resource.fields.map(field => {
            if (field.type === 'checkbox') {
              return (
                <label className="check" key={field.key}>
                  <input
                    type="checkbox"
                    checked={Boolean(values[field.key])}
                    onChange={event => updateValue(field.key, event.target.checked)}
                  />
                  {field.label}
                </label>
              )
            }

            return (
              <label key={field.key}>
                {field.label}
                {field.type === 'textarea' ? (
                  <textarea
                    value={values[field.key]}
                    onChange={event => updateValue(field.key, event.target.value)}
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={values[field.key]}
                    onChange={event => updateValue(field.key, event.target.value)}
                  >
                    <option value="" disabled>Pilih tipe</option>
                    {field.options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    placeholder={field.key === 'password' && item ? 'Kosongkan jika tidak ingin mengganti' : undefined}
                    value={values[field.key]}
                    onChange={event => updateValue(field.key, event.target.value)}
                  />
                )}
              </label>
            )
          })}
        </div>

        <div className="modalFoot">
          <button type="button" className="button secondary" onClick={onClose}>
            Batal
          </button>
          <button className="button" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  )
}
