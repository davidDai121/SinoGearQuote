import { build } from 'esbuild'

await build({
  entryPoints: ['src/main.jsx'],
  bundle: true,
  minify: true,
  sourcemap: false,
  outfile: 'assets/main.bundle.js',
  loader: { '.jsx': 'jsx', '.js': 'js' },
  define: { 'process.env.NODE_ENV': '"production"' },
})

console.log('Frontend built: assets/main.bundle.js')