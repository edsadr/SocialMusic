

SocialMusic - Aplicación en Meteor
==================================

Esta aplicación fue desarrollada para la reunión del mes de Marzo de 2013 del grupo de desarrolladores de JavaScript [MedellinJS](http://www.medellinjs.org/) , originalmente fue un ejemplo que permite reproducir una lista única de pistas desde el servicio de música Jamendo, consultando los 20 álbumes más populares del tag Rock, permitiendo a usuarios registrados el encolar pistas y solo el usuario administrador de la lista puede reproducirla.

Me gustaría que  con algo de colaboración se pudiera convertir en un proyecto un poco más serio y que sirva de aprendizaje del framework para el grupo. Esto se puede lograr con poco esfuerzo y luego publicarlo así como un aplicativo de Meteor en [MadeWithMeteor](http://madewith.meteor.com/) de parte del grupo de desarrolladores de MedellinJS.

Esto es lo que propongo para el aplicativo:

* Soporte para elegir el tipo de música utilizando los tags de Jamendo, permitiendo elegir al usuario diferentes géneros musicales
* Soporte para múltiples listas de reproducción, cada usuario puede crear y ser administrador de varias listas y nombrar más administradores para sus listas
* Segmentar usuarios conectados por lista de reproducción (similar al concepto de chatrooms)
* Soporte de i18n para que el servicio pueda ser usado también en inglés (inicialmente)
* Mejorar la arquitectura del aplicativo migrando a un modelo MVC hasta donde sea posible

Estaré pendiente del repositorio y de mi cuenta en Twitter [zenedsadr](https://twitter.com/zenedsadr) por si alguien esta interesado en participar en mi propuesta.

Instalación
-----------

Para tener el aplicativo funcionando debemos de tener Node.js instalado y luego instalar Meteor en Linux o Mac:
  
> curl https://install.meteor.com | /bin/sh

Si se va a trabajar en windows las instrucciones están en el [port de Meteor para Windows](http://win.meteor.com/)

Luego debemos tener instalado Meteorite:

> sudo npm install -g meteorite

Despues de esto se debe clonar el repositorio y luego ingresar al directorio y ejecutar:

> mrt

Esto genera la estructura de directorios requerida para que el aplicativo corra y lanzara el servidor en:

> http://localhost:3000
