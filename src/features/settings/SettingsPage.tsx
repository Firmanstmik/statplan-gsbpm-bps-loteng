import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Data,
  Refresh2,
  ShieldTick,
  DocumentText,
  InfoCircle,
  ExportSquare,
  Import,
  Book1,
  MagicStar,
  PresentionChart,
  Global,
} from 'iconsax-react'
import { useAppStore } from '@/store/appStore'
import { toast } from '@/store/toastStore'
import { getDemoRecordCounts, isDemoProject, resetOnboarding } from '@/demo/seed'
import { Card } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { HelpTip } from '@/components/ui/HelpTip'

export function SettingsPage() {
  const navigate = useNavigate()
  const loadDemoData = useAppStore((s) => s.loadDemoData)
  const resetDemo = useAppStore((s) => s.resetDemo)
  const exportDemoBundle = useAppStore((s) => s.exportDemoBundle)
  const importDemoBundle = useAppStore((s) => s.importDemoBundle)
  const projects = useAppStore((s) => s.projects)
  const projectCount = projects.length
  const demoProjectCount = projects.filter(isDemoProject).length
  const hasDemoProjects = demoProjectCount > 0
  const counts = getDemoRecordCounts()
  const fileRef = useRef<HTMLInputElement>(null)
  const [importMsg, setImportMsg] = useState('')
  const [confirm, setConfirm] = useState<null | 'load' | 'reset'>(null)

  function handleExportDemo() {
    const json = exportDemoBundle()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `statplan-demo-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast('Berkas demo berhasil diekspor')
  }

  function handleImportFile(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        importDemoBundle(String(reader.result ?? ''))
        const msg = `Berhasil mengimpor ${file.name}`
        setImportMsg(msg)
        toast(msg)
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Gagal mengimpor berkas demo.'
        setImportMsg(msg)
        toast(msg, 'error')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="mb-2">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink-600">
          Konfigurasi
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Pengaturan</h1>
      </div>

      <Card>
        <h2 className="mb-3 font-semibold">Navigasi cepat</h2>
        <p className="mb-3 text-sm text-ink-700">
          Pintasan ke halaman yang mungkin tidak muncul di bilah bawah perangkat seluler. Istilah yang
          membingungkan dijelaskan di FAQ.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" leftIcon={<Book1 size={14} variant="Bold" color="currentColor" />} onClick={() => navigate('/app/faq')}>
            FAQ
          </Button>
          <Button size="sm" variant="secondary" leftIcon={<MagicStar size={14} variant="Bold" color="currentColor" />} onClick={() => navigate('/app/assistant')}>
            Asisten
          </Button>
          <Button size="sm" variant="secondary" leftIcon={<PresentionChart size={14} variant="Bold" color="currentColor" />} onClick={() => navigate('/app/presentation')}>
            Presentasi
          </Button>
          <Button size="sm" variant="secondary" leftIcon={<InfoCircle size={14} variant="Bold" color="currentColor" />} onClick={() => navigate('/app/about')}>
            Tentang
          </Button>
        </div>
      </Card>

      <Card>
        <div className="mb-2 flex items-center gap-2">
          <Global size={18} variant="Bold" color="#0b3a5c" />
          <h2 className="font-semibold">Hosting & domain</h2>
        </div>
        <p className="text-sm leading-relaxed text-ink-700">
          Target publik sesuai arahan BPS: <strong>simulator.bpsloteng.net</strong> (Vercel).
          Deploy dari mesin lokal:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-ink-950 px-3 py-2.5 text-[11px] leading-relaxed text-ink-500">
{`npm run build
npx vercel login
npm run deploy:prod`}
        </pre>
        <p className="mt-3 text-xs text-ink-600">
          Setelah URL Vercel aktif, tambahkan CNAME <code className="rounded bg-ink-50 px-1">simulator</code>{' '}
          → nilai DNS Vercel. Panduan lengkap: berkas <strong>HOSTING.md</strong> di folder proyek.
        </p>
        <p className="mt-2 text-xs text-ink-600">
          Origin saat ini:{' '}
          <span className="font-medium text-ink-900">
            {typeof window !== 'undefined' ? window.location.origin : '—'}
          </span>
        </p>
      </Card>

      <Card className="relative overflow-hidden border-gold-500/20 bg-gradient-to-br from-gold-100/40 via-white to-white">
        <div className="mb-1 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-900 text-ink-500">
            <Data size={18} variant="Bold" color="currentColor" />
          </div>
          <h2 className="font-semibold">Mode demonstrasi</h2>
          <HelpTip topic="export" />
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink-700">
          Muat basis data contoh berisi {counts.projects} proyek OPD Kabupaten Lombok Tengah (
          {counts.variables} variabel, {counts.questionnaireItems} butir kuesioner) untuk
          demonstrasi kepada BPS.
        </p>
        <p className="mt-2 text-xs text-ink-600">
          Proyek aktif saat ini: {projectCount} · demo: {demoProjectCount} · proyek Anda:{' '}
          {projectCount - demoProjectCount}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            variant="gold"
            leftIcon={<Data size={16} variant="Bold" color="currentColor" />}
            onClick={() => {
              if (!hasDemoProjects) {
                loadDemoData()
                toast('Data demo berhasil ditambahkan tanpa mengubah proyek Anda')
              } else {
                setConfirm('load')
              }
            }}
          >
            {hasDemoProjects ? 'Perbarui data demo' : 'Muat data demo'}
          </Button>
          {hasDemoProjects ? (
            <Button
              variant="secondary"
              leftIcon={<Refresh2 size={16} variant="Bold" color="currentColor" />}
              onClick={() => setConfirm('reset')}
            >
              Bersihkan data demo
            </Button>
          ) : null}
          <Button
            variant="secondary"
            leftIcon={<ExportSquare size={16} variant="Bold" color="currentColor" />}
            onClick={handleExportDemo}
          >
            Ekspor berkas demo
          </Button>
          <Button
            variant="secondary"
            leftIcon={<Import size={16} variant="Bold" color="currentColor" />}
            onClick={() => fileRef.current?.click()}
          >
            Impor berkas demo
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleImportFile(f)
              e.target.value = ''
            }}
          />
        </div>
        {importMsg ? (
          <p className="mt-3 rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-800" role="status">
            {importMsg}
          </p>
        ) : null}
        <div className="mt-4 border-t border-border/60 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              resetOnboarding()
              toast('Panduan awal akan ditampilkan ulang')
              window.setTimeout(() => window.location.reload(), 400)
            }}
          >
            Tampilkan ulang panduan awal
          </Button>
        </div>
      </Card>

      {[
        {
          icon: DocumentText,
          title: 'Penyimpanan',
          body: (
            <>
              Seluruh proyek disimpan di penyimpanan peramban pada perangkat Anda. Tidak ada akun
              atau server backend pada versi ini. Ekspor/impor berkas demo memakai format yang
              siap dimigrasikan ke basis data institusi.
            </>
          ),
        },
        {
          icon: ShieldTick,
          title: 'Kerangka proses bisnis',
          body: 'GSBPM 5.2 · Materi Proses Bisnis Statistik (BPS). Rekomendasi jenis kegiatan bersifat rule-based dan merujuk subproses resmi modul.',
        },
        {
          icon: InfoCircle,
          title: 'Privasi',
          body: 'Jangan masukkan data pribadi responden ke dalam workspace. Platform ini untuk perencanaan, bukan penyimpanan mikrodata. Data demo tidak mengandung identitas individu nyata.',
        },
        {
          icon: ShieldTick,
          title: 'Identitas visual',
          body: (
            <>
              Identitas institusi BPS ditampilkan terpisah dari logo produk StatPlan. Logo resmi BPS
              dapat dipasang pada folder branding aplikasi tanpa mengubah desain logo tersebut.
            </>
          ),
        },
      ].map((item) => (
        <Card key={item.title} className="transition-all duration-300 hover:shadow-(--shadow-lift)">
          <div className="mb-2 flex items-center gap-2">
            <item.icon size={18} variant="Bold" color="#0b3a5c" />
            <h2 className="font-semibold">{item.title}</h2>
          </div>
          <p className="text-sm leading-relaxed text-ink-700">{item.body}</p>
        </Card>
      ))}

      <p className="text-center text-xs text-ink-600">
        Butuh penjelasan istilah?{' '}
        <Link to="/app/faq" className="font-medium text-ink-900 underline-offset-2 hover:underline">
          Buka FAQ
        </Link>
      </p>

      <ConfirmDialog
        open={confirm === 'load'}
        title="Perbarui data demo?"
        description="Proyek contoh akan diperbarui ke versi terbaru. Proyek yang Anda buat sendiri tidak akan diubah atau dihapus."
        confirmLabel="Perbarui data demo"
        cancelLabel="Batalkan"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          loadDemoData()
          toast('Data demo berhasil diperbarui tanpa mengubah proyek Anda')
          setConfirm(null)
        }}
      />
      <ConfirmDialog
        open={confirm === 'reset'}
        title="Bersihkan data demo?"
        description="Proyek contoh akan dihapus. Proyek yang Anda buat sendiri tidak akan terpengaruh. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Bersihkan data demo"
        cancelLabel="Batalkan"
        danger
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          resetDemo()
          toast('Data demo berhasil dibersihkan')
          setConfirm(null)
        }}
      />
    </div>
  )
}
