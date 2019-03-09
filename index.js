module.exports = function Gathering(mod) {
	
	const plants = {
		1: {name:'特殊', msg:'坚韧的杂草'},
		2: {name:'植物', msg:'野生玉米'},
		3: {name:'植物', msg:'野生红葡萄'},
		4: {name:'植物', msg:'黄蘑菇'},
		5: {name:'植物', msg:'老南瓜'},
		6: {name:'植物', msg:'苹果树'}
	}
	const mining = {
		101: {name:'特殊', msg:'岩石'},
		102: {name:'矿石', msg:'钴矿石'},
		103: {name:'矿石', msg:'硒矿石'},
		104: {name:'矿石', msg:'水晶矿石'},
		105: {name:'矿石', msg:'秘银矿石'},
		106: {name:'矿石', msg:'碣矿石'}
	}
	const energy = {
		201: {name:'特殊', msg:'无色结晶'},
		202: {name:'精气', msg:'赤色结晶'},
		203: {name:'精气', msg:'绿色结晶'},
		204: {name:'精气', msg:'青色结晶'},
		205: {name:'精气', msg:'白色结晶'},
		206: {name:'精气', msg:'被污染的花'}
	}
	
	let {
		enabled,
		sendToAlert,
		sendToNotice,
	} = require('./config.json')
	
	let plantsMarkers = false,
		miningMarkers = false,
		energyMarkers = false,
		othersMarkers = false,
		mobid = []
	
	mod.command.add('采集', (arg) => {
		if (!arg) {
			enabled = !enabled;
			if (!enabled) {
				plantsMarkers = false
				miningMarkers = false
				energyMarkers = false
				for (let itemId of mobid) {
					despawnItem(itemId)
				}
			}
			sendMessage('模块 ' + (enabled ? BLU('开启') : YEL('关闭')))
		} else {
			switch (arg) {
				case "警告":
					sendToAlert = !sendToAlert
					sendMessage('警告消息 ' + (sendToAlert ? BLU('启用') : YEL('禁用')))
					break
				case "通知":
					sendToNotice = !sendToNotice
					sendMessage('通知消息 ' + (sendToNotice ? BLU('启用') : YEL('禁用')))
					break
					
				case "状态":
					gatheringStatus()
					break
				
				case "植物":
					plantsMarkers = !plantsMarkers
					sendMessage('植物提示 ' + (plantsMarkers ? BLU('显示') : YEL('隐藏')))
					break
				case "矿石":
					miningMarkers = !miningMarkers
					sendMessage('矿石提示 ' + (miningMarkers ? BLU('显示') : YEL('隐藏')))
					break
				case "精气":
					energyMarkers = !energyMarkers
					sendMessage('精气提示 ' + (energyMarkers ? BLU('显示') : YEL('隐藏')))
					break
				
				default :
					sendMessage(RED('无效的参数!'))
					break
			}
		}
	})
	
	mod.hook('S_LOAD_TOPO', 3, (event) => {
		mobid = []
	})
	
	mod.hook('S_SPAWN_COLLECTION', 4, (event) => {
		if (enabled) {
			if (plantsMarkers && plants[event.id]) {
				alertMessage('发现 [' + plants[event.id].name + '] ' + plants[event.id].msg)
				noticeMessage('发现 [' + plants[event.id].name + '] ' + plants[event.id].msg)
			}
			else if (miningMarkers && mining[event.id]) {
				alertMessage('发现 [' + mining[event.id].name + '] ' + mining[event.id].msg)
				noticeMessage('发现 [' + mining[event.id].name + '] ' + mining[event.id].msg)
			}
			else if (energyMarkers && energy[event.id]) {
				alertMessage('发现 [' + energy[event.id].name + '] ' + energy[event.id].msg)
				noticeMessage('发现 [' + energy[event.id].name + '] ' + energy[event.id].msg)
			}
			else {
				return true
			}
			spawnItem(event.gameId, event.loc)
			mobid.push(event.gameId)
		}
	})
	
	mod.hook('S_DESPAWN_COLLECTION', 2, (event) => {
		if (mobid.includes(event.gameId)) {
			despawnItem(event.gameId)
			mobid.splice(mobid.indexOf(event.gameId), 1)
		}
	})
	
	function spawnItem(gameId, loc) {
		loc.z = loc.z - 100
		mod.send('S_SPAWN_DROPITEM', 6, {
			gameId: gameId*100n,
			loc: loc,
			item: 98260,
			amount: 1,
			expiry: 999999,
			owners: [{
				id: 0
			}]
		})
	}
	
	function despawnItem(gameId) {
		mod.send('S_DESPAWN_DROPITEM', 4, {
			gameId: gameId*100n
		})
	}
	
	function alertMessage(msg) {
		if (sendToAlert) {
			mod.send('S_DUNGEON_EVENT_MESSAGE', 2, {
				type: 43,
				chat: 0,
				channel: 0,
				message: msg
			})
		}
	}
	
	function noticeMessage(msg) {
		if (sendToNotice) {
			mod.send('S_CHAT', 2, {
				channel: 25,
				authorName: '采集',
				message: msg
			})
		}
	}
	
	function gatheringStatus() {
		sendStatus(
			`模块 : ${enabled ? BLU('开启') : YEL('关闭')}`,
			`警告消息 : ${sendToAlert ? BLU('启用') : YEL('禁用')}`,
			`通知消息 : ${sendToNotice ? BLU('启用') : YEL('禁用')}`,
			
			`植物提示 : ${plantsMarkers ? BLU('显示') : YEL('隐藏')}`,
			`矿石提示 : ${miningMarkers ? BLU('显示') : YEL('隐藏')}`,
			`精气提示 : ${energyMarkers ? BLU('显示') : YEL('隐藏')}`
		)
	}
	
	function sendStatus(msg) {
		mod.command.message([...arguments].join('\n\t - '))
	}
	
	function sendMessage(msg) {
		mod.command.message(msg)
	}
	
	function BLU(bluetext) {
		return '<font color="#56B4E9">' + bluetext + '</font>'
	}
	
	function YEL(yellowtext) {
		return '<font color="#E69F00">' + yellowtext + '</font>'
	}
	
	function RED(redtext) {
		return '<font color="#FF0000">' + redtext + '</font>'
	}
	
}
