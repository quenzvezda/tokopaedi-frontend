import { spawn } from 'node:child_process'

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'

const child = spawn(npmCmd, ['run', 'dev'], {
  stdio: 'inherit',
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
