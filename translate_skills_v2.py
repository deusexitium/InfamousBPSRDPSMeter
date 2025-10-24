#!/usr/bin/env python3
import json
import re

# Comprehensive translation dictionary
translations = {
    # Water/Ice Mage
    "雨打潮生": "Rain Tide",
    "转弯子弹": "Homing Bullet",
    "最后一击": "Final Strike",
    "普攻": "Normal Attack",
    "段": "Hit",
    "水之涡流": "Water Vortex",
    "清滝绕珠": "Clear Waterfall",
    "强化清滝绕珠": "Enhanced Clear Waterfall",
    "强化": "Enhanced",
    "冰龙卷": "Ice Tornado",
    "幻影冲锋": "Phantom Charge",
    "幻影冲刺": "Phantom Dash",
    "水龙卷": "Water Tornado",
    "被动版": "Passive",
    "陨星风暴": "Meteor Storm",
    "冻结寒风": "Freezing Wind",
    "寒冰射线": "Ice Beam",
    "冰霜之矛": "Frost Spear",
    "冰之灌注": "Ice Infusion",
    "寒冰风暴": "Ice Storm",
    "寒冰庇护": "Ice Shelter",
    "浪潮汇聚": "Wave Convergence",
    "天赋触发彗星": "Talent Comet",
    "天赋": "Talent",
    "触发": "Trigger",
    "极寒·冰雪颂歌": "Extreme Cold: Ice Song",
    "极寒": "Extreme Cold",
    "冰雪颂歌": "Ice Song",
    "协同冰晶": "Synergy Ice Crystal",
    "协同": "Synergy",
    "冰晶": "Ice Crystal",
    "冰晶落": "Ice Crystal Fall",
    "冰霜彗星": "Frost Comet",
    "彗星": "Comet",
    "瞬发寒冰风暴": "Instant Ice Storm",
    "瞬发": "Instant",
    
    # Spear
    "风华翔舞": "Graceful Dance",
    "扫": "Sweep",
    "冲": "Charge",
    "砸": "Slam",
    "转踢": "Spin Kick",
    "下砸": "Down Slam",
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
    
    # Common terms
    "攻击": "Attack",
    "伤害": "Damage",
    "技能": "Skill",
    "连击": "Combo",
    "斩击": "Slash",
    "冲击": "Impact",
    "爆发": "Burst",
    "蓄力": "Charge",
    "旋转": "Spin",
    "跳跃": "Jump",
    "下落": "Fall",
    "突进": "Dash",
    "回旋": "Whirl",
    "连斩": "Combo Slash",
}

# Read current file
with open('/development/BPSR-Meter/tables/skill_names.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

skill_names = data.get('skill_names', {})
translated = {}
untranslated_count = 0

for skill_id, name in skill_names.items():
    # Remove [CN] prefix if exists
    clean_name = name.replace('[CN] ', '')
    
    # Try direct translation first
    if clean_name in translations:
        translated[skill_id] = translations[clean_name]
        continue
    
    # Try partial translation
    english_name = clean_name
    for cn, en in sorted(translations.items(), key=lambda x: len(x[0]), reverse=True):
        english_name = english_name.replace(cn, en)
    
    # Check if still has Chinese
    if any('\u4e00' <= c <= '\u9fff' for c in english_name):
        # Keep original without [CN] prefix for now
        translated[skill_id] = clean_name
        untranslated_count += 1
    else:
        translated[skill_id] = english_name

# Write output
output = {"skill_names": translated}
with open('/development/BPSR-Meter/tables/skill_names.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=4)

print(f"✅ Processed {len(translated)} skills")
print(f"⚠️  {untranslated_count} skills still contain Chinese characters")
print(f"✅ {len(translated) - untranslated_count} skills fully translated")
