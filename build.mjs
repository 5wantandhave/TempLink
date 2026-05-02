import { build } from 'esbuild'
import { cpSync, mkdirSync, readdirSync, rmSync, statSync } from 'fs'
import { join, relative } from 'path'

rmSync('dist', { recursive: true, force: true })
mkdirSync('dist', { recursive: true })

await build({
  entryPoints: ['src/worker.ts'],
  bundle: true,
  outfile: 'dist/_worker.js',
  format: 'esm',
  minify: true,
})

function copyDir(src, dest) {
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    const srcPath = join(src, entry.name)
    const destPath = join(dest, entry.name)

    if (entry.isDirectory()) {
      mkdirSync(destPath, { recursive: true })
      copyDir(srcPath, destPath)
    } else {
      cpSync(srcPath, destPath, { force: true })
    }
  }
}

copyDir('src/public', 'dist')

console.log('Build complete: dist/')
