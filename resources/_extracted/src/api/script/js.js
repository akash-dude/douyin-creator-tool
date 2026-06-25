const { ipcRenderer } = require('electron')

let _interval = '';
ipcRenderer.on('checkLogin', (event, args) => {
    console.log('checkLogin 收到主进程消息:', args)
    _interval = setInterval(() => {
        //判断抖音是否登录成功
        console.log("判断简书是否登录成功")

        let imgElements = document.querySelectorAll('.avatar>img')
     
        let secondImgElement = imgElements[0]
        console.log("imgElement")
        let srcValue = null
        try {
            srcValue = secondImgElement.getAttribute('src');  
            console.log("srcValue:", srcValue);
        } catch (error) {
            console.log("获取图片失败")
        }

        if (srcValue !== null && srcValue !== undefined) {
            console.log("登录成功")
            const element = document.querySelector('.user');
            if (element) {
                const mouseOverEvent = new MouseEvent('mouseover', {
                    bubbles: true,    // 允许事件冒泡
                    cancelable: true, // 允许事件被取消
                    view: window      // 关联的窗口对象
                  });
                  
                  element.dispatchEvent(mouseOverEvent);
                  document.querySelector('.user li a').click()
                console.log("成功点击")
            } else {
                console.error('元素未找到！');
            }
           
            let name = document.querySelector('.main-top .name ').text
            console.log("name:", name);
            let follower_count = ''
            try{
                follower_count = document.querySelectorAll('.main-top .meta-block p')[1].textContent
            }catch(error){
                console.log(error)
            }
            var value = {
                avatar: srcValue,
                account: '',
                name: name,
                cookie: document.cookie,
                follower_count:follower_count
            }
            console.log('checkLogin end', value)
            ipcRenderer.sendToHost('checkLogin', value)
            clearInterval(_interval);
            console.log("终止任务")
        } else {
            console.log("还未登录成功")
        }
    }, 1000)
})

