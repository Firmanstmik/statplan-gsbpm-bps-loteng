import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MagicStar, ArrowRight2, InfoCircle, Hierarchy, TickCircle } from 'iconsax-react'
import { recommendJenisKegiatan, generateObjectives } from '@/domain/aiPlanner'
import { GSBPM_PHASES, isSubProcessVisible } from '@/domain/gsbpm'
import { catatanJenis, cariContohTopik } from '@/content/contohTopik'
import { Card, Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Field, Label, Textarea, Select } from '@/components/ui/Field'
import { HelpTip } from '@/components/ui/HelpTip'
import { cn, jenisLabel } from '@/lib/utils'

type Mode = 'recommend' | 'brainstorm'

/**
 * Assistant: jenis recommendation + quick GSBPM brainstorm (no document export).
 */
export function AssistantPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('recommend')
  const [prompt, setPrompt] = useState('')
  const [dataAvailable, setDataAvailable] = useState<'unknown' | 'yes' | 'no'>('unknown')
  const [needCoverage, setNeedCoverage] = useState<'sample' | 'full' | 'admin'>('sample')
  const [submitted, setSubmitted] = useState(false)

  const result = useMemo(() => {
    if (!submitted || prompt.trim().length < 8) return null
    return recommendJenisKegiatan({
      description: prompt,
      dataAvailable: dataAvailable === 'unknown' ? undefined : dataAvailable === 'yes',
      needCoverage,
    })
  }, [prompt, dataAvailable, needCoverage, submitted])

  const brainstorm = useMemo(() => {
    if (!result) return null
    const jenis = result.jenis
    const topik = cariContohTopik(prompt)
    const phases = GSBPM_PHASES.map((ph) => {
      const subs = ph.subProcesses.filter((sp) => isSubProcessVisible(sp.skipWhen, jenis))
      const skipped = ph.subProcesses.filter((sp) => !isSubProcessVisible(sp.skipWhen, jenis))
      return {
        code: ph.code,
        title: ph.titleId,
        subCount: subs.length,
        skipLabels: skipped.map((s) => s.code),
      }
    })
    return { jenis, topik, phases, note: catatanJenis(jenis) }
  }, [result, prompt])

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-ink-100 px-3 py-1 text-sm font-medium text-ink-800 ring-1 ring-ink-900/5">
          <MagicStar size={16} variant="Bold" color="currentColor" />
          Asisten perencanaan
          <HelpTip topic="brainstorm" />
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Asisten kebutuhan statistik
        </h1>
        <p className="mt-2 text-ink-700">
          Aturan sederhana StatPlan yang merujuk materi BPS — bukan AI generatif bebas. Pilih mode
          saran awal jenis kegiatan, atau cek cepat kesesuaian GSBPM tanpa membuat dokumen.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            { id: 'recommend' as const, label: 'Saran awal jenis', icon: MagicStar },
            { id: 'brainstorm' as const, label: 'Cek cepat GSBPM', icon: Hierarchy },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              setMode(m.id)
              setSubmitted(false)
            }}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition',
              mode === m.id
                ? 'bg-ink-900 text-white'
                : 'bg-white text-ink-700 ring-1 ring-border hover:bg-ink-50',
            )}
          >
            <m.icon size={14} variant="Bold" color="currentColor" />
            {m.label}
          </button>
        ))}
      </div>

      <Card className="space-y-4 border-ink-900/5 shadow-(--shadow-soft)">
        <Field>
          <Label>Jelaskan kebutuhan Anda</Label>
          <Textarea
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value)
              setSubmitted(false)
            }}
            placeholder="Contoh: Kami ingin mengukur kepuasan layanan di 30 puskesmas. Data kunjungan sudah ada di sistem dinas, tetapi skor kepuasan belum pernah dikumpulkan."
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <Label>Ketersediaan data</Label>
            <Select
              value={dataAvailable}
              onChange={(e) => {
                setDataAvailable(e.target.value as 'unknown' | 'yes' | 'no')
                setSubmitted(false)
              }}
            >
              <option value="unknown">Belum tahu</option>
              <option value="yes">Data relevan sudah tersedia</option>
              <option value="no">Perlu pengumpulan baru</option>
            </Select>
          </Field>
          <Field>
            <Label>Cakupan yang dibutuhkan</Label>
            <Select
              value={needCoverage}
              onChange={(e) => {
                setNeedCoverage(e.target.value as 'sample' | 'full' | 'admin')
                setSubmitted(false)
              }}
            >
              <option value="sample">Sampel / sebagian unit</option>
              <option value="full">Pendataan lengkap seluruh unit</option>
              <option value="admin">Data administratif yang sudah ada</option>
            </Select>
          </Field>
        </div>
        <div className="flex flex-col items-start gap-1.5">
          {prompt.trim().length < 8 ? (
            <p className="text-xs text-ink-600">
              Tuliskan minimal 8 karakter agar asisten dapat menganalisis kebutuhan.
            </p>
          ) : null}
          <Button
            leftIcon={
              mode === 'brainstorm' ? (
                <Hierarchy size={16} variant="Bold" color="currentColor" />
              ) : (
                <MagicStar size={16} variant="Bold" color="currentColor" />
              )
            }
            onClick={() => setSubmitted(true)}
            disabled={prompt.trim().length < 8}
            tooltip={
              prompt.trim().length < 8
                ? 'Deskripsikan kebutuhan minimal 8 karakter'
                : mode === 'brainstorm'
                  ? 'Cek kesesuaian GSBPM tanpa generate dokumen'
                  : 'Analisis jenis kegiatan yang sesuai'
            }
          >
            {mode === 'brainstorm' ? 'Cek kesesuaian GSBPM' : 'Analisis kebutuhan'}
          </Button>
        </div>
      </Card>

      {result && mode === 'recommend' ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <Card className="border-gold-500/20 bg-gradient-to-br from-gold-100/30 via-white to-white">
            <div className="mb-3 flex gap-2">
              <Badge tone="brand">{jenisLabel(result.jenis)}</Badge>
              <Badge tone="gold">Saran awal</Badge>
            </div>
            <p className="mb-3 text-xs text-ink-600">
              Saran awal berdasarkan aturan sederhana StatPlan, bukan keputusan metodologis atau
              rekomendasi resmi BPS.
            </p>
            <ul className="space-y-2.5 text-sm text-ink-800">
              {result.rationale.map((r) => (
                <li key={r} className="flex gap-2">
                  <InfoCircle size={16} variant="Bold" color="#2a74a8" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 rounded-xl bg-ink-50/80 p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-600">
                Contoh tujuan
              </div>
              <ul className="space-y-1.5 text-sm text-ink-800">
                {generateObjectives(prompt.slice(0, 40), result.jenis).map((o) => (
                  <li key={o}>• {o}</li>
                ))}
              </ul>
            </div>
            <Button
              className="mt-5"
              variant="gold"
              rightIcon={<ArrowRight2 size={16} variant="Bold" color="currentColor" />}
              onClick={() => navigate('/app/new')}
            >
              Lanjutkan ke proyek baru
            </Button>
          </Card>
        </motion.div>
      ) : null}

      {result && brainstorm && mode === 'brainstorm' ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 space-y-4"
        >
          <Card className="border-ink-900/10">
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge tone="brand">{jenisLabel(brainstorm.jenis)}</Badge>
              <Badge tone="gold">{brainstorm.topik.label}</Badge>
              <Badge tone="success">Tanpa dokumen</Badge>
            </div>
            <p className="text-sm text-ink-800">{brainstorm.note}</p>
            <p className="mt-2 text-xs text-ink-600">
              Mode ini hanya membantu mengecek kesesuaian GSBPM. Tidak membuat proyek dan tidak
              mengunduh Word — cocok untuk diskusi cepat dengan BPS/OPD.
            </p>
          </Card>
          <Card>
            <h2 className="mb-3 font-semibold">Fase yang akan dilalui</h2>
            <ul className="space-y-2">
              {brainstorm.phases.map((ph) => (
                <li
                  key={ph.code}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <span className="font-medium text-ink-950">
                    {ph.code}. {ph.title}
                  </span>
                  <span className="text-xs text-ink-600">
                    {ph.subCount} subproses aktif
                    {ph.skipLabels.length
                      ? ` · dilewati: ${ph.skipLabels.join(', ')}`
                      : ''}
                  </span>
                </li>
              ))}
            </ul>
            <ul className="mt-4 space-y-2 text-sm text-ink-800">
              <li className="flex gap-2">
                <TickCircle size={16} variant="Bold" color="#0f7b4c" />
                Wajib cek portal Sirusa/Romantik sebelum pengumpulan baru.
              </li>
              <li className="flex gap-2">
                <TickCircle size={16} variant="Bold" color="#0f7b4c" />
                {brainstorm.jenis === 'survei'
                  ? 'Siapkan kerangka sampel + hitung n (Yamane/Z di Perancangan).'
                  : brainstorm.jenis === 'kompromin'
                    ? 'Fokus PKS/LADU dan pemetaan register administratif.'
                    : 'Pastikan cakupan seluruh unit (tanpa sampling).'}
              </li>
              <li className="flex gap-2">
                <TickCircle size={16} variant="Bold" color="#0f7b4c" />
                Sektoral: siapkan draf rekomendasi kegiatan ke BPS (Design 2.6).
              </li>
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setMode('recommend')}
              >
                Lihat alasan saran
              </Button>
              <Button
                variant="gold"
                size="sm"
                rightIcon={<ArrowRight2 size={14} variant="Bold" color="currentColor" />}
                onClick={() => navigate('/app/new')}
              >
                Buat proyek dari kebutuhan ini
              </Button>
            </div>
          </Card>
        </motion.div>
      ) : null}
    </div>
  )
}
