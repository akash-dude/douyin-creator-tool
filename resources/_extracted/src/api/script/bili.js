const { ipcRenderer } = require('electron')

let _interval = '';
ipcRenderer.on('checkLogin', (event, args) => {
    console.log('checkLogin 收到主进程消息:', args)
    _interval = setInterval(async () => {
        //判断知乎是否登录成功
        console.log("判断知乎是否登录成功")
        let title = null
        try{
            title = document.querySelector('span.right-entry-text')
            console.log("title:", title);
        }catch(error){
            console.log("获取昵称失败")
        }

        if (title != null && title != undefined){
            try {
                // 尝试请求知乎API获取用户信息
                const response = await fetch('https://api.bilibili.com/x/web-interface/nav', {
                    method: 'GET',
                    credentials: 'include', // 包含cookies
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': navigator.userAgent
                    }
                });
    
                if (response.ok) {
                    const userData = await response.json();
                    console.log("bili API返回数据:", userData);
                    
                    if (userData && userData.data.uname) {
                        console.log("登录成功，用户信息:", userData.data.uname);
                        
                        var value = {
                            avatar: userData.data.face || '',
                            account: '',
                            name: userData.data.uname,
                            cookie: document.cookie,
                            follower_count: ''
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

 
    }, 1000) // 增加间隔时间到1秒，避免请求过于频繁
})

