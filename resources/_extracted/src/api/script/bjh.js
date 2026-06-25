const { ipcRenderer } = require('electron')

let _interval = '';
ipcRenderer.on('checkLogin', (event, args) => {
    console.log('checkLogin 收到主进程消息:', args)
    _interval = setInterval(() => {
        //判断抖音是否登录成功
        console.log("判断百家号是否登录成功")

        let imgElement = document.querySelector('.UjPPKm89R4RrZTKhwG5H')
     
        // let secondImgElement = imgElements[1]
        console.log("imgElement")
        let srcValue = null
        try {
            srcValue = imgElement.getAttribute('src');  
            console.log("srcValue:", srcValue);
        } catch (error) {
            console.log("获取图片失败")
        }

        if (srcValue !== null) {
            console.log("登录成功")
            const element = document.querySelector('.p7Psc5P3uJ5lyxeI0ETR');
            if (element) {
                const mouseOverEvent = new MouseEvent('mouseover', {
                    bubbles: true,    // 允许事件冒泡
                    cancelable: true, // 允许事件被取消
                    view: window      // 关联的窗口对象
                  });
                  
                  element.dispatchEvent(mouseOverEvent);
                console.log("成功点击")
            } else {
                console.error('元素未找到！');
            }
           
            let name = document.querySelector('.user-name').text
            console.log("name:", name);
            var value = {
                avatar: srcValue,
                account: '',
                name: name.split(',')[1],
                cookie: document.cookie,
                platform: 'bjh'
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
    }, 500)
})

ipcRenderer.on('getWorkers', (event, args) => {
    console.log('getWorkers 收到主进程消息:', args)
    const clickWrokers = () => {
        return new Promise(r => {
            _interval = setInterval(() => {
                var menus = Array.from(document.getElementsByClassName('.menu-item'))
                menus.forEach(menu => {
                    if (menu.textContent === "笔记管理") {
                        clearInterval(_interval)
                        menu.click(); // 触发第一个元素的点击事件
                        r();
                    }
                })
            }, 500)
        })
    }
    clickWrokers().then(res => {
        const list = [
            { label: '全部笔记', value: 0 },
            { label: '已发布', value: 0 },
            { label: '审核中', value: 0 },
            { label: '未通过', value: 0 },
        ]
        return new Promise(r => {
            _interval = setInterval(() => {
                var elms = Array.from(document.getElementsByClassName('.tab-title'))
                list.forEach(item => {
                    let elm = elms.find(e => e.textContent.includes(item.label))
                    item.value = parseInt(elm.textContent) // 自动提取数字
                })
                ipcRenderer.sendToHost('getWorkers', {
                    list,
                    cookies: document.cookie,
                    type: 2,
                })
            }, 1000)
        })
    })
})