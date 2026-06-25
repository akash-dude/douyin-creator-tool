
const { ipcRenderer } = require('electron')

let _interval = '';
ipcRenderer.on('checkLogin', (event, args) => {
    console.log('checkLogin 收到主进程消息:', args)
    _interval = setInterval(() => {
        //判断抖音是否登录成功
        console.log("判断抖音是否登录成功")
       
		var avatar = document.querySelector('.img-PeynF_')

        if (avatar !== null && avatar !== undefined) {
            console.log("登录成功")
            let srcValue = null
            try{
				srcValue = avatar.getAttribute('src');
            }catch(error){
                console.log("获取图片失败")
            }
      
			let account = document.querySelector('.unique_id-EuH8eA')
			console.log("account:", account.textContent);

			let name = document.querySelector('.name-_lSSDc')
			console.log("name:", name.textContent);
			

            var value = {
                avatar: srcValue,
                account: account.textContent,
                name: name.textContent,
                cookie: document.cookie,
                follower_count:'',
            }

            console.log('checkLogin end', value)
            ipcRenderer.sendToHost('checkLogin', value)
            clearInterval(_interval);
        } else {
            console.log("还未登录成功")
        }
    }, 1000)
})


