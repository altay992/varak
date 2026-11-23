// npm run dev          → Python sunucusu + Vite; tarayıcıda http://localhost:5173
// npm run dev:desktop  → Vite + Electron (Electron sunucuyu kendisi başlatır)
import { spawn } from 'node:child_process'

const mode = process.argv[2] === 'desktop' ? 'desktop' : 'web'
const python = process.env.VARAK_PYTHON || (process.platform === 'win32' ? 'py' : 'python3')
const children = []

function run(command, args, env = {}) {
  const child = spawn(command, args, { stdio: 'inherit', shell: process.platform === 'win32', env: { ...process.env, ...env } })
  child.on('exit', (code) => { stop(); process.exit(code ?? 0) })
  children.push(child)
}

function stop() {
  for (const child of children) if (child.exitCode === null) child.kill()
}
process.on('SIGINT', () => { stop(); process.exit(0) })
process.on('SIGTERM', () => { stop(); process.exit(0) })

run('npx', ['vite'])
if (mode === 'web') {
  run(python, [...(python === 'py' ? ['-3'] : []), 'server/server.py', '--no-browser', '--port', '8765'])
  console.log('\nVarak (web, geliştirme): http://localhost:5173\n')
} else {
  run('npx', ['electron', '.'], { VARAK_DEV_URL: 'http://localhost:5173' })
}
