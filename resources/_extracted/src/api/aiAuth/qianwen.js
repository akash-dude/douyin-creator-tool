
const { ipcRenderer } = require('electron')

let _interval = '';
ipcRenderer.on('checkLogin', (event, args) => {
    console.log('checkLogin 收到主进程消息:', args)
    _interval = setInterval(async () => {
        //判断知乎是否登录成功
        console.log("判断千问是否登录成功")
		var avatar = document.querySelectorAll('.cursor-pointer img')[0]

        let srcValue = null
        try{
            srcValue = avatar.getAttribute('src');
        }catch(error){
            console.log("获取图片失败")
        }

        if (avatar !== null && avatar !== undefined) {
            try {
                // 尝试请求知乎API获取用户信息
                const response = await fetch('https://api.qianwen.com/growth/user/benefit/user/member/info', {
                    method: 'POST',
                    credentials: 'include', // 包含cookies
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': navigator.userAgent
                    },
                    body: JSON.stringify({
                        "timestamp": Date.now(),
                        "deviceType": "pc"
                    })
                });
    
                if (response.ok) {
                    const userData = await response.json();
                    console.log("千问API返回数据:", userData);
                    
                    if (userData && userData.data.userNick) {
                        console.log("登录成功，用户信息:", userData.data.userNick);
                        
                        var value = {
                            avatar: srcValue,
                            account: '',
                            name: userData.data.userNick,
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

 
    }, 2000) // 增加间隔时间到1秒，避免请求过于频繁
})




