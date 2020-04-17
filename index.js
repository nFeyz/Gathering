module.exports = function Gathering(mod) {
	let plants = false,
		ore = false,
		energy = false,
		grass = false,
		stone = false,
		achromic = false
	
	let mobid = [],
		gatherMarker = []
	
	function gatheringStatus() {
		sendStatus(
			"Gathering: "+ (mod.settings.enabled      ? "On"   : "Off"),
			"SendAlert: " + (mod.settings.sendToAlert  ? "Enable" : "Disable"),
			
			"plants: " + (plants ? "Show" : "Hide"),
			"ore: " + (ore ? "Show" : "Hide"),
			"energy: " + (energy ? "Show" : "Hide"),
			"grass: "     + (grass        ? "Show" : "Hide"),
			"stone: "     + (stone        ? "Show" : "Hide"),
			"achromic: "     + (achromic        ? "Show" : "Hide"),
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
					plants = true
					ore = true
					energy = true
					grass = true
					stone = true
					achromic = true	
					gatheringStatus()
					break
					
				case "none":			
					plants = false
					ore = false
					energy = false
					grass = false
					stone = false
					achromic = false
					gatheringStatus()
					break
								
				case "plants":
					plants = !plants
					sendMessage("plant " + (plants ? "Show" : "Hide"))
					break
				case "ore":
					ore = !ore
					sendMessage("mining " + (ore ? "Show" : "Hide"))
					break
				case "energy":
					energy = !energy
					sendMessage("energy " + (energy ? "Show" : "Hide"))
					break
				
				case "grass":
					grass = !grass
					sendMessage("grass " + (grass ? "Show" : "Hide"))
					break
				case "stone":
					stone = !stone
					sendMessage("Plain stone " + (stone ? "Show" : "Hide"))
					break
				case "achromic":
					achromic = !achromic
					sendMessage("Achromic Essence " + (achromic ? "Show" : "Hide"))
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
			if (plants && (gatherMarker = mod.settings.plants.find(obj => obj.id === event.id))) {
				sendAlert( ("Found [" + gatherMarker.name + "] " + gatherMarker.msg), 44)
				sendMessage("Found [" + gatherMarker.name + "] " + gatherMarker.msg)
			} else if (ore && (gatherMarker = mod.settings.mining.find(obj => obj.id === event.id))) {
				sendAlert( ("Found [" + gatherMarker.name + "] " + gatherMarker.msg), 44)
				sendMessage("Found [" + gatherMarker.name + "] " + gatherMarker.msg)
			} else if (energy && (gatherMarker = mod.settings.energy.find(obj => obj.id === event.id))) {
				sendAlert( ("Found [" + gatherMarker.name + "] " + gatherMarker.msg), 44)
				sendMessage("Found [" + gatherMarker.name + "] " + gatherMarker.msg)
			} else if (grass && event.id == 1) {
				sendAlert( ("Found [Harmony Grass] "), 44)
				sendMessage("Found [Harmony Grass] ")
			} else if (stone && event.id == 101) {
				sendAlert( ("Found [Plain Stone] "), 44)
				sendMessage("Found [Plain Stone] ")
			} else if (achromic && event.id == 201) {
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
