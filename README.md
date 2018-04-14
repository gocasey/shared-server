# Shared Server

[![Build Status](https://travis-ci.com/taller2-2018-1-grupo2/shared-server.svg?branch=master)](https://travis-ci.com/gocasey/shared-server)

## Setup

1. Open a terminal and run `npm i`.
1. Run `npm start` to start the service locally.

## Available commands

* `npm run lint`: executes [ESLint](https://eslint.org/) in the project, configured with the [eslint-config-google](https://github.com/google/eslint-config-google) rules.(https://www.npmjs.com/package/eslint-config-airbnb) rules.
* `npm test`: executes tests written using [Mocha](https://mochajs.org/).
* `npm run coverage`: executes tests and reports coverage, thanks to [nyc/Istambul](https://github.com/istanbuljs/nyc).
* `npm start`: starts the service in the specified port (by default `8080`). See the [config file](./config/default.js) for more information.
* `npm run debug`: starts the service in debug mode.

## Instructions to run the app using Docker

> **Note:** You need [Docker]() installed in your machine to execute these steps. For this, **install Docker in your machine**(see [instructions for Mac](https://docs.docker.com/docker-for-mac/install/) and [instructions for Windows](https://docs.docker.com/docker-for-windows/install/)). Make sure `docker --version` works before going any further.

1. Open a terminal in the root path of the project.
1. Build the docker image by running `docker build -t shared-server .`.
1. Now, generate a new container by running: `docker run -p 8080:8080 -d shared-server`. Copy the container ID returned by the CLI, you will use it in th next step.
1. Check the logs in the container via `docker logs <container-id>`. You should something similar to the following:

    ```bash
    ➜ docker logs 2d464bcaa2cf9538c890fa2bfb860c5210a4d6a7cb46a57d156620d2871b7054

    > shared-server@1.0.0 start /usr/src/app
    > node ./src/app.js

    Shared Server running on http://0.0.0.0:8080
    ```




