import Database from 'better-sqlite3'

const db = new Database('sqlite.db')
const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
  .all() as { name: string }[]
console.log('Tables:', tables.map((t) => t.name))
db.close()
