from flask import Flask, render_template, jsonify
import subprocess

app = Flask(__name__)

# Full path to adb.exe
ADB_PATH = r"C:\Users\KAIF\Downloads\platform-tools-latest-windows\platform-tools\adb.exe"  # <-- Apna path yahan set karo

# Apps list
apps = [
"com.camerasideas.instashot","com.shazam.android","org.xbet.client1","com.indeed.android.jobsearch",
"com.whatsapp","com.community.mbox.ng","com.tradingview.tradingviewapp","com.freelancer.android.messenger",
"com.global.foodpanda.android","com.gamma.scan","com.openai.chatgpt","com.tafayor.killall",
"com.lemon.lvoverseas","com.github.android","com.pas.webcam","com.instagram.android","com.deepseek.chat",
"com.microsoft.office.onenote","com.google.android.apps.tachyon","com.bahl.biometric","com.daraz.android",
"com.mxtech.videoplayer.ad","com.google.android.apps.bard","com.google.android.apps.docs","com.markaz.app",
"com.google.android.contactkeys","com.google.android.videos","com.anydesk.anydeskandroid","com.sadapay.app",
"com.facebook.katana","com.ofss.digx.mobile.obdx.bahl","com.exness.android.global","com.google.android.apps.translate",
"com.olx.pk","io.quotex.pk","com.binance.dev","com.videodownloader.all.video.tube.download.status.video.ai.downloader",
"com.google.android.safetycore","com.intsig.camscanner","co.hodor.fyhld","com.adobe.lrmobile",
"invo8.meezan.mb","com.canva.editor","com.snapchat.android"
]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/force_stop', methods=['POST'])
def force_stop():
    status_list = []
    for app in apps:
        subprocess.getoutput(f'"{ADB_PATH}" shell am force-stop {app}')
        status_list.append(f"{app} stopped")
    return jsonify({"status": status_list})

if __name__ == '__main__':
    app.run(debug=True)
