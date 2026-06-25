const { ipcRenderer } = require('electron')



let _interval = '';
ipcRenderer.on('checkLogin', (event, args) => {
    console.log('checkLogin 收到主进程消息:', args)
    _interval = setInterval(() => {
        //判断抖音是否登录成功
        console.log("判断搜狐是否登录成功")

        let name = document.querySelector('.user-name').textContent

        if (name !== null && name !== undefined) {
            console.log("登录成功")
    
           
            var avatar = document.querySelector('.user-pic')
            let srcValue = null
            try{
				srcValue = avatar.getAttribute('src');
            }catch(error){
                console.log("获取图片失败")
            }
            console.log("name:", name);
            var value = {
                avatar: srcValue,
                account: '',
                name: name,
                cookie: document.cookie
            }

            // // 获取并点击第一个目标区域
            // const targetDivs = document.querySelector('.btn el-tooltip__trigger');
            // if (targetDivs) {
            //     console.log("找到目标区域，准备点击第一个");
            //     targetDivs.click(); // 触发第一个元素的点击事件
            // } else {
            //     console.log("未找到目标区域");
            // }
            console.log('checkLogin end', value)
            ipcRenderer.sendToHost('checkLogin', value)
            clearInterval(_interval);
        } else {
            console.log("还未登录成功")
        }
    }, 1000)
})

