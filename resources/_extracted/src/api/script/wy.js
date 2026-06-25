const { ipcRenderer } = require('electron')

let _interval = '';
ipcRenderer.on('checkLogin', (event, args) => {
    console.log('checkLogin 收到主进程消息:', args)
    _interval = setInterval(() => {
        //判断抖音是否登录成功
        console.log("判断网易号是否登录成功")
       
        let Element = document.querySelectorAll('.topBar__user>span')
        console.log("Element:", Element);
        let name = null
        try{
            name = Element[2]
            console.log("name:", name.textContent);
        }catch(error){
            console.log("获取昵称失败")
        }

        if (name !== null && name !== undefined) {
            console.log("登录成功")
            let srcValue = null
            try{
                let imgElement = document.querySelector('.topBar__user>span>img');
                // 获取img元素的src属性值
                srcValue = imgElement.getAttribute('src');
            }catch(error){
                console.log("获取图片失败")
            }
            
            let follower_count = null
            try{
                follower_count = document.querySelector('.homeV4__board__card__data__value').textContent;
            }catch(error){
                console.log("获取粉丝数失败")
            }

            var value = {
                avatar: srcValue,
                account: '',
                name: name.textContent,
                cookie: document.cookie,
                platform: 'wy',
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

