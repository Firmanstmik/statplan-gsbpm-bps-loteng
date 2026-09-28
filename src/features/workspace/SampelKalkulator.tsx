import { useMemo, useState } from 'react'
import { Calculator, TickCircle } from 'iconsax-react'
import {
  formatSampleResultLine,
  yamaneSampleSize,
  zSampleSize,
  Z_LEVELS,
} from '@/lib/sampleSize'
import { Button } from '@/components/ui/Button'
import { Field, Input, Label, Select } from '@/components/ui/Field'
import { HelpTip } from '@/components/ui/HelpTip'
import { PdfRefBadge } from '@/components/ui/PdfRefBadge'

/**
 * Sample-size widget for Survei design (Design 2.4).
 * Writes human-readable result into ukuranSampel when applied.
 */
export function SampelKalkulator({
  value,
  onApply,
}: {
  value: string
  onApply: (ukuranSampel: string, metodeHint?: string) => void
}) {
  const [N, setN] = useState('10000')
  const [ePct, setEPct] = useState('5')
  const [mode, setMode] = useState<'yamane' | 'z'>('yamane')
  const [zLabel, setZLabel] = useState('95%')
  const [p, setP] = useState('0.5')

  const result = useMemo(() => {
    const pop = Number(N.replace(/[^\d.]/g, ''))
    const e = Number(ePct.replace(/[^\d.]/g, '')) / 100
    if (!Number.isFinite(pop) || pop <= 0 || !Number.isFinite(e) || e <= 0) return null
    if (mode === 'yamane') return yamaneSampleSize(pop, e)
    const z = Z_LEVELS.find((x) => x.label === zLabel)?.z ?? 1.96
    const prop = Number(p)
    if (!Number.isFinite(prop)) return null
    return zSampleSize(pop, z, prop, e)
  }, [N, ePct, mode, zLabel, p])

  return (
    <div className="rounded-2xl border border-border bg-ink-50/60 p-4 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Calculator size={18} variant="Bold" color="#0b3a5c" />
        <h3 className="font-semibold text-ink-950">Kalkulator ukuran sampel</h3>
        <HelpTip topic="sampling" />
        <PdfRefBadge ref="Hal. 48" />
      </div>
      <p className="text-xs text-ink-700">
        Alat bantu perencanaan (rumus Yamane / Z). Hasil bersifat ilustratif — desain sampel final
        perlu ditinjau ahli metodologi. Bukan standar resmi yang menggantikan kajian sampling.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field>
          <Label>Populasi (N)</Label>
          <Input
            inputMode="numeric"
            value={N}
            onChange={(e) => setN(e.target.value)}
            placeholder="Contoh: 10000"
          />
        </Field>
        <Field>
          <Label>Margin error (e) %</Label>
          <Input
            inputMode="decimal"
            value={ePct}
            onChange={(e) => setEPct(e.target.value)}
            placeholder="5"
          />
        </Field>
        <Field>
          <Label>Rumus</Label>
          <Select value={mode} onChange={(e) => setMode(e.target.value as 'yamane' | 'z')}>
            <option value="yamane">Yamane</option>
            <option value="z">Z + koreksi populasi</option>
          </Select>
        </Field>
        {mode === 'z' ? (
          <>
            <Field>
              <Label>Tingkat keyakinan</Label>
              <Select value={zLabel} onChange={(e) => setZLabel(e.target.value)}>
                {Z_LEVELS.map((l) => (
                  <option key={l.label} value={l.label}>
                    {l.label} (Z={l.z})
                  </option>
                ))}
              </Select>
            </Field>
            <Field>
              <Label>Proporsi (p)</Label>
              <Input
                inputMode="decimal"
                value={p}
                onChange={(e) => setP(e.target.value)}
                placeholder="0.5"
              />
            </Field>
          </>
        ) : null}
      </div>

      {result ? (
        <div className="rounded-xl border border-ink-900/10 bg-white px-3 py-3 text-sm">
          <div className="font-semibold text-ink-950">n ≈ {result.n} unit</div>
          <p className="mt-1 text-xs text-ink-700">{result.formula}</p>
          <p className="mt-1 text-xs text-ink-600">{result.note}</p>
          <Button
            className="mt-3"
            size="sm"
            variant="gold"
            leftIcon={<TickCircle size={14} variant="Bold" color="currentColor" />}
            onClick={() => {
              const pop = Number(N.replace(/[^\d.]/g, ''))
              const e = Number(ePct.replace(/[^\d.]/g, '')) / 100
              const line = formatSampleResultLine(result, pop, e)
              onApply(
                line,
                mode === 'yamane'
                  ? 'Perhitungan awal Yamane (perlu ditinjau ahli metodologi)'
                  : 'Perhitungan awal Z + FPC (perlu ditinjau ahli metodologi)',
              )
            }}
          >
            Terapkan ke ukuran sampel
          </Button>
          {value.trim() ? (
            <p className="mt-2 text-[11px] text-ink-600">Nilai saat ini: {value}</p>
          ) : null}
        </div>
      ) : (
        <p className="text-xs text-ink-600">Isi N dan margin error yang valid untuk menghitung.</p>
      )}
    </div>
  )
}
