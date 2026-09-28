import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Link1, TickCircle } from 'iconsax-react'
import { decodeProjectShare, readShareTokenFromLocation } from '@/lib/shareLink'
import { useAppStore } from '@/store/appStore'
import { toast } from '@/store/toastStore'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Badge'

/**
 * Detects #share=… / ?share=… and offers to import the shared project.
 */
export function ShareImportBanner() {
  const location = useLocation()
  const navigate = useNavigate()
  const importSharedProject = useAppStore((s) => s.importSharedProject)
  const [pendingName, setPendingName] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { hash, search } = location

  useEffect(() => {
    const t = readShareTokenFromLocation({ hash, search })
    if (!t) {
      setPendingName(null)
      setToken(null)
      setError(null)
      return
    }
    let cancelled = false
    void (async () => {
      try {
        const payload = await decodeProjectShare(t)
        if (cancelled) return
        setToken(t)
        setPendingName(payload.project.name)
        setError(null)
      } catch (e) {
        if (cancelled) return
        setToken(null)
        setPendingName(null)
        setError(e instanceof Error ? e.message : 'Tautan berbagi tidak dapat dibaca')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [hash, search])

  if (!pendingName && !error) return null

  return (
    <Card className="mb-4 border-gold-500/30 bg-gold-100/40">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-ink-950">
            <Link1 size={16} variant="Bold" color="currentColor" />
            Tautan berbagi terdeteksi
          </div>
          {error ? (
            <p className="text-sm text-danger">{error}</p>
          ) : (
            <p className="text-sm text-ink-700">
              Impor proyek <strong>{pendingName}</strong> ke perangkat ini? Data lama Anda tidak
              dihapus — proyek baru akan ditambahkan.
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setPendingName(null)
              setToken(null)
              setError(null)
              navigate('/app', { replace: true })
            }}
          >
            Abaikan
          </Button>
          {token && pendingName ? (
            <Button
              size="sm"
              variant="gold"
              loading={busy}
              leftIcon={<TickCircle size={14} variant="Bold" color="currentColor" />}
              onClick={() => {
                setBusy(true)
                void (async () => {
                  try {
                    const payload = await decodeProjectShare(token)
                    const project = importSharedProject(payload.project)
                    toast('Proyek dari tautan berhasil diimpor')
                    navigate(`/app/projects/${project.id}`, { replace: true })
                  } catch (e) {
                    toast(
                      e instanceof Error ? e.message : 'Gagal mengimpor tautan',
                      'error',
                    )
                  } finally {
                    setBusy(false)
                  }
                })()
              }}
            >
              Impor proyek
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  )
}
