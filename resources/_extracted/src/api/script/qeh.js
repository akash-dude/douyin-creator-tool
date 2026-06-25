const { ipcRenderer } = require('electron')

let _interval = '';
ipcRenderer.on('checkLogin', (event, args) => {
    console.log('checkLogin 收到主进程消息:', args)
    _interval = setInterval(() => {
        //判断抖音是否登录成功
        console.log("判断企鹅号号是否登录成功")
        let name = null
        try{
            name = document.querySelector('span.usernameText-cls2j9OE')
            console.log("name:", name.text);
        }catch(error){
            console.log("获取昵称失败")
        }

        if (name !== null && name !== undefined) {
            console.log("登录成功")
            let srcValue = null
            try{
                let imgElement = document.querySelector('div.omui-avatar img');
                // 获取img元素的src属性值
                srcValue = imgElement.getAttribute('src');
            }catch(error){
                console.log("获取图片失败")
            }
            
            let follower_count = null
            try{
                let follower_counts = document.querySelectorAll('div.omui-total__num>a');
                follower_count = follower_counts[3].textContent
            }catch(error){
                console.log("获取粉丝数失败")
            }

            var value = {
                avatar: srcValue,
                account: '',
                name: name.textContent,
                cookie: document.cookie,
                // platform: 'qeh',
                follower_count:follower_count
            }

            console.log('checkLogin end', value)
            ipcRenderer.sendToHost('checkLogin', value)
            clearInterval(_interval);
        } else {
            console.log("还未登录成功")
        }
    }, 1000)
})

