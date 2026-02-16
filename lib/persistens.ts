import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

/**
 * Filbasert lagring for utviklingsmiljø.
 * 
 * Løser problemet med at in-memory data forsvinner ved hot-reload.
 * Data lagres som JSON-filer i /tmp/bibliotek-data/.
 * 
 * I produksjon erstattes dette av Prisma/database.
 */

const DATA_DIR = join(process.cwd(), '.data')

function ensureDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true })
  }
}

export function lagreData<T>(nøkkel: string, data: T): void {
  try {
    ensureDir()
    const filsti = join(DATA_DIR, `${nøkkel}.json`)
    writeFileSync(filsti, JSON.stringify(data, null, 2), 'utf-8')
  } catch (error) {
    console.error(`Feil ved lagring av ${nøkkel}:`, error)
  }
}

export function hentData<T>(nøkkel: string, standardverdi: T): T {
  try {
    ensureDir()
    const filsti = join(DATA_DIR, `${nøkkel}.json`)
    if (existsSync(filsti)) {
      const innhold = readFileSync(filsti, 'utf-8')
      return JSON.parse(innhold) as T
    }
  } catch (error) {
    console.error(`Feil ved lesing av ${nøkkel}:`, error)
  }
  // Lagre standardverdien første gang
  lagreData(nøkkel, standardverdi)
  return standardverdi
}
