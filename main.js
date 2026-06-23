// main.js — Electron 主进程入口
const { app, BrowserWindow } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const { setupIPC } = require('./src/bridge/ipc')

let mainWindow = null
let pythonProcess = null

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: '抖音创作辅助工具',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.loadFile(path.join(__dirname, 'src', 'ui', 'index.html'))

  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools()
  }
}

function startPythonBackend () {
  const backendDir = path.join(__dirname, 'python-backend')

  pythonProcess = spawn('python', ['main.py'], {
    cwd: backendDir,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: {
      ...process.env,
      PYTHONIOENCODING: 'utf-8'
    }
  })

  pythonProcess.stdout.on('data', (data) => {
    console.log(`[Python] ${data.toString().trim()}`)
    // 告诉渲染进程后端就绪状态
    const msg = data.toString()
    if (msg.includes('Waiting for application startup')) {
      console.log('[main] Python 后端正在启动...')
    }
  })

  pythonProcess.stderr.on('data', (data) => {
    const msg = data.toString().trim()
    if (msg) console.error(`[Python ERR] ${msg}`)
  })

  pythonProcess.on('error', (err) => {
    console.error('[main] Python 后端启动失败:', err.message)
  })

  pythonProcess.on('exit', (code) => {
    console.log(`[main] Python 后端已退出 (code=${code})`)
    pythonProcess = null
  })

  console.log('[main] Python 后端已启动')
}

function stopPythonBackend () {
  if (pythonProcess) {
    pythonProcess.kill()
    pythonProcess = null
    console.log('[main] Python 后端已停止')
  }
}

app.whenReady().then(() => {
  // 启动 Python 后端
  startPythonBackend()

  setupIPC()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  stopPythonBackend()
})
