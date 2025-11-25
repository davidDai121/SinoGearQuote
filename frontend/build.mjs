import { build } from 'esbuild'

await build({
  entryPoints: ['src/main.jsx'],
  bundle: true,
  minify: true,
  sourcemap: false,
  outfile: 'assets/main.bundle.js',
  loader: { '.jsx': 'jsx', '.js': 'js' },
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env.API_BASE_URL': JSON.stringify(process.env.API_BASE_URL || ''),
    'process.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || '')
  },
})

console.log('Frontend built: assets/main.bundle.js')