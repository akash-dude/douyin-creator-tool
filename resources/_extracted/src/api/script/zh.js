const { ipcRenderer } = require('electron')

let _interval = '';
ipcRenderer.on('checkLogin', (event, args) => {
    console.log('checkLogin 收到主进程消息:', args)
    _interval = setInterval(async () => {
        //判断知乎是否登录成功
        console.log("判断知乎是否登录成功")
        let title = null
        try{
            title = document.querySelector('img.AppHeader-profileAvatar')
            console.log("title:", title.text);
        }catch(error){
            console.log("获取昵称失败")
        }

        if (title != null && title != undefined){
            try {
                // 尝试请求知乎API获取用户信息
                const response = await fetch('https://www.zhihu.com/api/v4/me?include=is_realname', {
                    method: 'GET',
                    credentials: 'include', // 包含cookies
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': navigator.userAgent
                    }
                });
    
                if (response.ok) {
                    const userData = await response.json();
                    console.log("知乎API返回数据:", userData);
                    
                    if (userData && userData.name) {
                        console.log("登录成功，用户信息:", userData.name);
                        
                        var value = {
                            avatar: userData.avatar_url || '',
                            account: '',
                            name: userData.name,
                            cookie: document.cookie,
                            follower_count: userData.favorite_count || ''
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

