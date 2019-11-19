module.exports = function Gathering(mod) {
	let plantsMarkers = false,
		miningMarkers = false,
		energyMarkers = false,
		plants = false,
		mining = false,
		energy = false
	
	let mobid = [],
		gatherMarker = []
	
	function gatheringStatus() {
		sendStatus(
			"Gathering: "+ (mod.settings.enabled      ? "On"   : "Off"),
			"警告消息: " + (mod.settings.sendToAlert  ? "启用" : "禁用"),
			
			"植物提示: " + (plantsMarkers ? "显示" : "隐藏"),
			"矿石提示: " + (miningMarkers ? "显示" : "隐藏"),
			"精气提示: " + (energyMarkers ? "显示" : "隐藏"),
			"杂草: "     + (plants        ? "显示" : "隐藏"),
			"岩石: "     + (mining        ? "显示" : "隐藏"),
			"无色: "     + (energy        ? "显示" : "隐藏"),
		)
	}
	
	function sendStatus(msg) {
		sendMessage([...arguments].join('\n\t - '))
	}
	
	mod.command.add("采集", (arg) => {
		if (!arg) {
			mod.settings.enabled = !mod.settings.enabled;
			if (!mod.settings.enabled) {
				plantsMarkers = false
				miningMarkers = false
				energyMarkers = false
				plants = false
				mining = false
				energy = false
				for (let itemId of mobid) {
					despawnItem(itemId)
				}
			}
			gatheringStatus()
		} else {
			switch (arg) {
				case "警告":
					mod.settings.sendToAlert = !mod.settings.sendToAlert
					sendMessage("警告消息 " + (mod.settings.sendToAlert ? "启用" : "禁用"))
					break
				case "状态":
					gatheringStatus()
					break
				
				case "植物":
					plantsMarkers = !plantsMarkers
					sendMessage("植物提示 " + (plantsMarkers ? "显示" : "隐藏"))
					break
				case "矿石":
					miningMarkers = !miningMarkers
					sendMessage("矿石提示 " + (miningMarkers ? "显示" : "隐藏"))
					break
				case "精气":
					energyMarkers = !energyMarkers
					sendMessage("精气提示 " + (energyMarkers ? "显示" : "隐藏"))
					break
				
				case "杂草":
					plants = !plants
					sendMessage("杂草 " + (plants ? "显示" : "隐藏"))
					break
				case "岩石":
					mining = !mining
					sendMessage("矿石 " + (mining ? "显示" : "隐藏"))
					break
				case "无色":
					energy = !energy
					sendMessage("无色 " + (energy ? "显示" : "隐藏"))
					break
				
				default :
					sendMessage("无效的参数!")
					break
			}
		}
	})
	
	mod.game.me.on('change_zone', (zone, quick) => {
		mobid = []
	})
	
	mod.hook('S_SPAWN_COLLECTION', 4, (event) => {
		if (mod.settings.enabled) {
			if (plantsMarkers && (gatherMarker = mod.settings.plants.find(obj => obj.id === event.id))) {
				sendAlert( ("发现 [" + gatherMarker.name + "] " + gatherMarker.msg), 44)
				sendMessage("发现 [" + gatherMarker.name + "] " + gatherMarker.msg)
			} else if (miningMarkers && (gatherMarker = mod.settings.mining.find(obj => obj.id === event.id))) {
				sendAlert( ("发现 [" + gatherMarker.name + "] " + gatherMarker.msg), 44)
				sendMessage("发现 [" + gatherMarker.name + "] " + gatherMarker.msg)
			} else if (energyMarkers && (gatherMarker = mod.settings.energy.find(obj => obj.id === event.id))) {
				sendAlert( ("发现 [" + gatherMarker.name + "] " + gatherMarker.msg), 44)
				sendMessage("发现 [" + gatherMarker.name + "] " + gatherMarker.msg)
			} else if (plants && event.id == 1) {
				sendAlert( ("发现 [杂草] "), 44)
				sendMessage("发现 [杂草] ")
			} else if (mining && event.id == 101) {
				sendAlert( ("发现 [矿石] "), 44)
				sendMessage("发现 [矿石] ")
			} else if (energy && event.id == 201) {
				sendAlert( ("发现 [无色] "), 44)
				sendMessage("发现 [无色] ")
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
		mod.send('S_SPAWN_DROPITEM', 8, {
			gameId: gameId*10n,
			loc: loc,
			item: mod.settings.markerId,
			amount: 1,
			expiry: 999999
		})
	}
	
	function despawnItem(gameId) {
		mod.send('S_DESPAWN_DROPITEM', 4, {
			gameId: gameId*10n
		})
	}
	
	function sendMessage(msg) { mod.command.message(msg) }
	
	function sendAlert(msg, type) {
		mod.send('S_DUNGEON_EVENT_MESSAGE', 2, {
			type: type,
			chat: false,
			channel: 0,
			message: msg,
		})
	}
}
