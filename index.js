module.exports = function Gathering(mod) {

	let mobid = [],
		gatherMarker = []
	
	function gatheringStatus() {
		sendStatus(
			"Gathering: "+ (mod.settings.enabled      ? "On"   : "Off"),
			"SendAlert: " + (mod.settings.sendToAlert  ? "Enable" : "Disable"),
			
			"plants: " + (mod.settings.plants ? "Show" : "Hide"),
			"ore: " + (mod.settings.ore ? "Show" : "Hide"),
			"energy: " + (mod.settings.energy ? "Show" : "Hide"),
			"grass: "     + (mod.settings.grass        ? "Show" : "Hide"),
			"stone: "     + (mod.settings.stone        ? "Show" : "Hide"),
			"achromic: "     + (mod.settings.achromic        ? "Show" : "Hide"),
		)
	}
	
	function sendStatus(msg) {
		sendMessage([...arguments].join('\n\t - '))
	}
	
	mod.command.add("gathering", (arg) => {
		if (!arg) {
			mod.settings.enabled = !mod.settings.enabled
			if (!mod.settings.enabled) {
				for (let itemId of mobid) {
					despawnItem(itemId)
				}
			}
			sendMessage("Gathering: "+ (mod.settings.enabled      ? "On"   : "Off"))
		} else {
			switch (arg) {
				case "alert":
					mod.settings.sendToAlert = !mod.settings.sendToAlert
					sendMessage("SendAlert" + (mod.settings.sendToAlert ? "Enable" : "Disable"))
					break
				case "status":
					gatheringStatus()
					break
				
				case "all":			
					mod.settings.plants = true
					mod.settings.ore = true
					mod.settings.energy = true
					mod.settings.grass = true
					mod.settings.stone = true
					mod.settings.achromic = true	
					gatheringStatus()
					break
					
				case "none":			
					mod.settings.plants = false
					mod.settings.ore = false
					mod.settings.energy = false
					mod.settings.grass = false
					mod.settings.stone = false
					mod.settings.achromic = false
					gatheringStatus()
					break
								
				case "plants":
					mod.settings.plants = !mod.settings.plants
					sendMessage("plant " + (mod.settings.plants ? "Show" : "Hide"))
					break
				case "ore":
					mod.settings.ore = !mod.settings.ore
					sendMessage("mining " + (mod.settings.ore ? "Show" : "Hide"))
					break
				case "energy":
					mod.settings.energy = !mod.settings.energy
					sendMessage("energy " + (mod.settings.energy ? "Show" : "Hide"))
					break
				
				case "grass":
					mod.settings.grass = !mod.settings.grass
					sendMessage("grass " + (mod.settings.grass ? "Show" : "Hide"))
					break
				case "stone":
					mod.settings.stone = !mod.settings.stone
					sendMessage("Plain stone " + (mod.settings.stone ? "Show" : "Hide"))
					break
				case "achromic":
					mod.settings.achromic = !mod.settings.achromic
					sendMessage("Achromic Essence " + (mod.settings.achromic ? "Show" : "Hide"))
					break
				
				default :
					sendMessage("invalid prompt!")
					break
			}
		}
	})
	
	mod.game.me.on('change_zone', (zone, quick) => {
		mobid = []
	})
	
	mod.hook('S_SPAWN_COLLECTION', 4, (event) => {
		if (mod.settings.enabled) {
			if (mod.settings.plants && (gatherMarker = mod.settings.Plants.find(obj => obj.id === event.id))) {
				sendAlert( ("Found [" + gatherMarker.name + "] " + gatherMarker.msg), 44)
				sendMessage("Found [" + gatherMarker.name + "] " + gatherMarker.msg)
			} else if (mod.settings.ore && (gatherMarker = mod.settings.Ore.find(obj => obj.id === event.id))) {
				sendAlert( ("Found [" + gatherMarker.name + "] " + gatherMarker.msg), 44)
				sendMessage("Found [" + gatherMarker.name + "] " + gatherMarker.msg)
			} else if (mod.settings.energy && (gatherMarker = mod.settings.Energy.find(obj => obj.id === event.id))) {
				sendAlert( ("Found [" + gatherMarker.name + "] " + gatherMarker.msg), 44)
				sendMessage("Found [" + gatherMarker.name + "] " + gatherMarker.msg)
			} else if (mod.settings.grass && event.id == 1) {
				sendAlert( ("Found [Harmony Grass] "), 44)
				sendMessage("Found [Harmony Grass] ")
			} else if (mod.settings.stone && event.id == 101) {
				sendAlert( ("Found [Plain Stone] "), 44)
				sendMessage("Found [Plain Stone] ")
			} else if (mod.settings.achromic && event.id == 201) {
				sendAlert( ("Found [Achromic Essence] "), 44)
				sendMessage("Found [Achromic Essence] ")
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
			expiry: 999999,
			owners: [{}]
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
