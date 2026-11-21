import './DataTable.css'

const formatDate = value => {
  if (!value) return '-'

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('id-ID')
}

export default function DataTable({ resource, rows, onEdit, onDelete, onDetail }) {
  if (!rows.length) {
    return <div className="empty">Data tidak ditemukan.</div>
  }

  const renderFieldValue = (row, field) => {
    if (field.key === 'password') {
      return String(row[field.key] ?? '-')
    }

    if (resource.id === 'idOverseer' && field.key === 'name') {
      const username = String(row[field.key] ?? '')
      const type = String(row.typeAccout ?? row.typeAccount ?? '').toLowerCase()
      const href = type === 'tiktok'
        ? `https://www.tikvib.com/story/${encodeURIComponent(username)}`
        : type === 'instagram'
          ? `https://insta-stories-viewer.com/${encodeURIComponent(username)}/`
          : null

      return href ? (
        <a href={href} target="_blank" rel="noreferrer">
          {username}
        </a>
      ) : username || '-'
    }

    if (resource.id === 'idOverseer' && field.key === 'typeAccout') {
      return String(row.typeAccout ?? row.typeAccount ?? '-')
    }

    if (field.type !== 'checkbox') {
      return String(row[field.key] ?? '-')
    }

    const isActive = Boolean(row[field.key])
    return (
      <span className={`badge ${isActive ? '' : 'off'}`}>
        {isActive ? 'Aktif' : 'Nonaktif'}
      </span>
    )
  }

  const tableFields = resource.fields.filter(field => !field.formOnly)

  return (
    <div className={`tableWrap ${resource.tableClass || ''}`}>
      <table>
        <thead>
          <tr>
            {tableFields.map(field => (
              <th key={field.key}>{field.label}</th>
            ))}
            {resource.id !== 'idOverseer' && <th>Dibuat</th>}
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row[resource.id] ?? row.id ?? row.idOverseer ?? row.id_overseer}>
              {tableFields.map(field => (
                <td key={field.key} data-label={field.label}>{renderFieldValue(row, field)}</td>
              ))}
              {resource.id !== 'idOverseer' && (
                <td className="muted" data-label="Dibuat">
                  {formatDate(row.createdAt || row.created_at)}
                </td>
              )}
              <td className="actions" data-label="Aksi">
                {onDetail && (
                  <button
                    type="button"
                    className="button small secondary detailButton"
                    onClick={() => onDetail(row)}
                    aria-label="Lihat detail"
                    title="Lihat detail"
                  >
                    ⓘ
                  </button>
                )}
                <button
                  className="button small secondary"
                  onClick={() => onEdit(row)}
                >
                  Edit
                </button>
                <button
                  className="button small danger"
                  onClick={() => onDelete(row)}
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
