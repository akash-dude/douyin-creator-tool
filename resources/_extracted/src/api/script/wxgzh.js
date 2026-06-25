const { ipcRenderer, nativeTheme } = require('electron')

let _interval = '';
ipcRenderer.on('checkLogin', (event, args) => {
    console.log('checkLogin 收到主进程消息:', args)
    _interval = setInterval(() => {
        //判断抖音是否登录成功
        console.log("判断微信公众号是否登录成功")

        let name = document.querySelector('.weui-desktop_name')
        console.log("name:", name.textContent);

        if (name !== null && name != undefined) {
            console.log("登录成功")
            let srcValue = null
            try{
                let imgElement = document.querySelector('.weui-desktop-account__img');
                // 获取img元素的src属性值
                srcValue = imgElement.getAttribute('src');
            }catch(error){
                console.log("获取图片失败")
            }
            
            let follower_count = null
            try{
                follower_count = document.querySelectorAll('.weui-desktop-user_sum span')[1].text;
            }catch(error){
                console.log("获取粉丝数失败")
            }

            var value = {
                avatar: srcValue,
                account: '',
                name: name.textContent,
                cookie: document.cookie,
                platform: 'tt',
                follower_count:follower_count
            }

            console.log('checkLogin end', value)
            ipcRenderer.sendToHost('checkLogin', value)
            clearInterval(_interval);
        } else {
            console.log("还未登录成功")
        }
    }, 2000)
})

