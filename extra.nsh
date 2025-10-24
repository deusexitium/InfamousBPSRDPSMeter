; Remove user data folder in Roaming when uninstalling
Section "Remove AppData" SECREMOVEAPPDATA
    RMDir /r "$APPDATA\bpsr-meter"
SectionEnd
