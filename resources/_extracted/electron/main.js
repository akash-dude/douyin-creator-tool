//  // 控制应用生命周期和创建原生浏览器窗口的模组
//   const { version } = require('../package.json');
//   const { app, BrowserWindow, Menu,ipcMain,dialog} = require('electron')
//   const path = require('path')
//   const { PythonShell } = require('python-shell')
//   const { spawn } = require('child_process');
//   const log = require('electron-log')
//   const fs = require('fs')
//   Menu.setApplicationMenu(null); //隐藏默认菜单
//   require("@electron/remote/main").initialize();
//   log.transports.console.level = true
//   let logWindow = null

//   function createLogWindow() {
//     if (logWindow && !logWindow.isDestroyed()) {
//       try { logWindow.focus() } catch (e) {}
//       return
//     }
//     logWindow = new BrowserWindow({
//       width: 800,
//       height: 420,
//       title: '运行日志',
//       alwaysOnTop: false,
//       webPreferences: {
//         nodeIntegration: true,
//         contextIsolation: false
//       }
//     })
//     const html = encodeURIComponent(`<!doctype html><html><head><meta charset='utf-8'><title>运行日志</title><style>html,body{margin:0;padding:0;background:#0b0f14;color:#e6edf3;font:12px/1.45 Consolas,Monaco,Menlo,monospace;height:100%}#log{white-space:pre-wrap;padding:8px;box-sizing:border-box;height:100%;overflow:auto}</style></head><body><div id='log'></div><script>const { ipcRenderer } = require('electron');const el=document.getElementById('log');ipcRenderer.on('python-log',(e,msg)=>{el.textContent+=String(msg);el.scrollTop=el.scrollHeight;});</script></body></html>`)
//     logWindow.loadURL(`data:text/html;charset=utf-8,${html}`)
//   }
//   function createWindow() {
//     // 创建浏览器窗口
//     const mainWindow = new BrowserWindow({
//       width: 1200,
//       height: 800,
//       title: `auth helper ${version}`, // 明确设置窗口标题，加载过程中会取该title为软件左上角名称，加载完成后则取public/index.html的title
//       webPreferences: {
//         // 书写渲染进程中的配置
//         webSecurity: false, //解决接口请求跨域问题
//         nodeIntegration: true, //开启true这一步很重要,目的是为了vue文件中可以引入node和electron相关的API
//         contextIsolation: false, // 在渲染进程里调用 require 的话，还需要加上 contextIsolation: false 。
//         enableRemoteModule: true, // 可以使用remote方法
//         webviewTag: true, //高版本的electron 打开webview得添加这块代码
//         // preload: path.join(__dirname, 'preload.js')
//       },
//     })
//     require("@electron/remote/main").enable(mainWindow.webContents);  //解决Uncaught Error: @electron/remote is disabled for this WebContents. Call require("@electron/remote/main").enable(webContents) to enable it.
//     process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'  //避免启动electron产生警告
//     const pkg = require('../package.json')
//     const buildEnv = (pkg && pkg.buildEnv) || (pkg && pkg.extraMetadata && pkg.extraMetadata.buildEnv)
//     const envFromPkg = buildEnv && String(buildEnv)
//     console.log("process.env.ELECTRON_ENV", process.env.ELECTRON_ENV, "pkg.buildEnv", envFromPkg)
//     let env = process.env.ELECTRON_ENV || envFromPkg
//     // 环境变量 ELECTRON_ENV 值为 development 则使用热更新
//     if (env === 'dev' || env === 'pre') {
//       // 热更新监听窗口
//       mainWindow.loadURL('http://localhost:9001')
//       // 打开开发工具
//       mainWindow.webContents.openDevTools()
//     } else {
//       // 生产环境中要加载文件，打包的版本
//       // mainWindow.webContents.openDevTools()
//       mainWindow.loadFile(path.resolve(__dirname, '../vue-dist/index.html'))
//     }

//     //监听webview新建的窗口
//     app.on('web-contents-created', (event, contents) => {
//         console.log("监听webview窗口，解决webview打开新窗口的问题")
//         if (contents.getType() === 'webview') {
//             contents.setWindowOpenHandler(({ url }) => {
//                 contents.loadURL(url);
//                 return { action: "deny" };
//             });
//         }
//     })

//     return mainWindow //限制多开
//   }

//   ipcMain.handle('getpath', async (event) => {
//     return path.join(path.dirname(__dirname), 'src', 'api', 'script')
// });

// ipcMain.handle('getaipath', async (event) => {
//   return path.join(path.dirname(__dirname), 'src', 'api', 'aiAuth')
// });

// ipcMain.handle('get-flask-port-async', async () => {
//   return flaskPort
// });

// // 提供获取实例数量的方法
// ipcMain.handle('get-instance-count', () => {
//   return getInstanceCount();
// });

// function proxyhandle(arg){
//     console.log("set proxy success",arg)
//     app.commandLine.appendSwitch('proxy-server',arg.trim());
//   // app.commandLine.appendSwitch('proxy-server','https://dph42e2233459k1:Fz6234hCRiT@14.215.164.157:2018');
  
// }
// ipcMain.on('proxyhandle',function (event,arg){
//   proxyhandle(arg)
// });

//     //开发环境启动flask服务
//     function startServer_py() {
//         let options = {
//             mode: 'text',
//             pythonPath: './serve/.venv/Scripts/python'
//         }
//         PythonShell.run('./serve/main.py', options, function (err, results) {
//             console.log('成功启动python服务')
//             if (err) throw err;
//             console.log('python服务启动错误', results)
//         })

//     }
//   let pyPort = null
  
//   let flaskPort = null;
//   //生产环境调用flask exe
//   function startServer_XEX(){
//     let env = process.env.ELECTRON_ENV
//     let script = ''
//     if (env === 'pre'){
//       script = path.join(__dirname,'pydist','main','main.exe')
//     }else{
//       script = path.join(process.cwd(),'/resources/main/main.exe')
//     }
//     // console.log("路径",script)
//     pyPort = spawn(script)


//     // 处理输出数据的通用函数
//     const handleOutput = (data) => {
//         const output = data.toString();
//         log.info(data.toString())
//         // console.log('flask启动端口信息:', output.trim());  // 使用trim()移除多余换行符
//         if (logWindow && !logWindow.isDestroyed()) {
//             try { logWindow.webContents.send('python-log', output) } catch (e) {}
//         }

//         // 尝试从输出中提取端口号
//         const portMatch = output.match(/Running on http:\/\/127.0.0.1:(\d+)/) ||
//                          output.match(/Running on http:\/\/0.0.0.0:(\d+)/) ||
//                          output.match(/服务启动在端口: (\d+)/);
        
//         if (portMatch && portMatch[1]) {
//             flaskPort = portMatch[1];
//             // console.log('成功启动Flask端口:', flaskPort);
//         }
//     };

//     if(pyPort != null){
//       console.log("flask server start success")
//     }

//     pyPort.stdout.on('data', (data) => {
//         // console.log(`stdout: ${data}`);
//         if (logWindow && !logWindow.isDestroyed()) {
//             try { logWindow.webContents.send('python-log', data.toString()) } catch (e) {}
//         }
//     });

//     pyPort.stderr.on('data', handleOutput);

//     pyPort.on('close', (code) => {
//         console.log(`子进程退出，退出码 ${code}`);
//     });

//   }

//   //停止服务
//   function stopServer(){
//     pyPort.kill()
//     // console.log("已pyhton服务关闭进程")
//     pyPort = null
//   }

//   // 实例信息存储文件路径
//   const instancesFile = path.join(app.getPath('userData'), 'instances.json')
//   // 实例ID
//   let instanceId = null

//   // 读取实例信息并清理无效实例
//   function readInstances() {
//     try {
//       if (fs.existsSync(instancesFile)) {
//         const data = fs.readFileSync(instancesFile, 'utf8')
//         let instances = JSON.parse(data)
        
//         // 清理无效实例（进程不存在的实例）
//         instances = instances.filter(instance => {
//           try {
//             // 在Windows系统中，使用更可靠的方法检查进程是否存在
//             if (process.platform === 'win32') {
//               // 使用tasklist命令检查进程是否存在
//               const { spawnSync } = require('child_process')
//               const result = spawnSync('tasklist', ['/FI', `PID eq ${instance.pid}`])
//               return result.stdout.toString().includes(instance.pid.toString())
//             } else {
//               // 在其他系统中使用process.kill
//               process.kill(instance.pid, 0)
//               return true
//             }
//           } catch (error) {
//             return false
//           }
//         })
        
//         // 如果有清理，写回文件
//         if (instances.length !== JSON.parse(data).length) {
//           writeInstances(instances)
//         }
        
//         return instances
//       }
//     } catch (error) {
//       console.error('读取实例信息失败:', error)
//     }
//     return []
//   }

//   // 写入实例信息
//   function writeInstances(instances) {
//     try {
//       fs.writeFileSync(instancesFile, JSON.stringify(instances, null, 2))
//     } catch (error) {
//       console.error('写入实例信息失败:', error)
//     }
//   }

//   // 添加当前实例
//   function addInstance() {
//     // 生成新的实例ID
//     instanceId = Date.now() + '_' + Math.random().toString(36).substr(2, 9)
//     const instances = readInstances()
//     // 移除已存在的相同实例ID（防止异常退出后残留）
//     const filteredInstances = instances.filter(instance => instance.id !== instanceId)
//     // 添加当前实例
//     filteredInstances.push({
//       id: instanceId,
//       startTime: new Date().toISOString(),
//       pid: process.pid
//     })
//     writeInstances(filteredInstances)
//   }

//   // 移除当前实例
//   function removeInstance() {
//     const instances = readInstances()
//     const filteredInstances = instances.filter(instance => instance.id !== instanceId)
//     writeInstances(filteredInstances)
//   }

//   // 获取实例数量
//   function getInstanceCount() {
//     return readInstances().length
//   }

//   // 存储主窗口的引用
//   let mainWindow = null

//   // 这段程序将会在 Electron 结束初始化
//   // 和创建浏览器窗口的时候调用
//   // 部分 API 在 ready 事件触发后才能使用。
//   app.whenReady().then(() => {
//     // 添加当前实例
//     addInstance()
//     console.log('当前实例ID:', instanceId)
//     console.log('当前实例数量:', getInstanceCount())
    
//     let env = process.env.ELECTRON_ENV
//     if (env === 'dev') {
//         // startServer_py()
//     }else{
//       startServer_XEX()
//     }
//     // 仅在调试包打开日志窗口（dev / pre / build:pre），或通过环境变量强制打开
//     // if (env === 'dev' || env === 'pre' || env === 'build:pre' || process.env.SHOW_LOG_WINDOW === '1') {
//     //   createLogWindow()
//     // }
//     // createLogWindow()
//     mainWindow = createWindow()

//     app.on('activate', function () {
//       // 通常在 macOS 上，当点击 dock 中的应用程序图标时，如果没有其他
//       // 打开的窗口，那么程序会重新创建一个窗口。
//       if (BrowserWindow.getAllWindows().length === 0) mainWindow = createWindow()
//     })
//   })

//   app.on('window-all-closed', function () {
//     // 移除当前实例
//     removeInstance()
//     console.log('实例已关闭，剩余实例数量:', getInstanceCount())
    
//     let env = process.env.ELECTRON_ENV
//     if (env !== 'dev') {
//       stopServer()
//     }
//     if (process.platform !== 'darwin') app.quit()
//     // app.commandLine.appendSwitch('proxy-server', arg.trim());

//   })

//   // 当应用即将退出时
//   app.on('before-quit', function () {
//     // 移除当前实例
//     removeInstance()
//     console.log('应用即将退出，清理实例信息')
//   })

// 控制应用生命周期和创建原生浏览器窗口的模组
const { version } = require('../package.json');
const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')
const path = require('path')
const { PythonShell } = require('python-shell')
const { spawn } = require('child_process');
const log = require('electron-log')
const fs = require('fs')
Menu.setApplicationMenu(null);
require("@electron/remote/main").initialize();
log.transports.console.level = true
let logWindow = null

// ========== 代理认证信息存储 ==========
let proxyAuth = null;
app.userAgentFallback = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.6834.196 Safari/537.36';

// 先注册 login 处理器（确保最先绑定）
function setupProxyAuthHandler() {
  app.on('login', (event, webContents, request, authInfo, callback) => {
    if (authInfo.isProxy && proxyAuth) {
      event.preventDefault();
      callback(proxyAuth.username, proxyAuth.password);
      console.log('已自动填充代理认证信息');
    }
  });
}

// 在应用启动时立即调用
setupProxyAuthHandler();

function createLogWindow() {
  if (logWindow && !logWindow.isDestroyed()) {
    try { logWindow.focus() } catch (e) { }
    return;
  }
  logWindow = new BrowserWindow({
    width: 800,
    height: 420,
    title: '运行日志',
    alwaysOnTop: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  const html = encodeURIComponent(`<!doctype html><html><head><meta charset='utf-8'><title>运行日志</title><style>html,body{margin:0;padding:0;background:#0b0f14;color:#e6edf3;font:12px/1.45 Consolas,Monaco,Menlo,monospace;height:100%}#log{white-space:pre-wrap;padding:8px;box-sizing:border-box;height:100%;overflow:auto}</style></head><body><div id='log'></div><script>const { ipcRenderer } = require('electron');const el=document.getElementById('log');ipcRenderer.on('python-log',(e,msg)=>{el.textContent+=String(msg);el.scrollTop=el.scrollHeight;});</script></body></html>`);
  logWindow.loadURL(`data:text/html;charset=utf-8,${html}`);
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: ``,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webviewTag: true,
    },
  })
  require("@electron/remote/main").enable(mainWindow.webContents);
  process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
  const pkg = require('../package.json');
  const buildEnv = (pkg && pkg.buildEnv) || (pkg && pkg.extraMetadata && pkg.extraMetadata.buildEnv);
  const envFromPkg = buildEnv && String(buildEnv);
  console.log("process.env.ELECTRON_ENV", process.env.ELECTRON_ENV, "pkg.buildEnv", envFromPkg);
  let env = process.env.ELECTRON_ENV || envFromPkg;
  
  if (env === 'dev' || env === 'pre') {
    mainWindow.loadURL('http://localhost:9001');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.resolve(__dirname, '../vue-dist/index.html'));
  }

  app.on('web-contents-created', (event, contents) => {
    console.log("监听webview窗口，解决webview打开新窗口问题");
    if (contents.getType() === 'webview') {
      contents.setWindowOpenHandler(({ url }) => {
        contents.loadURL(url);
        return { action: "deny" };
      });
    }
  })

  return mainWindow;
}

ipcMain.handle('getpath', async (event) => {
  return path.join(path.dirname(__dirname), 'src', 'api', 'script');
});

ipcMain.handle('getaipath', async (event) => {
  return path.join(path.dirname(__dirname), 'src', 'api', 'aiAuth');
});

ipcMain.handle('get-flask-port-async', async () => {
  return flaskPort;
});

ipcMain.handle('get-instance-count', () => {
  return getInstanceCount();
});

function proxyhandle(arg) {
  
  const proxyPattern = /^(?:https?:\/\/)?(?:([^:@]+):([^@]+)@)?([^:]+):(\d+)$/;
  const match = arg.trim().match(proxyPattern);
  
  if (!match) {
    console.error("代理格式错误，应为: [http://]username:password@host:port 或 host:port");
    return;
  }
  
  const username = match[1];
  const password = match[2];
  const host = match[3];
  const port = match[4];
  
  if (username && password) {
    proxyAuth = { username, password, host, port };
    console.log(`代理认证信息已设置: ${username}@${host}:${port}`);
  } else {
    proxyAuth = null;
    console.log(`无认证代理: ${host}:${port}`);
  }
  
  const proxyServer = `${host}:${port}`;
  app.commandLine.appendSwitch('proxy-server', proxyServer);
    console.log("set proxy success", arg);
}

ipcMain.on('proxyhandle', function (event, arg) {
  proxyhandle(arg);
});

function startServer_py() {
  let options = {
    mode: 'text',
    pythonPath: './serve/.venv/Scripts/python'
  }
  PythonShell.run('./serve/main.py', options, function (err, results) {
    console.log('成功启动python服务');
    if (err) throw err;
    console.log('python服务启动错误', results);
  })
}

let pyPort = null;
let flaskPort = null;

function startServer_XEX() {
  let env = process.env.ELECTRON_ENV;
  let script = '';
  if (env === 'pre') {
    script = path.join(__dirname, 'pydist', 'main', 'main.exe');
  } else {
    script = path.join(process.cwd(), '/resources/main/main.exe');
  }

  pyPort = spawn(script);

  const handleOutput = (data) => {
    const output = data.toString();
    log.info(data.toString());
    if (logWindow && !logWindow.isDestroyed()) {
      try { logWindow.webContents.send('python-log', output); } catch (e) { }
    }

    const portMatch = output.match(/Running on http:\/\/127.0.0.1:(\d+)/) ||
                     output.match(/Running on http:\/\/0.0.0.0:(\d+)/) ||
                     output.match(/服务启动在端口: (\d+)/);
    
    if (portMatch && portMatch[1]) {
      flaskPort = portMatch[1];
    }
  };

  if (pyPort != null) {
    console.log("flask server start success");
  }

  pyPort.stdout.on('data', (data) => {
    if (logWindow && !logWindow.isDestroyed()) {
      try { logWindow.webContents.send('python-log', data.toString()); } catch (e) { }
    }
  });

  pyPort.stderr.on('data', handleOutput);

  pyPort.on('close', (code) => {
    console.log(`子进程退出，退出码 ${code}`);
  });
}

function stopServer() {
  pyPort.kill();
  pyPort = null;
}

const instancesFile = path.join(app.getPath('userData'), 'instances.json');
let instanceId = null;

function readInstances() {
  try {
    if (fs.existsSync(instancesFile)) {
      const data = fs.readFileSync(instancesFile, 'utf8');
      let instances = JSON.parse(data);
      
      instances = instances.filter(instance => {
        try {
          if (process.platform === 'win32') {
            const { spawnSync } = require('child_process');
            const result = spawnSync('tasklist', ['/FI', `PID eq ${instance.pid}`]);
            return result.stdout.toString().includes(instance.pid.toString());
          } else {
            process.kill(instance.pid, 0);
            return true;
          }
        } catch (error) {
          return false;
        }
      });
      
      if (instances.length !== JSON.parse(data).length) {
        writeInstances(instances);
      }
      
      return instances;
    }
    return [];
  } catch (error) {
    console.error('读取实例信息失败:', error);
    return [];
  }
}

function writeInstances(instances) {
  try {
    fs.writeFileSync(instancesFile, JSON.stringify(instances, null, 2));
  } catch (error) {
    console.error('写入实例信息失败:', error);
  }
}

function addInstance() {
  instanceId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  const instances = readInstances();
  const filteredInstances = instances.filter(instance => instance.id !== instanceId);
  filteredInstances.push({
    id: instanceId,
    startTime: new Date().toISOString(),
    pid: process.pid
  });
  writeInstances(filteredInstances);
}

function removeInstance() {
  const instances = readInstances();
  const filteredInstances = instances.filter(instance => instance.id !== instanceId);
  writeInstances(filteredInstances);
}

function getInstanceCount() {
  return readInstances().length;
}

let mainWindow = null;

app.whenReady().then(() => {
  addInstance();
  console.log('当前实例ID:', instanceId);
  console.log('当前实例数量:', getInstanceCount());
  
  let env = process.env.ELECTRON_ENV;
  if (env === 'dev') {
    // startServer_py()
  } else {
    startServer_XEX();
  }
  
  mainWindow = createWindow();
  // createLogWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) mainWindow = createWindow();
  });
});

app.on('window-all-closed', function () {
  removeInstance();
  console.log('实例已关闭，剩余实例数量:', getInstanceCount());
  
  let env = process.env.ELECTRON_ENV;
  if (env !== 'dev') {
    stopServer();
  }
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', function () {
  removeInstance();
  console.log('应用即将退出，清理实例信息');
});