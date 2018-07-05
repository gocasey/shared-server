# Manual de Administrador - Shared Server
---

### Generalidades

El Shared Server es un servidor que provee servicios de registro/autenticación y de gestión de archivos para el Stories App Server y la Stories Admin UI.

Fue desarrollado en NodeJs utilizando el framework Express.

## Requisitos

### Para instalación local

#### Instalación local (sin Docker)
* npm
* NodeJS 8

Por lo general, npm se incluye dentro de la instalación misma de Node. Se recomienda utilizar una versión de Node 8 LTS, por ejemplo 8.9.0.

#### Instalación local (con Docker)
* Docker (para Mac, Windows o Linux).

### Para instalación remota (Deploy en Heroku)

El Shared Server ya se encuentra configurado con la herramienta de integración continua TravisCI, la cual realiza deploys automáticos a dos aplicaciones de Heroku (ambientes de staging y producción) cada vez que se ingresan cambios en el branch master.

En el caso de que se quiera agregar una nueva aplicación para deploy, los pasos a seguir serían los siguientes.

* Registrarse previamente como usuario en la plataforma Heroku (PaaS)
* Registrarse en algun servicio de DBaaS para PostgreSQL, por ejemplo, el Shared Server utiliza las versión gratuita que provee Heroku.

## Instalación y Configuración

Como primera medida para la instalación de esta aplicación, habrá que clonar el repositorio en nuestra máquina utilizando el siguiente comando:

```
$ git clone https://github.com/taller2-2018-1-grupo2/shared-server.git
```
> **Nota:** Vale aclarar que para la clonación de este repositorio habrá que tener instalado Git. Podemos encontrar instrucciones sobre como hacer esto para los distintos sistemas operativos en [este](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) link.

### Instalación local

>**Nota:** Una instalación de este tipo puede ser útil para realizar probar nuevas funcionalidades o efectuar cambios en el Shared Server sin afectar al ambiente de producción que usan nuestros usuarios.

#### Instalación de PostgreSQL

No es necesaria la instalación de PostgreSQL ya que utilizamos bases de datos remotas en ambos ambientes (staging y producción).

#### Instalación local (sin Docker)
---
>**Nota:** Las siguientes instrucciones son validas para sistemas UNIX (Linux/macOS). Para sistemas Windows, utilizar Docker (instrucciones en 2.1.2. Instalación local (con Docker))

Para la instalación local sin utilizar Docker, se deberán seguir los siguientes pasos:
1. Abrir una terminal en el directorio base del proyecto.
2. Instalar las dependencias mediante el comando
    ```
    $ npm install
    ```
3. Ejecutar la aplicación mediante el comando
    ```
    $ npm run debug
    ```

4. Para enviar un request a la aplicación, utiliza la direccion: `http://0.0.0.0:8080/api/` como se indica en la sección ***Uso de la Aplicación*** a continuación.

#### Instalación local (con Docker)
---
> **Nota:** como se aclara en los requisitos, se necesita [Docker](https://www.docker.com/) instalado en la máquina para ejecutar estos pasos. Para ello, sigue estas instrucciones [en Mac](https://docs.docker.com/docker-for-mac/install/) o [en Windows](https://docs.docker.com/docker-for-windows/install/). Al finalizar la instalación, valida que todo funciona correctamente corriendo `docker --version`.

Para la instalación local utilizando Docker, se deberán seguir los siguientes pasos:

1. Abrir una terminal en el directorio base del proyecto
2. Construye la imagen de docker con el siguiente comando: `docker build -t shared-server .`.
3. Genera y ejecuta un nuevo container con el comando `docker run -p 8080:8080 -d shared-server`. Copia el _container ID_ que será devuelto por el comando. Lo utilizarás en el paso siguiente
4. Una vez que el container esté siendo ejecutado, puedes ver los logs utilizando el comando `docker logs <container-id>`. Deberías ver algo similar a lo siguiente:
   ```bash
   ➜ docker logs 2d464bcaa2cf9538c890fa2bfb860c5210a4d6a7cb46a57d156620d2871b7054

   > shared-server@1.0.0 start /usr/src/app
   > node ./src/app.js

   Shared Server running on http://0.0.0.0:8080
   ```
5. Para enviar un request a la aplicación, utiliza la direccion: `http://0.0.0.0:8080/api` como se indica en la sección ***Uso de la Aplicación*** a continuación.

### Configuración de variables de entorno

Las variables de entorno necesarias para correr el Shared Server con éxito, las mismas se encuentran ya definidas y seteadas en los respectivos ambientes de staging y producción (definidas como variables de entorno en Heroku).

Además, cada ambiente posee un archivo de configuración específico dentro de la carpeta config, donde se detallan las variables de configuración de cada ambiente respectivamente.

Cualquier instalación local, ya se con o sin Docker, se configurará por defecto en modo staging, de forma tal de no afectar el ambiente productivo.

## Uso de la Aplicación

Para el uso del Shared Server, cabe recordar que su **API** (Application Programming Interface, o Interfaz de Programación de Interfaces, en castellano) será consumido principalmente por el Stories App Server y la Stories Admin UI, como se menciono previamente en este documento.

Aun así, el mismo puede consumirse también utilizando algún entorno de desarrollo de APIs como Postman, configurando el endpoint que se desee utilizar segun la [especificación](https://github.com/taller2-2018-1-grupo2/shared-server/blob/master/shared_server_swagger.yaml) del API REST encontrada en este mismo repositorio.

