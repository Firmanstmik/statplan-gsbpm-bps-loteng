/** Source hierarchy labels shared by every surface (see docs/claude-source-inventory.md). */
export type SourceKind = 'A' | 'B' | 'C' | 'FORMAT' | 'USER' | 'STATPLAN'

export function sourceLabel(kind: SourceKind, page?: number | string): string {
  switch (kind) {
    case 'A':
      return page != null && page !== ''
        ? `Menurut Materi Proses Bisnis · Hal. ${page}`
        : 'Menurut Materi Proses Bisnis'
    case 'B':
      return page != null && page !== ''
        ? `Penjelasan sederhana · Hal. ${page}`
        : 'Penjelasan sederhana berdasarkan materi'
    case 'C':
      return 'Contoh ilustratif StatPlan'
    case 'FORMAT':
      return 'Format kerja StatPlan'
    case 'USER':
      return 'Isian Anda'
    case 'STATPLAN':
      return 'Penjelasan StatPlan'
  }
}

