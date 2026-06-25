
const { ipcRenderer } = require('electron')

let _interval = '';
ipcRenderer.on('checkLogin', (event, args) => {
    console.log('checkLogin 收到主进程消息:', args)
    _interval = setInterval(() => {
        //判断抖音是否登录成功
        console.log("判断deepseek是否登录成功")
       
		var avatar = document.querySelector('.fdf01f38')

        if (avatar !== null && avatar !== undefined) {
            console.log("登录成功")
            let srcValue = null
            try{
				srcValue = avatar.getAttribute('src');
            }catch(error){
                console.log("获取图片失败")
            }


			let name = document.querySelector('._9d8da05')
			console.log("name:", name.textContent);
			
            var value = {
                avatar: srcValue,
                name: name.textContent,
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


