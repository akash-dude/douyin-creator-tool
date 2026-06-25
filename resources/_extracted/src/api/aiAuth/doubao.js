


const { ipcRenderer } = require('electron')

let _interval = '';
ipcRenderer.on('checkLogin', (event, args) => {
    console.log('checkLogin 收到主进程消息:', args)
    _interval = setInterval(async () => {
        //判断抖音是否登录成功
        console.log("判断豆包是否登录成功")
        
		var avatar = document.querySelector('.semi-avatar-no-focus-visible')
        console.log("avatar22:", avatar);
        if (avatar !== null && avatar !== undefined) {
           
            console.log("登录成功")
            let srcValue = null
            try{
				srcValue = avatar.getAttribute('src');
            }catch(error){
                console.log("获取图片失败")
            }

			let name = document.querySelector('.greeting-NndQQf')
			console.log("name:", name.textContent);//晚上好，用户236616
            //截取name逗号的数据
            name = name.textContent.split('，')[1]
			
            var value = {
                avatar: srcValue,
                name: name,
                cookie: document.cookie,
            }

            console.log('checkLogin end', value)
            ipcRenderer.sendToHost('checkLogin', value)
            clearInterval(_interval);
            return
        }  else {
           
            // 查找包含"登录"文本的div节点
            var loginNodes = document.querySelectorAll('div.min-w-0.truncate');
            var loginNodeExists = false;
            
            for (var i = 0; i < loginNodes.length; i++) {
                console.log("loginNodes[i].textContent:", loginNodes[i].textContent);
                if (loginNodes[i].textContent === '登录') {
                    loginNodeExists = true;
                    break;
                }
            }
            
            console.log("是否存在登录节点:", loginNodeExists);
            
            // 存在登录节点表示未登录成功，不存在登录节点表示已登录成功
            if (loginNodeExists) {
                console.log("还未登录成功")
            } else {
                console.log("登录成功")
                try {
                // 尝试请求知乎API获取用户信息
                const response = await fetch('https://opt.doubao.com/monitor_web/settings/browser-settings?bid=flow_web&store=1', {
                    method: 'GET',
                    credentials: 'include', // 包含cookies
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': navigator.userAgent
                    },
                });
    
                if (response.ok) {
                    const userData = await response.json();
                    console.log("API返回数据:", userData);
                    
                    if (userData && userData.data.user_id) {
                        console.log("登录成功，用户信息:", userData.data.user_id);
                        
                        var value = {
                            avatar: '',
                            account: '',
                            name: userData.data.user_id,
                            cookie: document.cookie
                        }
    
                        console.log('checkLogin end', value)
                        ipcRenderer.sendToHost('checkLogin', value)
                        clearInterval(_interval);
                        return;
                    }
                } else {
                    console.log("api请求失败，状态码:", response.status);
                }
            } catch (error) {
                console.log("请求API出错:", error);
            }

            }
        }
        
    }, 1000)
})


