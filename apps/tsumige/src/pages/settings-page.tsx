import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { downloadBackup, downloadFile, getBackup } from '@/lib/backup'
import { buildCsv, type CsvKind } from '@/lib/csv'

export function SettingsPage() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [includeRetired, setIncludeRetired] = useState(false)
  const [csvError, setCsvError] = useState<string | null>(null)
  const [csvMessage, setCsvMessage] = useState<string | null>(null)
  async function exportBackup() {
    setBusy(true); setError(null); setMessage(null)
    try {
      const backup = await getBackup()
      downloadBackup(backup)
      setMessage(`Còpia preparada: ${backup.fitxes_joc.length} jocs, ${backup.exemplars.length} exemplars, ${backup.experiencies.length} experiències i ${backup.proposits.length} propòsits. Comprova la carpeta de descàrregues.`)
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'No s’ha pogut preparar la còpia.') }
    finally { setBusy(false) }
  }
  async function exportCsv(kind: CsvKind) {
    setBusy(true); setCsvError(null); setCsvMessage(null)
    try {
      const backup = await getBackup()
      const result = buildCsv(backup, kind, includeRetired)
      downloadFile(result.content, `tsumige-${kind}${kind === 'colleccio' && includeRetired ? '-amb-retirats' : ''}-${backup.exported_at.replace(/[:.]/g, '-')}.csv`, 'text/csv;charset=utf-8')
      setCsvMessage(`Exportació preparada: ${result.count} ${kind === 'colleccio' ? 'exemplars' : 'experiències'}. Comprova la carpeta de descàrregues.`)
    } catch (caught) { setCsvError(caught instanceof Error ? caught.message : 'No s’ha pogut preparar l’exportació.') }
    finally { setBusy(false) }
  }
  return <div className="page-container"><h1 className="page-title">Configuració</h1>
    <Button asChild variant="outline" className="mt-5"><Link to="/?vista=contrasenya">Canvia la contrasenya</Link></Button>
    <section className="mt-8 rounded-xl border bg-card p-6 sm:p-8" aria-labelledby="backup-title">
      <h2 id="backup-title" className="text-lg font-semibold">Còpia de seguretat</h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Descarrega totes les dades: jocs, exemplars actius i retirats, experiències amb notes i valoracions, i propòsits de tots els anys. La còpia inclou els enllaços de les portades.</p>
      <Button className="mt-5" disabled={busy} onClick={() => void exportBackup()}>{busy ? 'Preparant la còpia…' : 'Descarrega còpia de seguretat'}</Button>
      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="mt-4 text-sm">{message}</p>}
      <p className="mt-4 text-xs text-muted-foreground">Es descarrega un arxiu JSON. La recuperació d’una còpia des de l’aplicació encara està pendent.</p>
    </section>
    <section className="mt-6 rounded-xl border bg-card p-6 sm:p-8" aria-labelledby="csv-title"><h2 id="csv-title" className="text-lg font-semibold">Exporta per consultar amb Excel</h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">La col·lecció inclou una fila per exemplar. El registre de jocs jugats inclou una fila per experiència, també dels jocs que no tens a la col·lecció.</p>
      <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" disabled={busy} checked={includeRetired} onChange={event => setIncludeRetired(event.target.checked)} />Inclou els exemplars retirats a l’exportació de la col·lecció</label>
      <div className="mt-5 flex flex-wrap gap-3"><Button variant="outline" disabled={busy} onClick={() => void exportCsv('colleccio')}>Descarrega col·lecció CSV</Button><Button variant="outline" disabled={busy} onClick={() => void exportCsv('historial')}>Descarrega jocs jugats CSV</Button></div>
      {csvError && <p role="alert" className="mt-4 text-sm text-red-700">{csvError}</p>}{csvMessage && <p role="status" className="mt-4 text-sm">{csvMessage}</p>}
      <p className="mt-4 text-xs text-muted-foreground">Els canvis que facis al CSV no s’apliquen a l’aplicació. Per conservar totes les dades i relacions, descarrega també la còpia JSON.</p>
    </section>
    <section className="mt-6 rounded-xl border bg-card p-6 sm:p-8"><h2 className="text-lg font-semibold">Jocs retirats</h2><p className="mt-3 text-sm text-muted-foreground">Consulta els exemplars que has retirat i torna’ls a la col·lecció quan calgui.</p><Button asChild variant="outline" className="mt-5"><Link to="/?vista=retirats">Veure els jocs retirats</Link></Button></section>
  </div>
}
