const DefaultSettings = {
    "enabled":     false,
    "sendToAlert":  true, // on-screen warning prompt
    "markerId":    88704, //Velika Banquet commemorative coin
	
	"plants" : true,
	"ore" : true,
	"energy" : true,
	"grass" : true,
	"stone" : true,
	"achromic" : true,
	
	
    "Plants": [
        // {id: 1, name: 'special', msg: 'Tough Weed'},
        {id: 2, name: 'Plant', msg: 'Wild Cobseed'},
        {id: 3 ,name: 'Plant', msg: 'Veridia Root'},
        {id: 4, name: 'Plant', msg: 'Orange Mushroom'},
        {id: 5, name: 'Plant', msg: 'Moongourd'},
        {id: 6, name: 'Plant', msg: 'Apple Tree'}
    ],
    "Ore": [
        //{id: 101, name: 'special', msg: 'Plain Stone'},
        {id: 102, name: 'Ore', msg: 'Cobala Ore'},
        {id: 103, name: 'Ore', msg: 'Shadmetal Ore'},
        {id: 104, name: 'Ore', msg: 'Xermetal Ore'},
        {id: 105, name: 'Ore', msg: 'Normetal Ore'},
        {id: 106, name: 'Ore', msg: 'Galborne Ore'}
    ],
    "Energy": [
        // {id: 201, name: 'special', msg: 'Achromic Essence'},
        {id: 202, name: 'Energy', msg: 'Crimson Essence'},
        {id: 203, name: 'Energy', msg: 'Earth Essence'},
        {id: 204, name: 'Energy', msg: 'Azure Essence'},
        {id: 205, name: 'Energy', msg: 'Opal Essence'},
        {id: 206, name: 'Energy', msg: 'Obsidian Essence'}
    ]
}

module.exports = function MigrateSettings(from_ver, to_ver, settings) {
    if (from_ver === undefined) {
        // Migrate legacy config file
        return Object.assign(Object.assign({}, DefaultSettings), settings)
    } else if (from_ver === null) {
        // No config file exists, use default settings
        return DefaultSettings
    } else {
        // Migrate from older version (using the new system) to latest one
        if (from_ver + 1 < to_ver) { // Recursively upgrade in one-version steps
            settings = MigrateSettings(from_ver, from_ver + 1, settings)
            return MigrateSettings(from_ver + 1, to_ver, settings)
        }
        // If we reach this point it's guaranteed that from_ver === to_ver - 1, so we can implement
        // a switch for each version step that upgrades to the next version. This enables us to
        // upgrade from any version to the latest version without additional effort!
        switch (to_ver) {
            default:
                let oldsettings = settings
                settings = Object.assign(DefaultSettings, {})
                for (let option in oldsettings) {
                    if (option == "markerId") continue
                    if (settings[option]) {
                        settings[option] = oldsettings[option]
                    }
                }
                break
        }
        return settings
    }
}
