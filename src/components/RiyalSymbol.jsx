// Official Saudi Riyal symbol — uses the approved SAMA glyph via the open-source
// "saudi_riyal" web font (https://github.com/abdulrysrr/new-saudi-riyal-symbol).
// Per SAMA guidelines, the symbol is placed before the numeral with a small gap.
export default function RiyalSymbol({ className = '' }) {
  return <span className={`icon-saudi_riyal ${className}`} aria-label="ريال سعودي" />
}
