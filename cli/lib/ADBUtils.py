import re

# from matplotlib.compat import subprocess
import subprocess

from lib import CMDUtils


class BrowserType:
    def __init__(self):
        pass

    BROWSER_ANY = "any"
    BROWSER_CHROME = "chrome"
    BROWSER_FIREFOX = "firefox"


def get_connected_devices():
    device_list = list()
    devices_pipe = subprocess.Popen("adb devices", shell=True, stdout=subprocess.PIPE)

    for line in devices_pipe.stdout:
        parts = re.search('(.*)\tdevice', line)
        if parts:
            device_list.append(parts.group(1))

    return device_list


def get_package_from_apk(p_apk_file):
    pipe = subprocess.Popen("aapt dump badging " + p_apk_file
                            + " | grep package:\\ name | cut -d \\' -f 2", shell=True, stdout=subprocess.PIPE)
    package_name = pipe.stdout.read()
    pipe.wait()
    return package_name[:-1]


def get_launchable_activity(p_apk_file):
    lpipe = subprocess.Popen("aapt dump badging " + p_apk_file
                             + " | grep launchable-activity:\\ name | cut -d \\' -f 2", shell=True, stdout=subprocess.PIPE)
    launchable_activity = lpipe.stdout.read()
    lpipe.wait()
    return launchable_activity[:-1]


def run(p_device_id, activity_full_path):
    CMDUtils.execute("adb -s " + p_device_id + " shell am start -a android.intent.action.MAIN -n " + activity_full_path)


def install(p_device_id, p_apk_file):
    CMDUtils.execute("adb -s " + p_device_id + " install " + p_apk_file)


def uninstall(p_device_id, package):
    CMDUtils.execute("adb -s " + p_device_id + " uninstall " + package)


def install_and_run(p_device_id, p_apk_file, p_uninstall, p_run):
    package = get_package_from_apk(p_apk_file)
    activity_full_path = package + "/" + get_launchable_activity(p_apk_file)

    if p_uninstall:
        uninstall(p_device_id, package)

    install(p_device_id, p_apk_file)

    if p_run:
        run(p_device_id, activity_full_path)


def open_url(p_device_id, url, browser_type):
    if browser_type == BrowserType.BROWSER_ANY:
        CMDUtils.execute("adb -s " + p_device_id + " shell am start -a android.intent.action.VIEW -d " + url)

    elif browser_type == BrowserType.BROWSER_CHROME:
        CMDUtils.execute("adb -s " + p_device_id + " shell am start -a android.intent.action.VIEW -n com.android.chrome/com.google.android.apps.chrome.Main -d " + url)

    elif browser_type == BrowserType.BROWSER_FIREFOX:
        CMDUtils.execute("adb -s " + p_device_id + " shell am start -a android.intent.action.VIEW -n org.mozilla.firefox/.App -d " + url)


def clear_user_data(p_device_id, package):
    CMDUtils.execute("adb -s " + p_device_id + " shell pm clear " + package)


def reboot_device(p_device_id):
    CMDUtils.execute("adb -s " + p_device_id + " shell reboot")


def pretty_print_devices():
    CMDUtils.print_title("Connected Devices:" + '\n-' + '\n-'.join(get_connected_devices()))
