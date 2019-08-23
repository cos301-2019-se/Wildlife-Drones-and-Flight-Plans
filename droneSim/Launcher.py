#!/usr/bin/env python
# -*- coding: utf-8 -*-

from __future__ import print_function

from dronekit import connect, VehicleMode, LocationGlobalRelative, LocationGlobal, Command
import time
import subprocess
import math
from pymavlink import mavutil
import base64
import json
import os
# Set up option parsing to get connection string
import argparse
parser = argparse.ArgumentParser(description='Gets base64')
parser.add_argument('--base64',
                   help="The base64 containing all the data needed for a simulation")
args = parser.parse_args()

base64String = args.base64
sitl = None

decoded_base64 = base64.b64decode(base64String)

decodedJson = decoded_base64.decode('utf8')
data = json.loads(decodedJson)
points = data["points"]
home = points[0]
homeLong = home[1]
homeLat = home[0]

# MissionPlanner location and run commannd

# subprocess.Popen("konsole -e 'bash -c \"cd /home/deane/Downloads/MissionPlanner-latest/ && mono MissionPlanner.exe; exec bash\"'", shell = True)

'''
Config file to load correct routes

config.json
"dronkit" : dronkit location
"mavproxy" : mav proxy location

'''

# read json config file
with open("config.json", "r") as f:
    config = json.load(f)

print("Opening Drone-kit")

subprocess.Popen("cd " + config["dronkit"] + " && dronekit-sitl copter --home=" + str(homeLong) + "," + str(homeLat) + ",500,300", shell = True)
time.sleep(5)
print("Opening mavproxy")
subprocess.Popen("cd " + config["mavproxy"] + " && mavproxy.py --master tcp:127.0.0.1:5760 --out udp:127.0.0.1:14551 --out udp:127.0.0.1:14550", shell = True)
print("Please connect mission planner in the next 10s")
time.sleep(10)

'''
{
    "token": "groovyMan",
    "droneId": 1,
    "droneSpeed": 2,
    "points":[
        [30.8925414763817,-22.7150831589717],
        [30.8925414763817,-22.7060899553344],
        [30.8925414763817,-22.7150831589717]
    ]
}


ewoJInRva2VuIjogImdyb292eU1hbiIsCgkiZHJvbmVJRCI6IDEsCgkiRHJvbmVTcGVlZCI6IDIsCgkicG9pbnRzIjogWwoJCVszMC44OTI1NDE0NzYzODE3LCAtMjIuNzE1MDgzMTU4OTcxN10sCgkJWzMwLjg5MjU0MTQ3NjM4MTcsIC0yMi43MDYwODk5NTUzMzQ0XSwKCQlbMzAuODkyNTQxNDc2MzgxNywgLTIyLjcxNTA4MzE1ODk3MTddCgldCn0=
'''

# Start SITL if no connection string specified with default

connection_string = "127.0.0.1:14551"

# Connect to the Vehicle through specified port
print('Connecting to vehicle on: %s' % connection_string)
vehicle = connect(connection_string, wait_ready=True)

'''
Description - Returns a LocationGlobal object containing the latitude/longitude `dNorth` and `dEast` metres from the
    specified `original_location`. The returned Location has the same `alt` value
    as `original_location`.
Side effects - none
Usage - original_location: LocationGlobal, dNorth: int, dEast: int
@param original_location
@param dNorth
@param dEast
@returns LocationGlobal
'''
def get_location_metres(original_location, dNorth, dEast):
    """
    The function is useful when you want to move the vehicle around specifying locations relative to
    the current vehicle position.
    The algorithm is relatively accurate over small distances (10m within 1km) except close to the poles
    """
    earth_radius=6378137.0 #Radius of "spherical" earth
    # Coordinate offsets in radians
    dLat = dNorth/earth_radius
    dLon = dEast/(earth_radius*math.cos(math.pi*original_location.lat/180))

    # New position in decimal degrees
    newlat = original_location.lat + (dLat * 180/math.pi)
    newlon = original_location.lon + (dLon * 180/math.pi)
    return LocationGlobal(newlat, newlon,original_location.alt)


'''
Description - Returns the ground distance in metres between two LocationGlobal objects.
Side effects - none
Usage - aLocation1: LocationGlobal, aLocation2: LocationGlobal
@param aLocation1
@param aLocation2
@returns float
'''
def get_distance_metres(aLocation1, aLocation2):
    '''
    This method is an approximation, and will not be accurate over large distances and close to the
    earth's poles.
    '''
    dlat = aLocation2.lat - aLocation1.lat
    dlong = aLocation2.lon - aLocation1.lon
    return math.sqrt((dlat*dlat) + (dlong*dlong)) * 1.113195e5


'''
Description -  Gets distance in metres to the current waypoint.
    It returns None for the first waypoint (Home location).
Side effects - none
Usage - none

@returns float
'''
def distance_to_current_waypoint():
    nextwaypoint = vehicle.commands.next
    if nextwaypoint==0:
        return None
    missionitem=vehicle.commands[nextwaypoint-1] # Commands are zero indexed
    lat = missionitem.x
    lon = missionitem.y
    alt = missionitem.z
    targetWaypointLocation = LocationGlobalRelative(lat,lon,alt)
    distancetopoint = get_distance_metres(vehicle.location.global_frame, targetWaypointLocation)
    return distancetopoint

'''
Description - Download the current mission from the vehicle.
Side effects - none
Usage - none

@returns none
'''
def download_mission():
    cmds = vehicle.commands
    cmds.download()
    cmds.wait_ready() # wait until download is complete.

'''
Description - Adds a takeoff command and four waypoint commands to the current mission.
Side effects - none
Usage - aLocations: array of cordinates
@params aLocations
@returns none
'''
def add_mission(aLocations):
    '''
    The waypoints are positioned to form a square of side length 2*aSize around the specified LocationGlobal (aLocation).

    The function assumes vehicle.commands matches the vehicle mission state
    (you must have called download at least once in the session and after clearing the mission)
    '''

    cmds = vehicle.commands

    print(" Clear any existing commands")
    cmds.clear()

    print(" Define/add new commands.")
    # Add new commands. The meaning/order of the parameters is documented in the Command class.

    # Add MAV_CMD_NAV_TAKEOFF command. This is ignored if the vehicle is already in the air.
    cmds.add(Command( 0, 0, 0, mavutil.mavlink.MAV_FRAME_GLOBAL_RELATIVE_ALT, mavutil.mavlink.MAV_CMD_NAV_TAKEOFF, 0, 0, 0, 0, 0, 0, 0, 0, 10))

    for location in aLocations:
        cmds.add(Command( 0, 0, 0, mavutil.mavlink.MAV_FRAME_GLOBAL_RELATIVE_ALT, mavutil.mavlink.MAV_CMD_NAV_WAYPOINT, 0, 0, 0, 0, 0, 0, location[1], location[0], 11))
    location = aLocations[0]
    # Dummy waypoint
    cmds.add(Command( 0, 0, 0, mavutil.mavlink.MAV_FRAME_GLOBAL_RELATIVE_ALT, mavutil.mavlink.MAV_CMD_NAV_WAYPOINT, 0, 0, 0, 0, 0, 0, location[1], location[0], 11))

    print(" Upload new commands to vehicle")
    cmds.upload()

'''
Description - Arms vehicle and fly to aTargetAltitude.
Side effects - none
Usage - aTargetAltitude: int
@params aTargetAltitude
@returns none
'''
def arm_and_takeoff(aTargetAltitude):
    print("Basic pre-arm checks")
    # Don't let the user try to arm until autopilot is ready
    while not vehicle.is_armable:
        print(" Waiting for vehicle to initialise...")
        time.sleep(1)

    print("Arming motors")
    # Copter should arm in GUIDED mode
    vehicle.mode = VehicleMode("GUIDED")
    vehicle.armed = True

    while not vehicle.armed:
        print(" Waiting for arming...")
        time.sleep(1)

    print("Taking off!")
    vehicle.simple_takeoff(aTargetAltitude) # Take off to target altitude

    # Wait until the vehicle reaches a safe height before processing the goto (otherwise the command
    #  after Vehicle.simple_takeoff will execute immediately).
    while True:
        print(" Altitude: ", vehicle.location.global_relative_frame.alt)
        if vehicle.location.global_relative_frame.alt>=aTargetAltitude*0.95: # Trigger just below target alt.
            print("Reached target altitude")
            break
        time.sleep(1)

print('Create a new mission (for current location)')
add_mission(points)

arm_and_takeoff(10)
print("Setting groundspeed to max")
vehicle.groundspeed = 15
print("Setting airspeed to max")
vehicle.airspeed = 10

print("Starting mission")
# Reset mission set to first (0) waypoint
vehicle.commands.next=1

# Set mode to AUTO to start mission
vehicle.mode = VehicleMode("AUTO")

lent = len(points)

import requests



url = "http://127.0.0.1:3000/updateDronePosition"



payload = " {\"droneId\":1,\"latitude\":0,\"longitude\":0}"

headers = {

    'Content-Type': "application/json",

    'Authorization': "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJsYXplLmN5YmVyY2VsbEBnbWFpbC5jb20iLCJpYXQiOjE1NjY1MDU1NjIsImV4cCI6MTU2NzExMDM2Mn0.Jm3r0bJMqP_aQDsAhCRod-g-m2pGDOy_Mor3KFcJo88",

    'User-Agent': "PostmanRuntime/7.15.2",

    'Accept': "/",

    'Cache-Control': "no-cache",

    'Postman-Token': "a1b7f85b-63eb-41a6-a654-2465740c78e7,f74eae29-6f3d-4872-a316-41b4a765138d",

    'Host': "127.0.0.1:3000",

    'Accept-Encoding': "gzip, deflate",

    'Content-Length': "14",

    'Connection': "keep-alive",

    'cache-control': "no-cache"

    }



response = requests.request("POST", url, data=payload, headers=headers)



print(response.text)


while True:
    nextwaypoint = vehicle.commands.next
    print('Distance to waypoint (%s): %s' % (nextwaypoint, distance_to_current_waypoint()))

    print('Long %s, Lat %s' % (vehicle.location.global_frame.lon, vehicle.location.global_frame.lat))
    payload = " {\"droneId\":1,\"latitude\":"+str(vehicle.location.global_frame.lat)+",\"longitude\":"+str(vehicle.location.global_frame.lon)+"}"

    response = requests.request("POST", url, data=payload, headers=headers)

    print(response)
    if nextwaypoint == lent + 1: #Dummy waypoint - as soon as we reach waypoint lent + 1 this is true and we exit.
        print("Exit 'standard' mission when start heading to final waypoint")
        break;
    time.sleep(5)

print('Return to launch')
vehicle.mode = VehicleMode("RTL")

# Close vehicle object before exiting script
print("Close vehicle object")
vehicle.close()

# Shut down simulator if it was started.
if sitl is not None:
    sitl.stop()
