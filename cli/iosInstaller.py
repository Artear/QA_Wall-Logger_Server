#!/usr/bin/env python
# -*- coding: utf-8 -*- 
import os
import re
import time
import thread
import curses
import datetime
import threading
import subprocess
import sys
from optparse import OptionParser


#-------------------------------- ARG PARSE -------------------------------------------#
def executeLaunch(UDID, APP_PATH):
	os.system('ios-deploy -u -L -m -d -i '+UDID+' -b '+APP_PATH+'')

def executeInstall(UDID, APP_PATH):
	os.system('mobiledevice install_app -u '+UDID+' '+APP_PATH+'')

def executeUninstall(UDID, bundleId):
	os.system('mobiledevice uninstall_app -u '+UDID+' '+bundleId+'')


parser = OptionParser()

parser.add_option("-p", "--path", type="string", 
	dest="file", 
	help="Path-To-App", 
	default=False)

parser.add_option("-b", "--bundleId", type="string", 
	dest="bundleId", 
	help="App-Bundle-Id", 
	default=False)


parser.add_option("-l", "--launch", action="store_true", 
	dest="launch", 
	help="Launch app", 
	default=False)

parser.add_option("-i", "--install", action="store_true", 
	dest="install", 
	help="Install app", 
	default=False)

parser.add_option("-u", "--uninstall", action="store_true", 
	dest="uninstall", 
	help="Uninstall app", 
	default=False)

(options, args) = parser.parse_args()

# ------------------------------------------- ARG VALIDATIONS -----------------------------------------------------#

if len(sys.argv) == 1:
    parser.print_help()
    exit(1)

# ------------------------------------------- FINDING DEVICES -----------------------------------------------------#

# mobiledevice get_bundle_id path/to/my_application.app

proc = subprocess.Popen('mobiledevice list_devices', shell=True, stdout=subprocess.PIPE)

devices = dict()

for line in proc.stdout:
	
	udid=line.rstrip()

	proc = subprocess.Popen('mobiledevice get_device_prop -u '+udid+' DeviceName', shell=True, stdout=subprocess.PIPE)
	devices[udid] = proc.stdout.readline().rstrip()


UDIDS = devices.keys()


# -------------------------------------------#
print ""
print 'ESTOS DISPOSITIVOS ESTAN CONECTADOS: {}' .format(len(UDIDS))
print ""
# -------------------------------------------#

for UDID in UDIDS:
	print devices[UDID] +" -- "+ UDID

print ""


# ------------------------------------------- ARG VALIDATIONS -----------------------------------------------------#

if (options.install != False):			#Insta
	if (options.file != False):
		# -------------------------------------------#
		print 'Quiere instalar {}' .format(options.file)
		print ""
		# -------------------------------------------#

		for UDID in UDIDS:
			threading.Thread(target=executeInstall, args=(UDID, options.file)).start()
			#proc = subprocess.Popen('mobiledevice install_app -u '+UDID+' '+options.file+'', shell=True, stdout=subprocess.PIPE)
			#print proc.stdout.readline().rstrip() +" "+ devices[UDID] 

		# -------------------------------------------#
	else:
		print "Falta el app (-p)"
else:
	if (options.uninstall != False):
		if (options.bundleId != False):

			# -------------------------------------------#
			print 'Quiere desinstalar {}' .format(options.bundleId)
			print ""
			# -------------------------------------------#

			for UDID in UDIDS:
				threading.Thread(target=executeUninstall, args=(UDID, options.bundleId)).start()
				#proc = subprocess.Popen('mobiledevice uninstall_app -u '+UDID+' '+options.bundleId+'', shell=True, stdout=subprocess.PIPE)
				#print proc.stdout.readline().rstrip() +" "+ devices[UDID] 

			# -------------------------------------------#

		else:
			if (options.file != False):

				proc = subprocess.Popen('mobiledevice get_bundle_id '+options.file+'', shell=True, stdout=subprocess.PIPE)
				bundleId = proc.stdout.readline().rstrip()



				# -------------------------------------------#
				print 'Quiere desinstalar {}' .format(bundleId)
				print ""
				# -------------------------------------------#

				for UDID in UDIDS:
					threading.Thread(target=executeUninstall, args=(UDID, bundleId)).start()
					#proc = subprocess.Popen('mobiledevice uninstall_app -u '+UDID+' '+bundleId+'', shell=True, stdout=subprocess.PIPE)
					#print proc.stdout.readline().rstrip() +" "+ devices[UDID] 

				# -------------------------------------------#

			else:
				print "Falta el bundle Id (-b) o el app (-p)"
	else:	
		if (options.launch != False):
			if (options.file != False):

				# -------------------------------------------#
				print 'Quiere lanzar {}' .format(options.file)
				print ""
				# -------------------------------------------#

				for UDID in UDIDS:
					threading.Thread(target=executeLaunch, args=(UDID, options.file)).start()
					#proc = subprocess.Popen('ios-deploy -u -L -m -d -i '+UDID+' -b '+options.file+'', shell=True, stdout=None)
					#print proc.stdout.readline().rstrip() +" "+ devices[UDID] 

				# -------------------------------------------#


			else:
				print "Falta el app (-p)"
		else:
			print "Faltan parametros"
