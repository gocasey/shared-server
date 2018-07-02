# Shared Server

[![Build Status](https://travis-ci.org/taller2-2018-1-grupo2/shared-server.svg?branch=master)](https://travis-ci.org/taller2-2018-1-grupo2/shared-server)
[![Coverage Status](https://coveralls.io/repos/github/taller2-2018-1-grupo2/shared-server/badge.svg?branch=master)](https://coveralls.io/github/taller2-2018-1-grupo2/shared-server?branch=master)

## Setup

En una máquina con [Node.js](https://nodejs.org/en/) instalado.

1. Abrir una terminal y correr `npm i`.
1. Correr `npm start` para iniciar el servicio localmente.

## Comandos disponibles

* `npm run lint`: executes [ESLint](https://eslint.org/) in the project, configured with the [eslint-config-google](https://github.com/google/eslint-config-google) rules.(https://www.npmjs.com/package/eslint-config-airbnb) rules.
* `npm run db_init`: creates the needed tables for the first time on the postgres database.
* `npm test`: executes tests written using [Mocha](https://mochajs.org/).
* `npm run coverage`: executes tests and reports coverage, thanks to [nyc/Istambul](https://github.com/istanbuljs/nyc).
* `npm start`: starts the service in the specified port (by default `8080`).
* `npm run debug`: starts the service in debug mode.

## Instalación con Docker

> **Nota:** se necesita [Docker](https://www.docker.com/) instalado en la máquina para ejecutar estos pasos. Para ello, sigue estas instrucciones [en Mac](https://docs.docker.com/docker-for-mac/install/) o [en Windows](https://docs.docker.com/docker-for-windows/install/). Al finalizar la instalación, valida que todo funciona correctamente corriendo `docker --version`.

1. Abrir una terminal en el directorio base del proyecto.
1. Construye la imagen de docker con el siguiente comando: `docker build -t shared-server .`.
1. Genera y ejecuta un nuevo container con el comando `docker run -p 8080:8080 -d shared-server`. Copia el _container ID_ que será devuelto por el comando. Lo utilizarás en el paso siguiente
1. Una vez que el container esté siendo ejecutado, puedes ver los logs utilizando el comando `docker logs <container-id>`. Deberías ver algo similar a lo siguiente:

    ```bash
    ➜ docker logs 2d464bcaa2cf9538c890fa2bfb860c5210a4d6a7cb46a57d156620d2871b7054

    > shared-server@1.0.0 start /usr/src/app
    > node ./src/app.js

    Shared Server running on http://0.0.0.0:8080
    ```




