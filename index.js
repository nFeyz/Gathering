module.exports = function Gathering(mod) {
	const command = mod.command || mod.require.command;
	
	if (mod.proxyAuthor !== 'caali') {
		const options = require('./module').options
		if (options) {
			const settingsVersion = options.settingsVersion
			if (settingsVersion) {
				mod.settings = require('./' + (options.settingsMigrator || 'module_settings_migrator.js'))(mod.settings._version, settingsVersion, mod.settings)
				mod.settings._version = settingsVersion
			}
		}
	}
	
	let plantsMarkers = false,
		miningMarkers = false,
		energyMarkers = false
	
	let mobid = [],
		gatherMarker = []
	
	command.add('采集', (arg) => {
		if (!arg) {
			mod.settings.enabled = !mod.settings.enabled;
			if (!mod.settings.enabled) {
				plantsMarkers = false
				miningMarkers = false
				energyMarkers = false
				for (let itemId of mobid) {
					despawnItem(itemId)
				}
			}
			sendMessage('模块 ' + (mod.settings.enabled ? BLU('开启') : YEL('关闭')))
		} else {
			switch (arg) {
				case "警告":
					mod.settings.sendToAlert = !mod.settings.sendToAlert
					sendMessage('警告消息 ' + (mod.settings.sendToAlert ? BLU('启用') : YEL('禁用')))
					break
				case "通知":
					mod.settings.sendToNotice = !mod.settings.sendToNotice
					sendMessage('通知消息 ' + (mod.settings.sendToNotice ? BLU('启用') : YEL('禁用')))
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
		if (mod.settings.enabled) {
			if (plantsMarkers && (gatherMarker = mod.settings.plants.find(obj => obj.id === event.id))) {
				alertMessage( '发现 [' + gatherMarker.name + '] ' + gatherMarker.msg)
				noticeMessage('发现 [' + gatherMarker.name + '] ' + gatherMarker.msg)
			} else if (miningMarkers && (gatherMarker = mod.settings.mining.find(obj => obj.id === event.id))) {
				alertMessage( '发现 [' + gatherMarker.name + '] ' + gatherMarker.msg)
				noticeMessage('发现 [' + gatherMarker.name + '] ' + gatherMarker.msg)
			} else if (energyMarkers && (gatherMarker = mod.settings.energy.find(obj => obj.id === event.id))) {
				alertMessage( '发现 [' + gatherMarker.name + '] ' + gatherMarker.msg)
				noticeMessage('发现 [' + gatherMarker.name + '] ' + gatherMarker.msg)
			} else {
				return true
			}
			
			spawnItem(event.gameId, event.loc)
			mobid.push(event.gameId)
		}
	})
	
	mod.hook('S_DESPAWN_COLLECTION', 2, (event) => {
		if (mobid.includes(event.gameId)) {
			gatherMarker = []
			despawnItem(event.gameId)
			mobid.splice(mobid.indexOf(event.gameId), 1)
		}
	})
	
	function spawnItem(gameId, loc) {
		loc.z = loc.z - 100
		mod.send('S_SPAWN_DROPITEM', 7, {
			gameId: gameId*100n,
			loc: loc,
			item: mod.settings.markerId,
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
		if (mod.settings.sendToAlert) {
			mod.send('S_DUNGEON_EVENT_MESSAGE', 2, {
				type: 43,
				chat: 0,
				channel: 0,
				message: msg
			})
		}
	}
	
	function noticeMessage(msg) {
		if (mod.settings.sendToNotice) {
			mod.send('S_CHAT', 2, {
				channel: 25,
				authorName: 'TIP',
				message: msg
			})
		}
	}
	
	function gatheringStatus() {
		sendStatus(
			`模块 : ${mod.settings.enabled ? BLU('开启') : YEL('关闭')}`,
			`警告消息 : ${mod.settings.sendToAlert ? BLU('启用') : YEL('禁用')}`,
			`通知消息 : ${mod.settings.sendToNotice ? BLU('启用') : YEL('禁用')}`,
			
			`植物提示 : ${plantsMarkers ? BLU('显示') : YEL('隐藏')}`,
			`矿石提示 : ${miningMarkers ? BLU('显示') : YEL('隐藏')}`,
			`精气提示 : ${energyMarkers ? BLU('显示') : YEL('隐藏')}`
		)
	}
	
	function sendStatus(msg) {
		command.message([...arguments].join('\n\t - '))
	}
	
	function sendMessage(msg) {
		command.message(msg)
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
