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
			"SendAlert: " + (mod.settings.sendToAlert  ? "Enable" : "Disable"),
			
			"plantMarkers: " + (plantsMarkers ? "Show" : "Hide"),
			"miningMarkers: " + (miningMarkers ? "Show" : "Hide"),
			"energyMarkers: " + (energyMarkers ? "Show" : "Hide"),
			"plant: "     + (plants        ? "Show" : "Hide"),
			"mining: "     + (mining        ? "Show" : "Hide"),
			"energy: "     + (energy        ? "Show" : "Hide"),
		)
	}
	
	function sendStatus(msg) {
		sendMessage([...arguments].join('\n\t - '))
	}
	
	mod.command.add("gathering", (arg) => {
		if (!arg) {
			mod.settings.enabled = !mod.settings.enabled
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
			
		} else {
			switch (arg) {
				case "alert":
					mod.settings.sendToAlert = !mod.settings.sendToAlert
					sendMessage("SendAlert" + (mod.settings.sendToAlert ? "Enable" : "Disable"))
					break
				case "status":
					gatheringStatus()
					break
				
				case "plant":
					plantsMarkers = !plantsMarkers
					sendMessage("plantMarkers " + (plantsMarkers ? "Show" : "Hide"))
					break
				case "ore":
					miningMarkers = !miningMarkers
					sendMessage("miningMarkers " + (miningMarkers ? "Show" : "Hide"))
					break
				case "energy":
					energyMarkers = !energyMarkers
					sendMessage("energyMarkers " + (energyMarkers ? "Show" : "Hide"))
					break
				
				case "weed":
					plants = !plants
					sendMessage("plants " + (plants ? "Show" : "Hide"))
					break
				case "stone":
					mining = !mining
					sendMessage("mining " + (mining ? "Show" : "Hide"))
					break
				case "colourless":
					energy = !energy
					sendMessage("energy " + (energy ? "Show" : "Hide"))
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
			if (plantsMarkers && (gatherMarker = mod.settings.plants.find(obj => obj.id === event.id))) {
				sendAlert( ("Found [" + gatherMarker.name + "] " + gatherMarker.msg), 44)
				sendMessage("Found [" + gatherMarker.name + "] " + gatherMarker.msg)
			} else if (miningMarkers && (gatherMarker = mod.settings.mining.find(obj => obj.id === event.id))) {
				sendAlert( ("Found [" + gatherMarker.name + "] " + gatherMarker.msg), 44)
				sendMessage("Found [" + gatherMarker.name + "] " + gatherMarker.msg)
			} else if (energyMarkers && (gatherMarker = mod.settings.energy.find(obj => obj.id === event.id))) {
				sendAlert( ("Found [" + gatherMarker.name + "] " + gatherMarker.msg), 44)
				sendMessage("Found [" + gatherMarker.name + "] " + gatherMarker.msg)
			} else if (plants && event.id == 1) {
				sendAlert( ("Found [weed] "), 44)
				sendMessage("Found [weed] ")
			} else if (mining && event.id == 101) {
				sendAlert( ("Found [ore] "), 44)
				sendMessage("Found [ore] ")
			} else if (energy && event.id == 201) {
				sendAlert( ("Found [clourless] "), 44)
				sendMessage("Found [colourless] ")
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
