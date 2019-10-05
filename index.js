module.exports = function Gathering(mod) {
	const Message = require('../tera-message')
	const MSG = new Message(mod)
	
	let plantsMarkers = false,
		miningMarkers = false,
		energyMarkers = false
	
	let mobid = [],
		gatherMarker = []
	
	function gatheringStatus() {
		sendStatus(
			"Gathering: " + (mod.settings.enabled     ? MSG.BLU("开启") : MSG.YEL("关闭")),
			"警告消息: " + (mod.settings.sendToAlert  ? MSG.BLU("启用") : MSG.YEL("禁用")),
			"通知消息: " + (mod.settings.sendToNotice ? MSG.BLU("启用") : MSG.YEL("禁用")),
			
			"植物提示: " + (plantsMarkers ? MSG.BLU("启用") : MSG.YEL("禁用")),
			"矿石提示: " + (miningMarkers ? MSG.BLU("启用") : MSG.YEL("禁用")),
			"精气提示: " + (energyMarkers ? MSG.BLU("启用") : MSG.YEL("禁用"))
		)
	}
	
	function sendStatus(msg) {
		MSG.chat([...arguments].join('\n\t - '))
	}
	
	mod.command.add("采集", (arg) => {
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
			MSG.chat("Gathering " + (mod.settings.enabled ? MSG.BLU("开启") : MSG.YEL("关闭")))
		} else {
			switch (arg) {
				case "警告":
					mod.settings.sendToAlert = !mod.settings.sendToAlert
					MSG.chat("警告消息 " + (mod.settings.sendToAlert ? MSG.BLU("启用") : MSG.YEL("禁用")))
					break
				case "通知":
					mod.settings.sendToNotice = !mod.settings.sendToNotice
					MSG.chat("通知消息 " + (mod.settings.sendToNotice ? MSG.BLU("启用") : MSG.YEL("禁用")))
					break
					
				case "状态":
					gatheringStatus()
					break
				
				case "植物":
					plantsMarkers = !plantsMarkers
					MSG.chat("植物提示 " + (plantsMarkers ? MSG.BLU("显示") : MSG.YEL("隐藏")))
					break
				case "矿石":
					miningMarkers = !miningMarkers
					MSG.chat("矿石提示 " + (miningMarkers ? MSG.BLU("显示") : MSG.YEL("隐藏")))
					break
				case "精气":
					energyMarkers = !energyMarkers
					MSG.chat("精气提示 " + (energyMarkers ? MSG.BLU("显示") : MSG.YEL("隐藏")))
					break
				
				default :
					MSG.chat("Gathering " + MSG.RED("无效的参数!"))
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
				MSG.alert(("发现 [" + gatherMarker.name + "] " + gatherMarker.msg), 44)
				MSG.raids( "发现 [" + gatherMarker.name + "] " + gatherMarker.msg)
			} else if (miningMarkers && (gatherMarker = mod.settings.mining.find(obj => obj.id === event.id))) {
				MSG.alert(("发现 [" + gatherMarker.name + "] " + gatherMarker.msg), 44)
				MSG.raids( "发现 [" + gatherMarker.name + "] " + gatherMarker.msg)
			} else if (energyMarkers && (gatherMarker = mod.settings.energy.find(obj => obj.id === event.id))) {
				MSG.alert(("发现 [" + gatherMarker.name + "] " + gatherMarker.msg), 44)
				MSG.raids( "发现 [" + gatherMarker.name + "] " + gatherMarker.msg)
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
}
