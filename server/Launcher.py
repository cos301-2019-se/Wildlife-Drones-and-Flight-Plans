#!/usr/bin/env python
# -*- coding: utf-8 -*-

from __future__ import print_function

from dronekit import connect, VehicleMode, LocationGlobalRelative, LocationGlobal, Command
import time
import math
from pymavlink import mavutil
import base64
import json
#Set up option parsing to get connection string
import argparse
parser = argparse.ArgumentParser(description='Gets base64')
parser.add_argument('--base64',
                   help="The base64 containing all the data needed for a simulation")
args = parser.parse_args()

base64String = args.base64
sitl = None

decoded_base64 = base64.b64decode(base64String)

my_json = decoded_base64.decode('utf8')

print(my_json)
#my_json.token
# Load the JSON to a Python list & dump it back out as formatted JSON
data = json.loads(my_json)
#a = json.loads(decoded_base64)
'''
{
    "token": "groovyMan",
    "droneID": 1,
    "DroneSpeed": 2,
    "points":[
        [30.8925414763817,-22.7150831589717],
        [30.8925414763817,-22.7060899553344],
        [30.8925414763817,-22.7150831589717]
    ]
}


ewoJInRva2VuIjogImdyb292eU1hbiIsCgkiZHJvbmVJRCI6IDEsCgkiRHJvbmVTcGVlZCI6IDIsCgkicG9pbnRzIjogWwoJCVszMC44OTI1NDE0NzYzODE3LCAtMjIuNzE1MDgzMTU4OTcxN10sCgkJWzMwLjg5MjU0MTQ3NjM4MTcsIC0yMi43MDYwODk5NTUzMzQ0XSwKCQlbMzAuODkyNTQxNDc2MzgxNywgLTIyLjcxNTA4MzE1ODk3MTddCgldCn0=
'''


print("json")
print(data)
#print(a)

#Start SITL if no connection string specified with default

connection_string = "127.0.0.1:14551"


# Connect to the Vehicle through specified port
print('Connecting to vehicle on: %s' % connection_string)
vehicle = connect(connection_string, wait_ready=True)


def get_location_metres(original_location, dNorth, dEast):
    """
    Returns a LocationGlobal object containing the latitude/longitude `dNorth` and `dEast` metres from the
    specified `original_location`. The returned Location has the same `alt` value
    as `original_location`.

    The function is useful when you want to move the vehicle around specifying locations relative to
    the current vehicle position.
    The algorithm is relatively accurate over small distances (10m within 1km) except close to the poles
    """
    earth_radius=6378137.0 #Radius of "spherical" earth
    #Coordinate offsets in radians
    dLat = dNorth/earth_radius
    dLon = dEast/(earth_radius*math.cos(math.pi*original_location.lat/180))

    #New position in decimal degrees
    newlat = original_location.lat + (dLat * 180/math.pi)
    newlon = original_location.lon + (dLon * 180/math.pi)
    return LocationGlobal(newlat, newlon,original_location.alt)


def get_distance_metres(aLocation1, aLocation2):
    """
    Returns the ground distance in metres between two LocationGlobal objects.

    This method is an approximation, and will not be accurate over large distances and close to the
    earth's poles.
    """
    dlat = aLocation2.lat - aLocation1.lat
    dlong = aLocation2.lon - aLocation1.lon
    return math.sqrt((dlat*dlat) + (dlong*dlong)) * 1.113195e5



def distance_to_current_waypoint():
    """
    Gets distance in metres to the current waypoint.
    It returns None for the first waypoint (Home location).
    """
    nextwaypoint = vehicle.commands.next
    if nextwaypoint==0:
        return None
    missionitem=vehicle.commands[nextwaypoint-1] #commands are zero indexed
    lat = missionitem.x
    lon = missionitem.y
    alt = missionitem.z
    targetWaypointLocation = LocationGlobalRelative(lat,lon,alt)
    distancetopoint = get_distance_metres(vehicle.location.global_frame, targetWaypointLocation)
    return distancetopoint


def download_mission():
    """
    Download the current mission from the vehicle.
    """
    cmds = vehicle.commands
    cmds.download()
    cmds.wait_ready() # wait until download is complete.



def add_mission(aLocation, aSize):
    """
    Adds a takeoff command and four waypoint commands to the current mission.
    The waypoints are positioned to form a square of side length 2*aSize around the specified LocationGlobal (aLocation).

    The function assumes vehicle.commands matches the vehicle mission state
    (you must have called download at least once in the session and after clearing the mission)
    """

    cmds = vehicle.commands

    print(" Clear any existing commands")
    cmds.clear()

    print(" Define/add new commands.")
    # Add new commands. The meaning/order of the parameters is documented in the Command class.

    #Add MAV_CMD_NAV_TAKEOFF command. This is ignored if the vehicle is already in the air.
    cmds.add(Command( 0, 0, 0, mavutil.mavlink.MAV_FRAME_GLOBAL_RELATIVE_ALT, mavutil.mavlink.MAV_CMD_NAV_TAKEOFF, 0, 0, 0, 0, 0, 0, 0, 0, 10))

    #Define the four MAV_CMD_NAV_WAYPOINT locations and add the commands
    point1 = get_location_metres(aLocation, aSize, -aSize)
    point2 = get_location_metres(aLocation, aSize, aSize)
    point3 = get_location_metres(aLocation, -aSize, aSize)
    point4 = get_location_metres(aLocation, -aSize, -aSize)
    cmds.add(Command( 0, 0, 0, mavutil.mavlink.MAV_FRAME_GLOBAL_RELATIVE_ALT, mavutil.mavlink.MAV_CMD_NAV_WAYPOINT, 0, 0, 0, 0, 0, 0, point1.lat, point1.lon, 11))
    cmds.add(Command( 0, 0, 0, mavutil.mavlink.MAV_FRAME_GLOBAL_RELATIVE_ALT, mavutil.mavlink.MAV_CMD_NAV_WAYPOINT, 0, 0, 0, 0, 0, 0, point2.lat, point2.lon, 12))
    cmds.add(Command( 0, 0, 0, mavutil.mavlink.MAV_FRAME_GLOBAL_RELATIVE_ALT, mavutil.mavlink.MAV_CMD_NAV_WAYPOINT, 0, 0, 0, 0, 0, 0, point3.lat, point3.lon, 13))
    cmds.add(Command( 0, 0, 0, mavutil.mavlink.MAV_FRAME_GLOBAL_RELATIVE_ALT, mavutil.mavlink.MAV_CMD_NAV_WAYPOINT, 0, 0, 0, 0, 0, 0, point4.lat, point4.lon, 14))
    #add dummy waypoint "5" at point 4 (lets us know when have reached destination)
    cmds.add(Command( 0, 0, 0, mavutil.mavlink.MAV_FRAME_GLOBAL_RELATIVE_ALT, mavutil.mavlink.MAV_CMD_NAV_WAYPOINT, 0, 0, 0, 0, 0, 0, point4.lat, point4.lon, 14))

    print(" Upload new commands to vehicle")
    cmds.upload()


def arm_and_takeoff(aTargetAltitude):
    """
    Arms vehicle and fly to aTargetAltitude.
    """

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
        if vehicle.location.global_relative_frame.alt>=aTargetAltitude*0.95: #Trigger just below target alt.
            print("Reached target altitude")
            break
        time.sleep(1)


#def getDroneRoutes(id):

    #import requests

    #url = "http://127.0.0.1:3000/getIndividualDroneRoute"

    #payload = " {\"id\":"+str(id+"}"
    #headers = {
        #'Content-Type': "application/json",
        #'Authorization': "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJyeWFuQGdtYWlsLmNvbSIsImlhdCI6MTU2NTIwNjQyNSwiZXhwIjoxNTY1MjEwMDI1fQ.IvzCvwo6EfCbWxerx1niyX_FgZc_LarIv3k8O55RVIs",
        #'User-Agent': "PostmanRuntime/7.15.2",
        #'Accept': "/",
        #'Cache-Control': "no-cache",
        #'Postman-Token': "a1b7f85b-63eb-41a6-a654-2465740c78e7,f74eae29-6f3d-4872-a316-41b4a765138d",
        #'Host': "127.0.0.1:3000",
        #'Accept-Encoding': "gzip, deflate",
        #'Content-Length': "14",
        #'Connection': "keep-alive",
        #'cache-control': "no-cache"
        #}

    #response = requests.request("POST", url, data=payload, headers=headers)

    #print(response.text)






print('Create a new mission (for current location)')
#getDroneRoutes(1)
add_mission(vehicle.location.global_frame,50)


# From Copter 3.3 you will be able to take off using a mission item. Plane must take off using a mission item (currently).
arm_and_takeoff(10)

print("Starting mission")
# Reset mission set to first (0) waypoint
vehicle.commands.next=1

# Set mode to AUTO to start mission
vehicle.mode = VehicleMode("AUTO")


# Monitor mission.
# Demonstrates getting and setting the command number
# Uses distance_to_current_waypoint(), a convenience function for finding the
#   distance to the next waypoint.
#nextwaypoint=vehicle.commands.next
while True:
    nextwaypoint=vehicle.commands.next
    print('Distance to waypoint (%s): %s' % (nextwaypoint, distance_to_current_waypoint()))

    #if nextwaypoint==3: #Skip to next waypoint
        #print('Skipping to Waypoint 5 when reach waypoint 3')
        #vehicle.commands.next = 5
    if nextwaypoint==5: #Dummy waypoint - as soon as we reach waypoint 4 this is true and we exit.
        print("Exit 'standard' mission when start heading to final waypoint (5)")
        break;
    time.sleep(1)

print('Return to launch')
vehicle.mode = VehicleMode("RTL")


#Close vehicle object before exiting script
print("Close vehicle object")
vehicle.close()

# Shut down simulator if it was started.
if sitl is not None:
    sitl.stop()



    ##getDroneRoutes
    ##updateDrones
