# API endpoints

## Rangers

### POST /rangers
```
{
  lat: number;
  lng: number;
  id: number;
}
```
Set a ranger's location. Updates location if already in the database.
Returns a list of all rangers' current positions.
This way every time we get everyone else's position, we are telling them ours.



## Drones
### GET /drones
Returns a list of drones with their current positions.

### POST /drones/update
```
{
  id: number;
  name: string;
  
  averageFlightTime: number; // how long the drone is expected to fly for
  flightTime: number; // how long the drone has left
  
  averageSpeed: number; // how fast the drone flies on average
  speed: number; // how fast the drone is currently flying
  
  isInFlight: boolean; // whether the drone is being used or not
  lat: number; // current position of drone (doesn't matter when !isInFlight)
  lng: number;
}
```
Updates drone information

## Drone Routes
### POST /drone-routes/generate
```
{
  drone: number; // drone id
  startPosition: number[]; // lat lng
  additionalWaypoints: Array<number[]> // array of points for compulsory visits
}
```
Returns a route (list of points)

### POST drone-routes/visited-cell
```
{
  coordinates: number[]; // lat lng of center of cell visited
}
```
Tell the system that we visited a cell. This will be used to determine how long
it has been since a hotspot or the surrounding area was last visited, giving
higher priority to those which have not been visited in a while.
Shouldn't matter which drone visited. We just want to know when it was last visited.

### POST /drone-routes/complete
```
{
  id: number;
}
```
Tells the system that a route has been completed.

### GET /drone-routes/status
```
{
  id: number;
}
```
Get the route status for a given route. Will inform time to completion, % complete,
battery status, etc.

This data is gathered from the /drones/update call, which the drone will call actively.


## Ranger routes
### POST /ranger-routes/generate
```
{
  id: number; // ranger id
}
```
Generates a route along roads for a ranger to follow. These routes are not paramount to the
patrolling system, and as such we do not keep track of their status. Instead, we allow rangers
and pilots to see the locations of other drones.


## Incidents
### POST /incidents/report
```
{
  location: number[]; // lat lng
  type: number; // incident type
  description?: string; // optional
}
```
Log a poaching incident

### GET /incidents
```
{
  since: Date;
}
```
Returns a list of all previous incidents since the given date




## Animal tracking data
### GET /animals/positions
Returns a list of the most recent animal tracking location
for each individual of each species, as well as their next predicted locations for
2 hours into the future.

### POST /animals/add-tracking-points
```
{
  data: Array<{
    species: number;
    individual: string;
    lat: number;
    lng: number;
    timestamp: Date;
  }>;
}
```
Adds a tracking point or list of tracking points for animals.



## Map
### POST /map/set-reserve * admin only
```
{
  name: string;
}
```
Sets the reserve. This wipes the entire database clean, downloads the reserve
and then performs necessary calculations to rebuild models.

### POST /map/update
Updates the map data from Open Street Maps, and performs recalculations on
the data.

### GET /map/hotspots
Returns a list of hotspots for time now.

### GET /map/animal-heatmap?x=${x}&y=${y}&z=${z}
Returns a heatmap tile for animal areas

### GET /map/poacher-heatmap?x=${x}&y=${y}&z=${z}
Returns a heatmap tile for poaching areas




## User
### POST /user/login *no token required
```
{
  email: string;
  password: string;
}
```
Starts 2FA. Sends code to user.

### POST /user/validate-2fa
```
{
  email: string;
  code: string;
}
```
returns token

### POST /user/logout
```
{
  token: string;
}
```
Logs the user out (invalidates their token)

### POST /user/validate-token
```
{
  token: string;
}
```
Check whether a token is still valid or not.
Refreshes the token.
Returns true or false

### POST /user/register * admin only
```
{
  token: string;
  email: string;
  password: string;
}
```

### POST /user/remove * admin only
```
{
  id: string;
}
```