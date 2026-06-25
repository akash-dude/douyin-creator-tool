const { ipcRenderer } = require('electron')

const waitForExternal = setInterval(() =>{
	//判断抖音是否登录成功
	var name = document.querySelector('.info-top-name')

	if(name !== null){
		setTimeout(() => {
			console.log("登录成功")

			let imgElement = document.querySelector('.user-info-avatar img');
			// 获取img元素的src属性值
			let srcValue = imgElement.getAttribute('src');
			console.log("srcValue:", srcValue);

			let account = document.querySelector('.info-top-number')
			console.log("account:", account.textContent);

			console.log("name:", name.textContent);
			var value = {
				avatar:srcValue,
				account:account.textContent,
				name:name.textContent,
				type:1
			}

			// 获取并点击目标按钮
			const targetButton = document.querySelector('span[data-v-7d1f9f24]');
			if (targetButton) {
					console.log("找到目标按钮，准备点击");
					targetButton.click(); // 触发点击事件
			} else {
					console.log("未找到目标按钮");
			}
			// 刷新页面
			// location.reload();
			ipcRenderer.on('ping', () => {
			    console.log("关闭呀")
			    ipcRenderer.sendToHost('value',value)
			 })

		}, 1000)
		// setTimeout(() => {	console.log("等待两秒再清除:")},2000)
		clearInterval(waitForExternal);
    }else {
        console.log("还未登录成功")
    }
},1000)
