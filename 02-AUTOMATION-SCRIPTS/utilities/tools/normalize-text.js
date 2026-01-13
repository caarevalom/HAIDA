// tools/normalize-text.js
// Small helper to sanitize text ingestion: Unicode normalization, remove control chars,
// replace special whitespace, collapse spaces.

function sanitizeText(input) {
  if (typeof input !== 'string') return input
  // Unicode normalization (NFKC chosen for folding compatibility)
  let s = input.normalize('NFKC')
  // Remove C0/C1 control characters
  s = s.replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
  // Replace non-breaking and special spaces with normal space
  s = s.replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ')
  // Remove replacement characters (if any)
  s = s.replace(/�/g, '')
  // Trim and collapse multiple spaces/newlines into single spaces
  s = s.replace(/\s+/g, ' ').trim()
  return s
}

function cli() {
  const fs = require('fs')
  const path = require('path')
  const argv = process.argv.slice(2)
  if (argv.length === 0) {
    console.log('Usage: node normalize-text.js <file>')
    process.exit(1)
  }
  const p = path.resolve(argv[0])
  const data = fs.readFileSync(p, 'utf8')
  const out = sanitizeText(data)
  console.log(out)
}

if (require.main === module) cli()

module.exports = { sanitizeText }
