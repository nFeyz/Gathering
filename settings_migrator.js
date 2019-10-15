const DefaultSettings = {
    "enabled":     false,
    "sendToAlert":  true, // 屏中警告提示
    "markerId":    98260, // 光柱提示物 98260 ---古龍貝勒古斯的頭
    "plants": [
        {id: 1, name: '特殊', msg: '坚韧的杂草'},
        {id: 2, name: '植物', msg: '野生玉米'},
        {id: 3 ,name: '植物', msg: '野生红葡萄'},
        {id: 4, name: '植物', msg: '黄蘑菇'},
        {id: 5, name: '植物', msg: '老南瓜'},
        {id: 6, name: '植物', msg: '苹果树'}
    ],
    "mining": [
        {id: 101, name: '特殊', msg: '岩石'},
        {id: 102, name: '矿石', msg: '钴矿石'},
        {id: 103, name: '矿石', msg: '硒矿石'},
        {id: 104, name: '矿石', msg: '水晶矿石'},
        {id: 105, name: '矿石', msg: '秘银矿石'},
        {id: 106, name: '矿石', msg: '碣矿石'}
    ],
    "energy": [
        {id: 201, name: '特殊', msg: '无色结晶'},
        {id: 202, name: '精气', msg: '赤色结晶'},
        {id: 203, name: '精气', msg: '绿色结晶'},
        {id: 204, name: '精气', msg: '青色结晶'},
        {id: 205, name: '精气', msg: '白色结晶'},
        {id: 206, name: '精气', msg: '被污染的花'}
    ]
};

module.exports = function MigrateSettings(from_ver, to_ver, settings) {
    if (from_ver === undefined) {
        // Migrate legacy config file
        return Object.assign(Object.assign({}, DefaultSettings), settings);
    } else if (from_ver === null) {
        // No config file exists, use default settings
        return DefaultSettings;
    } else {
        // Migrate from older version (using the new system) to latest one
        if (from_ver + 1 < to_ver) { // Recursively upgrade in one-version steps
            settings = MigrateSettings(from_ver, from_ver + 1, settings);
            return MigrateSettings(from_ver + 1, to_ver, settings);
        }
        // If we reach this point it's guaranteed that from_ver === to_ver - 1, so we can implement
        // a switch for each version step that upgrades to the next version. This enables us to
        // upgrade from any version to the latest version without additional effort!
        switch (to_ver) {
            default:
                let oldsettings = settings
                settings = Object.assign(DefaultSettings, {});
                for (let option in oldsettings) {
                    if (settings[option]) {
                        settings[option] = oldsettings[option]
                    }
                }
                break;
        }
        return settings;
    }
}
