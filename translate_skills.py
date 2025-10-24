#!/usr/bin/env python3
import json

# Common Chinese to English translations for skill names
translations = {
    # Ice/Water Mage skills
    "雨打潮生": "Rain Tide",
    "水之涡流": "Water Vortex",
    "清滝绕珠": "Clear Waterfall",
    "强化清滝绕珠": "Enhanced Clear Waterfall",
    "冰龙卷": "Ice Tornado",
    "幻影冲锋": "Phantom Charge",
    "幻影冲刺": "Phantom Dash",
    "水龙卷": "Water Tornado",
    "陨星风暴": "Meteor Storm",
    "冻结寒风": "Freezing Wind",
    "寒冰射线": "Ice Beam",
    "冰霜之矛": "Frost Spear",
    "冰之灌注": "Ice Infusion",
    "寒冰风暴": "Ice Storm",
    "寒冰庇护": "Ice Shelter",
    "浪潮汇聚": "Wave Convergence",
    "天赋触发彗星": "Talent Comet",
    "极寒·冰雪颂歌": "Extreme Cold: Ice Song",
    "协同冰晶": "Synergy Ice Crystal",
    "冰晶落": "Ice Crystal Fall",
    "冰霜彗星": "Frost Comet",
    "瞬发寒冰风暴": "Instant Ice Storm",
    
    # Spear skills
    "风华翔舞": "Graceful Dance",
    "疾风刺": "Swift Thrust",
    "风神": "Wind God",
    "破阵之风": "Formation Breaking Wind",
    "疾驰锋刃": "Swift Blade",
    "翔返": "Soaring Return",
    "风姿卓绝": "Graceful Excellence",
    "螺旋击刺": "Spiral Strike",
    "破追": "Breaking Chase",
    "刹那": "Instant",
    "飞鸟投": "Flying Bird Throw",
    
    # Common suffixes
    "普攻": "Normal Attack",
    "转弯子弹": "Homing Bullet",
    "最后一击": "Final Strike",
    "被动版": "Passive",
    "扫": "Sweep",
    "冲": "Charge",
    "砸": "Slam",
    "转踢": "Spin Kick",
    "下砸": "Down Slam",
    "段": "Hit",
}

# Read the Chinese skill names
with open('/development/BPSR-Meter/tables/skill_names.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Translate
skill_names = data.get('skill_names', {})
translated = {}

for skill_id, chinese_name in skill_names.items():
    # Try direct translation
    if chinese_name in translations:
        translated[skill_id] = translations[chinese_name]
    else:
        # Try partial translation
        english_name = chinese_name
        for cn, en in translations.items():
            english_name = english_name.replace(cn, en)
        
        # If still has Chinese characters, keep original with [CN] prefix
        if any('\u4e00' <= c <= '\u9fff' for c in english_name):
            translated[skill_id] = f"[CN] {chinese_name}"
        else:
            translated[skill_id] = english_name

# Write translated version
output = {"skill_names": translated}
with open('/development/BPSR-Meter/tables/skill_names.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=4)

print(f"Translated {len(translated)} skills")
print(f"Backup saved to skill_names_chinese_backup.json")
