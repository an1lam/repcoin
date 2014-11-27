# Repcoin
## The only market-based approach to reputation.

Repcoin is a platform to give credibility to the world's internet users. Search engines will bring me relevant content, but they will not bring me credible users. We need a universal system of credibility that can definitively show who knows what on the internet. Repcoin's marketplace will facilitate the creation of that data.
Prove yourself as a great investor by finding expert talent for various topics.
Establish an expert online presence by attracting investors for various topics.

**Repcoin will be available to select beta users by January 2, 2015. Email mritter123@gmail.com or stephenmalina@gmail.com for more information.**

## Stack
- Bootstrap frontend styling
- ReactJS frontend framework
- Express middeleware
- NodeJS backend
- MongoDB database
- Npm build system (migrating away from gulp)

## Codebase
**/api**
Contains all of our models and backend route logic

**/js**
Contains all of our frontend javascript (i.e. React components and frontend routes)

**server.js**
Main application entry-point (i.e node server.js)

## Build System
We are using [NPM](http://www.npmjs.org/) as our build system and package manager. To get our code
set up you will have to create a few directories before you run the build. You must create a
directory build, and within it add directories fonts, images, and css.

If this is your first time building our code, first run `npm run build-fonts` and `npm run
build-images`. Finaly run, ```./scripts/connect-git-hooks.sh``` to make sure you have our pre-push
and any other git hooks we've created. Then, you are set to start coding and rebuilding our code.

Every time you want to run the site, you should open two terminal tabs. In one, run
`npm start`. In the other, run `npm run watch`. This will watch all of your changes to the frontend
and continuously rebuild it.

TODO(Stephen) Add live reloading for the backend.

## Style
- Alphabetize React component imports
- Use javascript "===" instead of "=="
- Use two-space indents
- Start js files with "use strict" (allows jsxhint to work)
- Never include component lifecycle functions unless you need them
