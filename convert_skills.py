#!/usr/bin/env python3
import json

# Load the combined file
with open('/development/BPSR-Meter/CombinedTranslatedWithManualOverrides.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Extract skill names
skill_names = {}

for skill_id, skill_data in data.items():
    # Try to get English name from various sources
    english_name = None
    
    # Priority 1: Manual override
    if skill_data.get('EnglishShortManualOverride'):
        english_name = skill_data['EnglishShortManualOverride']
    
    # Priority 2: RecountTable (official game names)
    elif 'RecountTable_Clean.json' in skill_data and skill_data['RecountTable_Clean.json'].get('EnglishShort'):
        english_name = skill_data['RecountTable_Clean.json']['EnglishShort']
    
    # Priority 3: SkillTable
    elif 'SkillTable_Clean.json' in skill_data and skill_data['SkillTable_Clean.json'].get('EnglishShort'):
        english_name = skill_data['SkillTable_Clean.json']['EnglishShort']
    
    # Priority 4: skill_names_Clean
    elif 'skill_names_Clean.json' in skill_data and skill_data['skill_names_Clean.json'].get('AIEnglishShort'):
        english_name = skill_data['skill_names_Clean.json']['AIEnglishShort']
    
    # Priority 5: Any AI translation
    elif 'SkillTable_Clean.json' in skill_data and skill_data['SkillTable_Clean.json'].get('AIEnglishShort'):
        english_name = skill_data['SkillTable_Clean.json']['AIEnglishShort']
    
    if english_name:
        skill_names[skill_id] = english_name

# Write to our format
output = {
    "skill_names": skill_names
}

with open('/development/BPSR-Meter/tables/skill_names.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=4)

print(f"✅ Converted {len(skill_names)} skill names")
print(f"📝 Written to /development/BPSR-Meter/tables/skill_names.json")
