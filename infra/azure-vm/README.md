Infra: Azure VM mínima para abbarrotes (Ubuntu 22.04 + Node.js 20)

Descripción
Este directorio contiene artefactos mínimos y no destructivos para preparar una máquina virtual Ubuntu 22.04 LTS adecuada para ejecutar la aplicación Node.js "abbarrotes" en modo de prueba.

Contenido
- cloud-init.yml: cloud-init mínimo para preparar Ubuntu 22.04 con:
  - un usuario no root `deployer` (añadido al grupo sudo; NO se concede NOPASSWD global),
  - Node.js 20.x (NodeSource),
  - npm (instalado junto con nodejs),
  - git,
  - directorios de aplicación (/var/www/abbarrotes y /var/www/abbarrotes/data) con permisos adecuados.
- install-node.sh: script manual, idempotente, para instalar Node.js 20.x, npm y git en Ubuntu 22.04. Diseñado para ejecutarse de forma segura por un operador.
- healthcheck.sh: comprueba localmente 127.0.0.1:3000/api/health y devuelve código de salida distinto de 0 si el servicio no responde con HTTP 200.

Restricciones y condiciones importantes
- GEMINI_API_KEY: no bloquea el arranque pero es necesaria para agentes que la requieran.
- POSTHOG_API_KEY, Google Sheets, OpenAI: opcionales para el arranque.
- FIREBASE: NO es opcional cuando NODE_ENV=production. Antes de ejecutar en producción, la VM debe disponer de la configuración/credenciales de Firebase apropiadas (provisión segura de secretos fuera de estos archivos).
- ./data: debe ser persistente y escribible. Los scripts crean /var/www/abbarrotes/data con permisos 770 y propiedad del usuario `deployer`, pero en producción debes montar/asegurar persistencia (disco gestionado, attach/mount).
- No exponer el puerto 3000 públicamente durante la prueba. Estos archivos no abren puertos ni configuran firewall.
- No contiene secretos. No agregar claves o tokens en estos archivos.

Qué NO hace
- No clona repositorios, no ejecuta npm install, npm run build ni inicia la aplicación.
- No instala ni configura PM2, Docker, Nginx, systemd personalizado, Terraform ni Azure CLI.
- No crea recursos en Azure; la VM debe crearse fuera y este cloud-init puede pasarse como custom data si lo deseas.
- No concede sudo sin contraseña: el usuario `deployer` se añade al grupo sudo pero no se configura NOPASSWD.

Flujo recomendado para revisión local sin commitear
1) Asegúrate de estar en la rama existente (NO crearla):
   git fetch origin
   git checkout azure-migration

2) Crear directorio y archivos localmente (copiar este contenido).

3) Hacer scripts ejecutables:
   chmod +x infra/azure-vm/install-node.sh infra/azure-vm/healthcheck.sh

4) Revisar diff sin commitear:
   git add -N infra/azure-vm/*   # intent-to-add (no staged content)
   git diff -- infra/azure-vm/
   # o si ya añadiste: git diff --staged

Revisión pendiente
- Verifica estas 4 plantillas y confirma por escrito la autorización explícita para crear/actualizar dichos archivos en la rama existente azure-migration del repo. No procederé sin tu autorización.
