import { exec } from 'node:child_process'

export const getActiveWindow = (): void => {
  console.log('here')
  exec('powershell -File ./src/helpers/active_window.ps1', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`)
      return
    }
    if (stderr) {
      console.error(`PowerShell Error: ${stderr}`)
      return
    }
    console.log('Active Window Title:', stdout.trim())
  })
}

export const activeWindowChecker = (): void => {
  setInterval(() => {
    getActiveWindow()
  }, 1000)
}
