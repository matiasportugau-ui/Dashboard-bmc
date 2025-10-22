# Paquete de Implementación Global - Taller Digital v2.0

## Instrucciones

1. **Guardar**: Guarda esta página en tu computador (Ctrl+S o Cmd+S) como `Taller_Digital_v2.html`.
2. **Navegar**: Abre el archivo en tu navegador para visualizar todo el contenido del proyecto.
3. **Copiar e Importar**: Para cada archivo `.json`, usa el botón "Copiar" y luego, en tu n8n, crea un nuevo workflow y selecciona la opción **"Import from Clipboard"** para pegar el código.
4. **Consultar**: Usa los archivos de documentación (`.md`) como la base de conocimiento central para entender la arquitectura y los principios del proyecto.

## Estructura del Repositorio

- **/docs**: Contiene la documentación conceptual, los principios de diseño y las guías de mapeo. Estos archivos explican el "porqué" de nuestra arquitectura.
    - `1_GEMS_Architecture_and_Principles.md`: Describe la arquitectura GEMS, los escuadrones y la gobernanza.
    - `2_RCT-COE_to_n8n_Mapping_Guide.md`: Traduce el protocolo RCT-COE a la construcción práctica de workflows.
    - `3_Advanced_AI_Patterns.md`: Detalla las mejores prácticas extraídas de los ejemplos, como RAG y memoria conversacional.
- **/n8n**: Contiene los workflows de n8n listos para importar. Están separados por su función dentro del ecosistema.
    - **/orchestrators**: Workflows de alto nivel que gestionan el flujo de trabajo.
    - **/gems**: Sub-workflows que actúan como agentes especializados (GEMS).
    - **/utilities**: Sub-workflows de soporte, como el manejador de errores y el validador.
    - **/knowledge_indexing**: Workflows dedicados a la alimentación y el entrenamiento de los agentes de conocimiento.

## Cómo Usar

1. **Documentación**: Lee los archivos en la sección `/docs` para entender los principios de diseño.
2. **Importar Workflows**:
    - Navega a la sección `/n8n`.
    - Copia el contenido de un archivo `.json` usando el botón "Copiar".
    - En tu instancia de n8n, crea un nuevo workflow y usa la opción "Import from Clipboard".
    - Sigue las instrucciones de configuración (conectar credenciales, enlazar sub-workflows por su ID) que se detallan en las conversaciones donde se generaron.

Este repositorio es la "fuente de la verdad" para nuestra arquitectura de automatización.

## Arquitectura GEMS y Principios de Orquestación

Este documento define la arquitectura de nuestro ecosistema de inteligencia autónoma, basada en "Gems" (agentes).

### Principios Fundamentales

1. **Modularidad (Escuadrones)**: Los GEMS se agrupan en escuadrones especializados con misiones claras (ej. Génesis, PMO). En n8n, un Gem es un sub-workflow y un Escuadrón es un workflow orquestador que llama a esos sub-workflows.
2. **Encadenamiento (Pipelines)**: Los escuadrones operan en cadenas lógicas. El output de un Gem es el input del siguiente. Esto se implementa con la conexión secuencial de nodos `Execute Workflow`.
3. **Genoma del Gem (RCT-COE v2.0)**: Cada Gem se construye sobre la plantilla estandarizada Rol-Contexto-Tarea-Condiciones-Output-Evolución para garantizar fiabilidad y eficiencia.
4. **Gobernanza Central**: El **Orquestador Principal** y el **CONTEXTO_GLOBAL.json** actúan como el cerebro del sistema. El Orquestador Principal delega tareas a los Orquestadores de Escuadrón. El CONTEXTO_GLOBAL se define en un nodo `Set` al inicio y se pasa a través de toda la ejecución.
5. **Orquestación Jerárquica**: Un Orquestador Principal de alto nivel delega tareas a Orquestadores de Escuadrón especializados. Esto mantiene el flujo principal limpio y estratégico.
6. **Auto-Validación**: Los GEMS que generan artefactos (como blueprints o código) deben ser validados inmediatamente por un Gem especializado (`Gem-Validator`) como parte del pipeline.
7. **Ejecución Local (Local-First)**: Se prioriza el uso de servicios auto-alojados como IA local con `Ollama` para maximizar la seguridad, reducir costos y aumentar la autonomía.
8. **Artefacto Atómico**: Cada workflow exportado como JSON debe ser una unidad completa y funcional, lista para ser importada directamente en n8n.

## Guía de Mapeo: Del Protocolo RCT-COE a Workflows de n8n

Este documento es la guía oficial para traducir los principios del protocolo **Rol-Contexto-Tarea-Condiciones-Output-Ejemplos (RCT-COE)** al desarrollo de workflows en n8n. Su propósito es estandarizar la construcción de automatizaciones, haciéndolas más legibles, mantenibles y alineadas a la metodología de la Prompt Library.

### **[R] Rol → Credenciales y Nodos Específicos**

El **Rol** define quién o qué ejecuta la acción. En n8n, esto se traduce directamente en:

* **Credenciales**: ¿Qué cuenta se está utilizando? Un nodo de Gmail que actúa como "Asistente de Soporte" debe usar las credenciales `soporte@empresa.com`. Las credenciales definen la identidad y los permisos del "Rol".
* **Nodos de Servicio**: La elección del nodo define la capacidad del rol. Si el rol es "Analista de Datos", sus herramientas serán nodos como `Google Sheets`, `PostgreSQL`, `Airtable`, y `OpenAI` para análisis.

**Implementación**: Antes de empezar, asegúrate de que todas las credenciales necesarias estén configuradas en n8n. Nombra tus credenciales de forma clara para que reflejen el rol que desempeñan (ej. "Slack_Admin_Bot" vs "Slack_User_Notifications").

### **[C] Contexto → Nodos `Set` y `Merge` de Preparación**

El **Contexto** es la información inicial que el workflow necesita para operar. En n8n, el contexto se establece al principio del flujo:

* **Nodo `Set` Inicial**: Utiliza un nodo `Set` justo después del disparador para definir variables clave y constantes que se usarán a lo largo del workflow. Por ejemplo, `URLs de APIs`, `IDs de Hojas de Cálculo`, `Nombres de Canales de Slack`. Esto centraliza la configuración.
* **Nodos `Merge` y `HTTP Request`**: Si el contexto debe ser enriquecido con información de otras fuentes (ej. obtener datos de un cliente desde un CRM antes de procesar un pedido), usa nodos `HTTP Request` o de bases de datos para recopilar esta información y un nodo `Merge` para unirla al flujo de datos principal.

### **[T] Tarea → El Flujo Principal de Nodos de Acción**

La **Tarea** es la secuencia de acciones que el workflow debe realizar. Es el cuerpo principal de tu automatización.

* **Secuencia Lógica**: Cada nodo de acción (ej. `Salesforce: Create Contact`, `Google Docs: Create File`, `Slack: Send Message`) representa un paso de la tarea. La conexión entre ellos define el orden de ejecución.
* **Modularidad con Sub-Workflows**: Si una tarea es muy compleja (ej. "Procesar una factura"), divídela en sub-tareas y crea **sub-workflows** para cada una ("Extraer datos del PDF", "Validar montos", "Registrar en contabilidad"). El workflow principal se convierte en un orquestador que llama a estos módulos, siguiendo tu principio de agentes.

### **[C] Condiciones → Nodos `IF` y `Switch`**

Las **Condiciones** son las reglas de negocio y las restricciones que gobiernan la ejecución. En n8n, se implementan con nodos de lógica:

* **Nodo `IF`**: Para decisiones binarias. Ejemplo: `IF` el `monto_total` es `mayor que 1000`, entonces requiere aprobación.
* **Nodo `Switch`**: Para múltiples rutas basadas en un solo valor. Ejemplo: `Switch` en el campo `categoría_producto` para aplicar diferentes márgenes de ganancia (`paneles`, `chapas`, `tornillos`).
* **Manejo de Errores**: Una condición implícita es "si algo falla". En la configuración de cada nodo, usa la opción de "Continue (using error output)" para crear una rama que maneje los errores de forma controlada, llamando a un sub-workflow de notificación.

### **[O] Output → Nodos Finales y `Respond to Webhook`**

El **Output** es el resultado final y observable de la automatización.

* **Nodos de Destino**: Son los últimos nodos de una rama exitosa: `Google Sheets: Append Row`, `Slack: Send Message`, `Send Email`, etc.
* **Nodo `Respond to Webhook`**: Si tu workflow fue iniciado por un webhook síncrono que espera una respuesta, este nodo es crucial para devolver un resultado (ej. un JSON con `{"status": "éxito"}`).
* **Nodo `Set` Final**: Es una buena práctica usar un nodo `Set` al final para limpiar y estructurar los datos de salida en un formato predecible, eliminando información innecesaria de nodos intermedios.

### **[E] Ejemplos → Datos de Prueba en el Disparador**

Los **Ejemplos** son cruciales para probar el workflow. En n8n, esto se gestiona con datos de prueba:

* **"Pin Data"**: Después de ejecutar un nodo una vez, puedes "pinear" (fijar) su salida. Esto te permite desarrollar el resto del workflow usando datos reales como ejemplo, sin tener que ejecutar el flujo completo cada vez.
* **"Mock Data" en Disparadores**: Para disparadores como Webhooks, puedes pegar un JSON de ejemplo directamente en el nodo para simular una ejecución y desarrollar el flujo sin necesidad de un evento real.

## Patrones de IA Avanzados para n8n

Este documento resume las mejores prácticas extraídas del análisis de workflows de la comunidad para construir agentes de IA robustos.

1. **Arquitectura RAG (Retrieval-Augmented Generation)**:
    - **Principio**: Separar la base de conocimiento del agente de razonamiento.
    - **Implementación**:
        1. **Workflow de Indexación**: Un flujo que se ejecuta por separado para leer documentos (`Read File`), dividirlos en fragmentos (`Text Splitter`), generar vectores (`Embeddings`) y almacenarlos en una base de datos vectorial (`Vector Store: Insert`).
        2. **Workflow de Consulta**: El agente de IA recibe una pregunta. En lugar de responder directamente, se le da una "herramienta" (`Vector Store: Retrieve as Tool`) para buscar fragmentos relevantes en la base de datos vectorial. La pregunta del usuario más los fragmentos recuperados se envían al modelo de lenguaje para generar la respuesta final.

2. **Procesamiento de Entradas Multi-Modales**:
    - **Principio**: Un único punto de entrada debe poder manejar diferentes tipos de datos (texto, imagen, audio, etc.).
    - **Implementación**: Usar un nodo `Switch` inmediatamente después del disparador (ej. `WhatsApp Trigger`) para enrutar el flujo según el tipo de mensaje (`message.type`). Cada rama procesa el dato (ej. transcribe audio, analiza imagen) antes de unificar el flujo hacia el agente principal con un prompt estandarizado.

3. **Memoria de Conversación Persistente**:
    - **Principio**: El agente debe recordar interacciones pasadas con el mismo usuario.
    - **Implementación**: Utilizar un nodo de Memoria (ej. `Memory Buffer Window` o `Postgres Chat Memory`) y configurarlo con un `Session Key` único por usuario (ej. `={{ $json.contacts[0].wa_id }}`). Esto asegura que cada conversación sea contextual.

4. **Sanitización de Entradas y Salidas**:
    - **Principio**: La data que entra y sale de la IA debe ser controlada.
    - **Implementación**:
        - **Pre-procesamiento**: Usar un nodo `Set` o `Code` antes del agente de IA para formatear el prompt final, añadiendo contexto como la fecha actual o instrucciones de formato, asegurando que la IA reciba una entrada consistente.
        - **Post-procesamiento**: Usar un nodo `Code` después de la respuesta de la IA para limpiar el texto, eliminar artefactos no deseados (como `*` de Markdown) o re-formatear URLs antes de enviarlas al usuario.
