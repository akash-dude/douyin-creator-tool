const { ipcRenderer } = require('electron')

console.log("发送通讯1")
ipcRenderer.on('ping', (event, args) => {
		console.log('收到主进程消息:', args)

		const waitForExternal = setInterval(() =>{
			//判断抖音是否登录成功
			var name = document.querySelector('.finder-nickname')
		
			if(name !== null){
				setTimeout(() => {
					console.log("登录成功")
		
					let imgElement = document.querySelector('.avatar');
					// 获取img元素的src属性值
					let srcValue = imgElement.getAttribute('src');
					console.log("srcValue:", srcValue);
		
					console.log("name:", name.textContent);
		
					let account = document.querySelector('.finder-uniq-id');
					console.log("account:", account.textContent);
		
					var value = {
						avatar:srcValue,
						account:account.textContent,
						name:name.textContent,
						type:3
					}
					console.log("发送通讯1")
					ipcRenderer.sendToHost('value',value)
		
				}, 1000)
				clearInterval(waitForExternal);
				}else {
						console.log("还未登录成功")
				}
		},1000)
		
		
 })
