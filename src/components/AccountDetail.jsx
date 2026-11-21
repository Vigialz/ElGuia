import './AccountDetail.css'

const fields = [
  ['username', 'Username'],
  ['password', 'Password'],
  ['type', 'Type'],
  ['email', 'Email'],
  ['apps', 'Apps'],
  ['linkedWith', 'Linked with'],
  ['description', 'Deskripsi'],
  ['createdAt', 'Dibuat'],
  ['updatedAt', 'Diperbarui']
]

export default function AccountDetail({ account, loading, onClose }) {
  return (
    <div className="accountDetailBackdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <section className="accountDetail" role="dialog" aria-modal="true" aria-label="Detail account">
        <div className="accountDetailHead">
          <div>
            <span>ACCOUNT DETAIL</span>
            <h2>{account?.username || 'Detail account'}</h2>
          </div>
          <button type="button" className="iconButton" onClick={onClose} aria-label="Tutup detail">×</button>
        </div>
        <div className="accountDetailBody">
          {loading ? <div className="empty">Memuat detail...</div> : fields.map(([key, label]) => (
            <div className="detailItem" key={key}>
              <span>{label}</span>
              <strong>{account?.[key] || '-'}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}