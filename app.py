from flask import Flask, render_template, request, jsonify
import subprocess, json

app = Flask(__name__)

ADB_PATH = r"C:\Users\Kaif\Desktop\Adb_Package\platform-tools-latest-windows\platform-tools\adb.exe"
DEVICES_FILE = "devices.json"

# ------------- HELPERS -------------
def adb(cmd):
    return subprocess.getoutput(cmd)

def load_devices():
    with open(DEVICES_FILE, "r") as f:
        return json.load(f)

def get_user_apps(device):
    out = adb(f'"{ADB_PATH}" -s {device} shell pm list packages -3')
    return [line.replace("package:", "") for line in out.splitlines()]

# ------------- ROUTES -------------
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/scan")
def scan():
    devices = load_devices()
    result = []
    for d in devices:
        out = adb(f'"{ADB_PATH}" connect {d["ip_port"]}')
        status = "Connected" if "connected" in out.lower() else "Failed"
        result.append({
            "name": d["name"],
            "ip": d["ip_port"],
            "status": status
        })
    return jsonify(result)

@app.route("/apps", methods=["POST"])
def apps():
    device = request.json.get("device")
    return jsonify(get_user_apps(device))

# -------- ACTIONS (MULTI-SELECT) --------
@app.route("/force_stop", methods=["POST"])
def force_stop():
    device = request.json.get("device")
    apps = request.json.get("apps", [])
    for app in apps:
        adb(f'"{ADB_PATH}" -s {device} shell am force-stop {app}')
    return jsonify(f"{len(apps)} apps force stopped")

@app.route("/clear", methods=["POST"])
def clear():
    device = request.json.get("device")
    apps = request.json.get("apps", [])
    if not apps:
        return jsonify("No apps selected")
    for app in apps:
        # Fixed: pm clear command works for each app
        adb(f'"{ADB_PATH}" -s {device} shell pm clear {app}')
    return jsonify(f"{len(apps)} apps cleared")

@app.route("/launch", methods=["POST"])
def launch():
    device = request.json.get("device")
    app = request.json.get("app")
    if not app:
        return jsonify("No app selected")
    adb(f'"{ADB_PATH}" -s {device} shell monkey -p {app} 1')
    return jsonify("App launched")

@app.route("/uninstall", methods=["POST"])
def uninstall():
    device = request.json.get("device")
    apps = request.json.get("apps", [])
    for app in apps:
        adb(f'"{ADB_PATH}" -s {device} uninstall {app}')
    return jsonify(f"{len(apps)} apps uninstalled")

@app.route("/battery", methods=["POST"])
def battery():
    device = request.json.get("device")
    out = adb(f'"{ADB_PATH}" -s {device} shell dumpsys battery')
    return jsonify(out)

# ------------- RUN -------------
if __name__ == "__main__":
    app.run(debug=True)
