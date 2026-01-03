# Install the ABD for Windows
1. https://developer.android.com/tools/releases/platform-tools
2. iska folder mein aik file hoge -> `abd.exe` yeah impotant hai

# Packages Install Requirements?
1. `pip install pure-python-adb`
1. `pip install flask`

# ABD Commands:
## `C:\Users\KAIF\Desktop\ADB\platform-tools-latest-windows\platform-tools` <br> is path wali location per yeah commands run karne hai:

1. `adb devices` yeah Connected phone ka batayge
2. `adb tcpip 5555` Ye command USB connected phone pe hi kaam karti hai yeah `port` set karti hai
2. `adb connect ip+5555` yeah per apna `IP` likhna hai wifi ka jo developer option mein `Wireless Debugging` mein hota hai waha per `IP` or `Port` hoga hume sirf ip likhna hai or Port `5555` rekhna hoga jo uper wali command mein set kiya tha or aik setting or enable karne hai `USE Debugging`
3. iska sari connect devices ka naam ajaygay

# Next day phir se Connect karne ka liya kia process karna hoga:
1. `Developer` options ON hain
2. `USB debugging` ON hai
3. `Phone` aur `PC` same Wi-Fi par connected ho.
4. `C:\Users\KAIF\Desktop\ADB\platform-tools-latest-windows\platform-tools` is Location per commands run karne hai
5. `adb connect 192.168.100.81:5555` iska Connect hoga
6. `adb devices` isa pata chal jayga ka device connect hai yeah nahe

# Ager bilkul New Device jo 1 Time Connect ho rehi hai oiska liya Process thora Alag hai:
