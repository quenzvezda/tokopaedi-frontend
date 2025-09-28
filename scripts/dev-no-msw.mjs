import { spawn } from 'node:child_process'

const isWindows = process.platform === 'win32'
const command = 'npm'
const args = ['run', 'dev']

const child = spawn(command, args, {
  stdio: 'inherit',
  shell: isWindows,
  env: {
    ...process.env,
    VITE_USE_MSW: 'false',
  },
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exitCode = code ?? 0
})
