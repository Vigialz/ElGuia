# MyApp React UI

UI CRUD sederhana untuk endpoint `/menu`, `/module`, dan `/note`.

## Menjalankan

```bash
cp .env.example .env
npm install
npm run dev
```

Buka `http://localhost:5173`.

## Endpoint

- GET/POST: `/menu`, `/module`, `/note`
- PUT/DELETE: `/menu/{id}`, `/module/{id}`, `/note/{id}`

Jika API belum terhubung, aplikasi menampilkan data contoh dalam mode demo. Operasi simpan/hapus tetap membutuhkan API.
