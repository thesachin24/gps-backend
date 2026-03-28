# Stock

Mongo + Express server + Docker.

## Pre requirements

* MongoDB - if not using docker
* docker & docker-compose - if using docker

## Installation

# npm uninstall -g babel-cli babel-node

# npm install @babel/node -g

* `npm i`
* create your .env file. Example is in .env.example.

## Running

`docker-compose up --build` - To use the docker image

or

`npm start` - running with locally installed mongodb and autoreload with nodemon.

* don't forget to change DB_HOST=localhost inside .env file when using local mongoDb installation.

## Scripts

* `npm start` - starts server for local development. Only used if not using docker.

## Tips

* don't forget to add any new env variables to the .env file
* * don't forget to change DB_HOST=localhost inside .env file when using local mongoDb installation.
* If you've installed new npm plugins, do:

  1.  `docker-compose stop node`
  2.  `docker-compose build node`
  3.  `docker-compose up -d --no-recreate node`

  or

  You could just `npm install` any new packages inside the node container itself.

  1.  `docker-compose exec node bash`
  2.  `npm install <packageName>`inside bash.
