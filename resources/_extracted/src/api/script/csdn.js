const { ipcRenderer } = require('electron')

let _interval = '';
ipcRenderer.on('checkLogin', (event, args) => {
    console.log('checkLogin 收到主进程消息:', args)
    _interval = setInterval(async () => {
        //判断知乎是否登录成功
        console.log("判断csdn是否登录成功")
        let title = null
        try{
            title = document.querySelector('.hasAvatar')
            console.log("title:", title);
        }catch(error){
            console.log("获取昵称失败")
        }

        if (title != null && title != undefined){
            try {
                // 尝试请求知乎API获取用户信息
                const response = await fetch('https://g-api.csdn.net/community/toolbar-api/v1/get-user-info', {
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
                        
                    var value = {
                        avatar: userData.avatar || '',
                        account: '',
                        name: userData.data.nickName,
                        cookie: document.cookie,
                        follower_count: userData.data.followCount || ''
                    }
    
                    console.log('checkLogin end', value)
                    ipcRenderer.sendToHost('checkLogin', value)
                    clearInterval(_interval);
                    console.log("清除定时任务")
                    return;
                }
                
            } catch (error) {
                console.log("请求API出错:", error);
                clearInterval(_interval);
            }
    
        }

 
    }, 1000) // 增加间隔时间到1秒，避免请求过于频繁
})

