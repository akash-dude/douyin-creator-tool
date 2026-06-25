const { ipcRenderer } = require('electron')


let _interval = '';
ipcRenderer.on('checkLogin', (event, args) => {
    console.log('checkLogin 收到主进程消息:', args)
    _interval = setInterval(() => {
        //判断抖音是否登录成功
        var name = document.querySelector('.account-name')

        if (name !== null) {
            console.log("登录成功")
            let imgElement = document.querySelector('.avatar img');
            // 获取img元素的src属性值
            let srcValue = imgElement.getAttribute('src');
            console.log("srcValue:", srcValue);
            console.log("name:", name.textContent);
            let account = document.querySelector('.others.description-text div');
            console.log("account:", account.textContent);

            var value = {
                avatar: srcValue,
                account: '',
                name: name.textContent,
                cookies: document.cookie
            }

            console.log('checkLogin end', value)
            ipcRenderer.sendToHost('checkLogin', value)
            clearInterval(_interval);
        } else {
            console.log("还未登录成功")
        }
    }, 2000)
})

