on run arguments
    set mountPath to item 1 of arguments
    set backgroundPath to item 2 of arguments
    set mountFolder to POSIX file mountPath as alias
    set backgroundFile to POSIX file backgroundPath as alias

    tell application "Finder"
        open mountFolder
        set installerWindow to front Finder window
        set targetFolder to target of installerWindow
        set current view of installerWindow to icon view
        set toolbar visible of installerWindow to false
        set statusbar visible of installerWindow to false
        set bounds of installerWindow to {120, 120, 800, 540}

        set viewOptions to icon view options of installerWindow
        set arrangement of viewOptions to not arranged
        set icon size of viewOptions to 104
        set text size of viewOptions to 12
        set background picture of viewOptions to backgroundFile

        set position of item "Kapivara.app" of targetFolder to {176, 218}
        set position of item "Applications" of targetFolder to {504, 218}
        update targetFolder without registering applications
        delay 2
        close installerWindow
    end tell
end run
