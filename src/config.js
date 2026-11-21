export const RESOURCES = {
  menu: {
    label: 'Menu',
    singular: 'Menu',
    id: 'idMenu',
    fields: [
      { key: 'menuOrder', label: 'Urutan', type: 'number' },
      { key: 'name', label: 'Nama', type: 'text' },
      { key: 'icon', label: 'Icon', type: 'text' }
    ]
  },
  module: {
    label: 'Module',
    singular: 'Module',
    id: 'idModule',
    fields: [
      { key: 'name', label: 'Nama', type: 'text' },
      { key: 'icon', label: 'Icon', type: 'text' },
      { key: 'description', label: 'Deskripsi', type: 'textarea' },
      { key: 'show', label: 'Tampilkan', type: 'checkbox' }
    ]
  },
  note: {
    label: 'Notes',
    singular: 'Note',
    id: 'idNote',
    fields: [
      { key: 'title', label: 'Judul', type: 'text' },
      { key: 'content', label: 'Isi Catatan', type: 'textarea' }
    ]
  },
  overseer: {
    label: 'Overseer',
    singular: 'Overseer',
    id: 'idOverseer',
    tableClass: 'mobileTable',
    fields: [
      { key: 'name', label: 'username', type: 'text' },
      {
        key: 'typeAccout',
        label: 'type',
        type: 'select',
        options: [
          { value: 'instagram', label: 'Instagram' },
          { value: 'tiktok', label: 'TikTok' }
        ]
      }
    ]
  },
  password: {
    label: 'Password Manager',
    singular: 'Account',
    endpoint: 'account',
    id: 'idAccount',
    tableClass: 'mobileTable',
    fields: [
      { key: 'username', label: 'Username', type: 'text' },
      { key: 'password', label: 'Password', type: 'text' },
      {
        key: 'type',
        label: 'Type',
        type: 'select',
        options: [
          { value: 'organik', label: 'Organik' },
          { value: 'linked', label: 'Linked' }
        ]
      },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'apps', label: 'Apps', type: 'text' },
      { key: 'linkedWith', label: 'Linked with', type: 'text', formOnly: true },
      { key: 'description', label: 'Deskripsi', type: 'textarea', formOnly: true }
    ]
  }
}

export const SAMPLE_DATA = {
  menu: [
    { idMenu: 1, menuOrder: 1, name: 'Dashboard', icon: 'home', createdAt: '2026-10-29T13:12:46.328969' },
    { idMenu: 51, menuOrder: 2, name: 'Notes', icon: 'sticky-note', createdAt: '2026-10-29T13:12:46.328969' }
  ],
  module: [
    { idModule: 51, name: 'Quick Notes', icon: 'note', description: 'Menyimpan catatan pribadi dengan cepat', show: true },
    { idModule: 101, name: 'Password Vault', icon: 'lock', description: 'Penyimpanan password terenkripsi', show: true }
  ],
  note: [
    { idNote: 1, title: 'Belajar Spring Boot', content: 'Mempelajari Controller, Service, Repository dan ResponseEntity.', created_at: '2026-10-29T13:30:34.153718' },
    { idNote: 51, title: 'Target Mingguan', content: 'Selesaikan fitur CRUD Notes dan Module.', created_at: '2026-10-29T13:30:34.153718' }
  ],
  password: []
}
