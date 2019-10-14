# Wildlife Drones and Flight Plans
<img src="https://imgur.com/38kDt19.png" />



To aid ERP rangers in anti-poaching monitoring, a system is being developed to automatically create and optimise drone flight plans based on animal tracking information and reserve features. The project aims to increase the probability of drones covering key areas with endangered wildlife, while being random enough to prevent poachers identifying patrol routes. Rangers and drone pilots will be empowered with useful information through this dynamic application.


## System Presentation
[System presentation](/Documentation/Wildlife%20Drones%20and%20Flight%20Plans%20Virtual%20Presentation.pdf)

[Short video demo](https://youtu.be/vnIvxsNr3tk)

[Shortest paths interactive demo](https://wildlife-drones-paths-demo.matthewevans.co.za/)

<table>
  <tr>
    <td><img src="https://i.imgur.com/BGSGkqa.png" width="200px" /></td>
    <td><img src="https://i.imgur.com/83ZQjFU.png" width="200px" /></td>
    <td><img src="https://i.imgur.com/dW1kwGn.png" width="200px" /></td>
  </tr>
</table>


## Documents
| Document                         	| Link                                                                                        	|
|----------------------------------	|---------------------------------------------------------------------------------------------	|
| SRS                              	| [Software Requirements Specification](Documentation/Demo4/Drone_Flight_Plans_SRS_Demo4.pdf) 	|
| Coding Standards                 	| [Coding Standards](/Documentation/Demo4/CodingStandards_Demo4.pdf)                          	|
| Testing Policy                   	| [Testing Policy](/Documentation/Demo4/Testing_policy_document_Demo4.pdf)                    	|
| User Manual                      	| [User Manual](Documentation/Demo4/userManual_Demo4.pdf)                                     	|
| Project management tool (Trello) 	| [Trello Board](https://trello.com/b/GWit5JXi/capstone)                                      	|



## Running the project

- First download the project then configure the project environment - see the environment configuration section below.

- Required software: Node JS for server and client. 

<details><summary><b>Downloading the project</b></summary>
<p>
  
Downloading Wildlife Drones and Flight Plan <br/>
- Clone or download the repository on the GitHub page. <br/>
- Select Download ZIP. <br/>
- Once the zip file has been downloaded unzip the folder. <br/>

</p>
</details>
</hr>


<details><summary><b>Starting the server</b></summary>
<p>
  
```
# go to the server directory
$ cd server

# install dependencies
$ npm install

# run a production server
$ prestart:prod && npm run start:prod

# run a development server (localhost:3000)
$ npm run start:dev
```
</p>
</details>

</hr>


<details><summary><b>Building the Client</b></summary>
<p>
  
```
# go to the client directory
$ cd client

# install dependencies
$ npm install

# run a development server, livereload (localhost:4200)
$ npm run start

# or to run a server that can be accessed by mobile devices using Ionic DevApp
$ ionic serve --devapp

# or to run on android
$ ionic cordova run android

# or to run on ios (requires MacOS device)
$ ionic cordova run ios
```
</p>
</details>
</hr>

<details><summary><b>Change the server URL</b></summary>
<p>
  
Edit ```/client/src/environments/{environment.prod.ts|environment.ts}``` and change the server key to your url.

We recommend using an https scheme.
</p>
</details>

<details><summary><b>Environment Configuration</b></summary>
<p>
  
Development configuration can be made in a .env file. The easiest way to set it up is to copy-paste the .env.example file and rename it to .env.

In production, a .env file should not exist. The environment variables should be set as actual environment variables wherever your production server provides this functionality.

Example:
```
APP_NAME=Wildlife Drones
PORT=3000
SECRET=secretKey
TOKEN_EXPIRES=7d
RESERVE_NAME=Kruger National Park
CELL_SIZE=500
ADMIN_EMAIL=drbam301@gmail.com
DEFAULT_ADMIN_PASSWORD=password
DB_TYPE=postgres
DB_USER=postgres
DB_HOST=localhost
DB_PORT=5432
DB_PASS=password
DB_DATABASE=drones
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USERNAME=drbam301@gmail.com
MAIL_PASSWORD=shhhhhh
OTP_PATTERN=[a-z\d]{3}-[a-z\d]{3}
OTP_EXPIRES=120
OTP_ATTEMPTS=3
```

- APP_NAME - the name of the application that will be shown to the user in emails
- PORT - the port the server should listen on
- SECRET - a random string used as a private key for jwt tokens. This should be sufficiently long (e.g 256 or 512 characters) and random.
- RESERVE_NAME - the name of the reserve as per OpenStreetMaps
- CELL_SIZE - the size (width and height) of a cell in metres
- ADMIN_EMAIL - the default administrator email. This account can be used to create other accounts.
- DEFAULT_ADMIN_PASSWORD - the default administrator password - can be changed in future.
- DB_TYPE - database type. E.g. "postgres" or "mysql" or "sqlite"
- DB_USER - database username
- DB_HOST - database host. Use 127.0.0.1 over localhost to eliminate DNS overhead.
- DB_PORT - database port
- DB_PASS - database user password
- DB_DATABASE - name of the database
- MAIL_HOST - the SMTP mail host (e.g. smtp.gmail.com)
- MAIL_PORT - the mail server port (465 is recommended as TLS is always enabled)
- MAIL_USERNAME - the email address used to log into the mail server
- MAIL_PASSWORD - the password used to log into the mail server
- OTP_PATTERN - A regular expression pattern to generate a random one-time-pin from
- OTP_EXPIRES - How long (in seconds) an OTP lasts. This is also the time the user has to wait before login attempts reset.
- OTP_ATTEMPTS - The number of login attempts the user gets before being locked out until the one time pin expires.

</p>
</details>


## Contributing

<details><summary><b>Add features</b></summary>
  
Please follow our [coding standards](/Documentation/Demo4/CodingStandards_Demo4.pdf) and [testing policy](/Documentation/Demo4/Testing_policy_document_Demo4.pdf).

Create a pull request with your changes. Please include a justification for your changes, include a description of what the changes are and point to any changes made.
  
</details>

<details><summary><b>Submit bugs</b></summary>
  Use the GitHub issues feature to let us know about bugs.

  Please include the following:
  1. A summary of the bug
  2. Your environment (OS, database, etc.)
  3. Conditions to replicate the bug
  4. Expected behaviour
  5. Actual behaviour
</details>

<details><summary><b>Review the documentation</b></summary>
  Create pull requests or create issues to fix typos or add content to our documentation.
</details>

<details><summary><b>Features and suggestions</b></summary>
  Create an issue with a feature request tag.
  Give examples and include as many details as possible.
  Include justification for any new features or changes.
</details>


## Group Members
<img src="https://lh4.googleusercontent.com/sYkeIXRCdnU5gPxCxJOXc_I6xD2D_OMxqu9-eRN1WwPWEg5bAW_7SZ86O5U863usmgKeCJeqAwN-Ay0bMkrIqJnZelcAtLnpRAeiHbHnukEjuPdsahIV_iJfkl8ATyYRKPP_e5_N" width="600px" />

#### Matthew Evans (16262949) [GitHub Profile](https://github.com/EvansMatthew97), [CV](Documentation/CVS/Matthew.pdf), [LinkedIN](https://www.linkedin.com/in/matthew-evans-011a78191/)

<details><summary>Expand details</summary>
  
- __Interests__: Technology, astronomy, music, film, history
- __Skills__: JavaScript, TypeScript, Angular 2+, Ionic Framework, PHP, SQL, NodeJS, React, 64-bit assembly, Android Play Store deployment, web development, Adobe After Effects, Blender 3D, GIMP, web scraping
- __Previous work experience__:
  - Teaching Assistant for the CS Department, 2016
  - Teaching Assistant for IMY department, 2017
- __Attitudes__: Curious, passionate and positive towards the future of technology

</details>

#### Andreas Louw (15048366) [GitHub Profile](https://github.com/ASLouw), [CV](Documentation/CVS/Andreas.pdf), [LinkedIN](https://www.linkedin.com/in/andreas-louw-182a36175)

<details><summary>Expand details</summary>
  
- __Interests__: Programming, app development, metalwork and woodwork
- __Skills__: Java, Kotlin, PHP, C++, C#, JavaScript, Assembly (x64), App development, Web development, Database Management
- __Previous work experience__: None
- __Attitudes__: Diligent, honest, positive and a people person

</details>

#### Bryan Janse van Vuuren (16217498) [GitHub Profile](https://github.com/Viidas96), [CV](Documentation/CVS/Bryan.pdf), [LinkedIN](https://www.linkedin.com/in/bryan-janse-van-vuuren-451b8a191)

<details><summary>Expand details</summary>
  
- __Interests__: Gaming, programming, mobile application development and music
- __Skills__: Angular, Java, C#, JavaScript, Mobile App Devlopment, Database management and design, Web Devlopment
- __Previous work experience__: 
  - Mobile application design for Rage Software
  - Mobile game development
- __Attitudes__: Devoted, trusting, positive, punctual, work-oriented and willingness

</details>

#### Deane Roos (17057966) [GitHub Profile](https://github.com/BCybercell), [CV](Documentation/CVS/Deane.pdf), [LinkedIN](https://www.linkedin.com/in/deane-roos-a7a896143)

<details><summary>Expand details</summary>
  
- __Interests__: Virtual reality, gaming and artificial intelligence
- __Skills__: Java, C++, Assembly x64, Python
- __Previous work experience__:  ETA operations
- __Attitudes__: Hardworking, positive and dedicated

</details>

#### Reinhardt Eiselen (14043302) [GitHub Profile](https://github.com/EiselenR), [CV](Documentation/CVS/Reinhardt.pdf), [LinkedIN](https://www.linkedin.com/in/reinhardt-eiselen-0071a685)

<details><summary>Expand details</summary>
  
- __Interests__: Music ,the outdoors and technology
- __Skills__:  Java, C++ , JavaScript, Assembly (x86) and 64 bit, PHP, SQL, Android, Nodejs, Angular, Web development and App development
- __Previous work experience__: No formal work experience 
- __Attitudes__: Always up for a challenge, curious about the unkown and hardworking

</details> 
