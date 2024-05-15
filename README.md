# Saboteur Web Version

A webversion of the board game Saboteur, project for the Software Engineering Lab FS24 at UZH. <br>
Our focus was to implement something that would exite us, leading to the creation of a simple web version of a fun board game we had played together

Official game rules: https://world-of-board-games.com.sg/docs/Saboteur-Amigo.pdf

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Make sure you have the following installed:

-   npm

### Installing

1. Clone the repository
2. Navigate to project directory and install all dependencies: npm install
3. Run the client locally: npm run dev

## Deployment

Add additional notes about how to deploy this on a live system

## Technologies used

### Server

-   [Spring Boot](https://spring.io/projects/spring-boot) - Framework for building Java-based web applications
-   [Gradle](https://gradle.org/) - Build automation
-   [JUnit](https://junit.org/junit5/) - Testing framework for Java
-   [SonarQube](https://www.sonarqube.org/) - Code quality and security analysis tool
-   [JaCoCo](https://www.jacoco.org/jacoco/) - Java Code Coverage Library

### Client

-   [npm](https://www.npmjs.com/) - Package manager
-   [React](https://reactjs.org/) - JavaScript library for building user interfaces
-   [Phaser](https://phaser.io/) - The Game Framework used
-   [DiceBear](https://www.dicebear.com/) - Avatar library

## Main user flow

The user is directed to title screen on entry. If joining is accepted, the scene transitions to lobbyscreen, where the user can copy link to game session, check out tutorial, quit lobby, or start game. A random name and avatar is generated automatically for each player. Once every player has joined, any player can start the game. Inside the game, players are assigned a role and they see other players information as well as own playable tiles displayed on the screen. They take turn to place a tile (drag a tile to a valid spot), discard a tile(click on trash icon), or play an action card (eye). The session continues to stay in game state until a winning/ losing condition is reached. Then the players are ported according to their role to a victory scene where gold rains, or to a losing scene where coal pours down. Clicking on "quit" button will redirect players to title screen where they can start a new game. The user flow loops from here on.

## High-level components

In the client repository, the three key components are Manager, Scenes and Entity. The entry point and main game flow are handled in the core folder. For usability and extendability, we also defined custom types, constants, and helper functions that are stored in several subfolders and play an important role in our project.

Our project uses event-driven architecture patterns to communicate game state changes to different components. The Manager component interacts with the server. It emits event on change of Entity data they keep track of, Scenes that listen to these events will update information and behave accordingly.

### Manager

The Manager layer is responsible for fetching session-related information from the server. On a constant time interval, the [GeneralManager](https://github.com/sopra-fs24-group-26/client/blob/master/src/managers/GeneralManager.ts) sends ping request and receives a data package with all the shared information. The data is then propagated to sub-managers, each stores and updates the information of one kind of entity.

The [AdjacencyManager](https://github.com/sopra-fs24-group-26/client/blob/master/src/managers/AdjacencyManager.ts) handles the game logic. It checks the validity of a tile placement action.

### Scene

Our game mainly consists of title screen, lobby screen, game screen and end screen. [Each screen](https://github.com/sopra-fs24-group-26/client/tree/master/src/scenes) is a scene. The title screen is the entry scene. Players wait in the lobby screen for the game to start. Once inside the game screen, the client displays the game state, co-player information and available tiles together with game UI screen. As soon as game ends, the user is ported to the end screen. Given that the browser holds valid player information, the user will be ported to the correct scene whenever the user reenters the game.

### Entity

Real-world objects of the board game Saboteur are modeled as the following [Entities](https://github.com/sopra-fs24-group-26/client/tree/master/src/entities) in our project: a Player entity represents a player, a Session models a game and a Tile corresponds to a playing card. When a user clicks on "create Session" on title screen, a session entity and player entity are created. Upon new players joining the session, more player objects are created. Click on "start" in lobby screen triggers the game setup, the client instantiates a number of tiles for the given player count and sorts them on a shared seed. Whenever a tile is played, it's information is sent to server for update and share the information with every other player.

## Roadmap - Ideas for future implementations

-   Make personalizable Avatar creation
-   Add a timer to a players turn
-   Add chat to game
-   Add animations/more particles

## Pattern

**Issue:** "Userstory: Issue Summary" <br>
**Branch:** "Issuenumber-issue-description" <br>
**Commit:** "Issuenumber: Commit message" <br>
**PR:** "Userstory: PR/Issue description" <br>

## Workflow

1. Create Userstories
2. Create architecture through in person meeting.
3. Create issues based on userstories, connecting them in development tasks.
4. Assign issues to members.
5. Members create branches and commit changes.
6. Members open pull requests which the others review.
7. When merged, issue gets closed.

## Formatting

-   Generally good structuring in folders (for example for all DTOs)
-   Generally small functions and classes
-   For TS: Prettier formatting
-   For Java: still to find out

## Authors

-   **Patric Brandao** - [Patertuck](https://github.com/Patertuck)
-   **Noah Bussinger** - [C0DECYCLE](https://github.com/C0DECYCLE)
-   **Leon Braga** - [Twhining](https://github.com/Twhining)
-   **Ting-Chun Huang** - [paul891112](https://github.com/paul891112)
-   **Roxane Jaecklin** - [Croxsy](https://github.com/Croxsy)

See also the list of [contributors](https://github.com/sopra-fs24-group-26/server/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

We thank the team of the Sopra FS24 modul for giving us the opportunity to freely work on a project.
