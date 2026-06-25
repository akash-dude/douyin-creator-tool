


const { ipcRenderer } = require('electron')

let _interval = '';
ipcRenderer.on('checkLogin', (event, args) => {
    console.log('checkLogin 收到主进程消息:', args)
    _interval = setInterval(async () => {
        //判断知乎是否登录成功
        console.log("判断纳米是否登录成功")
       
		var avatar = document.querySelector('.header_setting>img')
        if (avatar !== null && avatar !== undefined) {
            console.log("登录成功")
            let srcValue = null
            try{
				srcValue = avatar.getAttribute('src');
            }catch(error){
                console.log("获取图片失败")
            }
            let name = document.querySelector('.header_setting .truncate').textContent
            var value = {
                avatar: avatar.src,
                name: name,
                cookie: document.cookie,
            }
            console.log('checkLogin end', value)
            ipcRenderer.sendToHost('checkLogin', value)
            clearInterval(_interval);
    
        }

 
    }, 2000) // 增加间隔时间到1秒，避免请求过于频繁
})



