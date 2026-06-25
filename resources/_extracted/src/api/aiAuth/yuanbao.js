
const { ipcRenderer } = require('electron')

let _interval = '';
ipcRenderer.on('checkLogin', (event, args) => {
    console.log('checkLogin 收到主进程消息:', args)
    _interval = setInterval(() => {
        //判断抖音是否登录成功
        console.log("判断元宝是否登录成功")
       
		var name = document.querySelector('.nick-info-name')
        name = name.textContent
        if (name !== '未登录') {
            console.log("登录成功")

            avatar = document.querySelector('.image-container img')

            let srcValue = null
            try{
				srcValue = avatar.getAttribute('src');
            }catch(error){
                console.log("获取图片失败")
            }
            var value = {
                avatar: srcValue,
                name: name,
                cookie: document.cookie,
            }

            console.log('checkLogin end', value)
            ipcRenderer.sendToHost('checkLogin', value)
            clearInterval(_interval);
        } else {
            console.log("还未登录成功")
        }
    }, 1000)
})


