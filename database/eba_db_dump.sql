/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.20-13.0.2-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: eba_db
-- ------------------------------------------------------
-- Server version	13.0.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `asistente_conversaciones`
--

DROP TABLE IF EXISTS `asistente_conversaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `asistente_conversaciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL DEFAULT 'Nueva conversación',
  `creado_en` timestamp NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_conv_usuario_actualizado` (`usuario_id`,`actualizado_en`),
  CONSTRAINT `fk_asist_conv_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asistente_conversaciones`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `asistente_conversaciones` WRITE;
/*!40000 ALTER TABLE `asistente_conversaciones` DISABLE KEYS */;
INSERT INTO `asistente_conversaciones` (`id`, `usuario_id`, `titulo`, `creado_en`, `actualizado_en`) VALUES (8,1,'¿Cuáles son las cinco libertades del bienestar animal y qué','2026-11-08 22:38:48','2026-11-08 22:38:48'),
(10,1,'¿Cuáles son las cinco libertades del bienestar animal y qué','2026-11-08 23:27:32','2026-11-08 23:27:32'),
(12,1,'¿Qué predios tengo autorizados para consultar?','2026-11-08 23:41:08','2026-11-08 23:41:45'),
(13,1,'Explícame las 5 libertades y sus pesos','2026-11-08 23:42:52','2026-11-08 23:43:56'),
(16,1,'hola','2026-11-08 23:53:30','2026-11-08 23:54:19'),
(43,1,'Analiza oportunidades de mejora en mi última evaluación','2026-11-09 01:51:26','2026-11-09 01:51:33');
/*!40000 ALTER TABLE `asistente_conversaciones` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `asistente_mensajes`
--

DROP TABLE IF EXISTS `asistente_mensajes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `asistente_mensajes` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `conversacion_id` int(11) NOT NULL,
  `rol` enum('user','assistant','system') NOT NULL,
  `contenido` text NOT NULL,
  `creado_en` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_msg_conv_creado` (`conversacion_id`,`creado_en`),
  CONSTRAINT `fk_asist_msg_conv` FOREIGN KEY (`conversacion_id`) REFERENCES `asistente_conversaciones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=134 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asistente_mensajes`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `asistente_mensajes` WRITE;
/*!40000 ALTER TABLE `asistente_mensajes` DISABLE KEYS */;
INSERT INTO `asistente_mensajes` (`id`, `conversacion_id`, `rol`, `contenido`, `creado_en`) VALUES (5,12,'user','¿Qué predios tengo autorizados para consultar?','2026-11-08 23:41:11'),
(6,12,'assistant','Actualmente tienes autorizados los siguientes predios en el sistema EBA:\n\n1. **Granja Caprina El Roble**\n   - **ID:** 3\n   - **Especie:** Caprino\n   - **Sistema Productivo:** Intensivo\n   - **Municipio:** Villeta\n   - **Número de animales:** 45\n\n2. **Hato Los Alpes**\n   - **ID:** 2\n   - **Especie:** Ovino (Ovino de lana: Sí)\n   - **Sistema Productivo:** Semi-intensivo\n   - **Municipio:** Tunja\n   - **Número de animales:** 85\n\nTu rol actual en el sistema es **ADMIN**. Si necesitas consultar evaluaciones u otros detalles de alguno de estos predios, dime con gusto y te ayudaré.','2026-11-08 23:41:11'),
(7,12,'user','Analiza las oportunidades de mejora de mi última evaluación','2026-11-08 23:41:45'),
(8,12,'assistant','Con base en la información oficial de tu última evaluación cerrada (**ID 17**, realizada el **08/11/2026** en el predio **Granja Caprina El Roble**), aquí tienes el análisis de oportunidades de mejora:\n\n### 1. Resumen de la Evaluación\n* **Predio:** Granja Caprina El Roble (Caprino - Intensivo, Villeta)\n* **Puntaje Total:** 98.5 / 100\n* **Clasificación Oficial:** **EXCELENTE BIENESTAR**\n* **Estado de los indicadores:** \n  * Total de indicadores evaluados: 34\n  * Óptimos (100 pts): 33\n  * Medios/Aceptables (55 pts): 1\n  * Críticos o bajos (0-20 pts): 0\n\n---\n\n### 2. Análisis por Libertades (De la más débil a la más fuerte)\n1. **Libertad de hambre y sed (Peso: 20%):** Puntaje de **92.5** (Es la libertad con menor puntaje en esta evaluación).\n2. **Libertad de incomodidad (Peso: 20%):** Puntaje de **100**.\n3. **Libertad de dolor, lesión y enfermedad (Peso: 35%):** Puntaje de **100**.\n4. **Libertad de miedo y angustia (Peso: 15%):** Puntaje de **100**.\n5. **Libertad de expresar comportamiento normal (Peso: 10%):** Puntaje de **100**.\n\n---\n\n### 3. Oportunidad de Mejora Identificada\nEl sistema ha detectado un único aspecto clasificado en nivel aceptable (55 puntos) sobre el cual se puede enfocar el plan de mejora:\n\n* **Libertad:** Libertad de hambre y sed\n* **Indicador:** Disponibilidad de agua potable\n* **Criterio Actual:** *Disponible agua la mayor parte del tiempo, con algunas restricciones.* (Calificación: 55)\n* **Meta / Criterio Óptimo (100):** *Disponible agua limpia y permanente en todo momento.*\n\n**Recomendación general:** \nRevisar los puntos de suministro, bebederos y la frecuencia de llenado en el sistema intensivo para asegurar que el agua esté disponible de manera permanente y sin restricciones para todos los animales, lo que permitirá alcanzar el puntaje óptimo (100) en esta libertad.','2026-11-08 23:41:45'),
(9,13,'user','Explícame las 5 libertades y sus pesos','2026-11-08 23:42:57'),
(10,13,'assistant','En el sistema EBA del ICA para la evaluación del bienestar animal en ovinos y caprinos, las **5 libertades** constituyen el marco fundamental para evaluar las condiciones de manejo, sanidad, alojamiento y comportamiento de los animales. \n\nCada libertad tiene una ponderación específica dentro del cálculo de la evaluación oficial (que suma un total del 100% o 1.0):\n\n---\n\n### 1. Libertad de hambre y sed\n* **Peso:** **20%** ($0.20$)\n* **Descripción:** Garantiza que los animales tengan acceso permanente a agua potable limpia y fresca, así como a una alimentación y nutrición adecuadas para mantener su salud, vigor y una condición corporal óptima.\n* **Indicadores asociados (ejemplos):** Disponibilidad de agua potable, disponibilidad de alimento, condición corporal adecuada, acceso a pastoreo o forraje, calidad del agua, suplementación mineral y frecuencia de suministro de agua.\n\n### 2. Libertad de incomodidad\n* **Peso:** **20%** ($0.20$)\n* **Descripción:** Asegura que los animales dispongan de un entorno físico apropiado que incluya refugio contra condiciones climáticas adversas, áreas de descanso limpias, secas y cómodas, así como suficiente espacio y ventilación.\n* **Indicadores asociados (ejemplos):** Refugio y protección contra el clima, espacio y densidad de animales, superficie de descanso limpia y seca, ventilación y temperatura, protección contra temperaturas extremas, sombra en potreros, camas o áreas de descanso y esquila/cuidado de la lana.\n\n### 3. Libertad de dolor, lesión y enfermedad\n* **Peso:** **35%** (Es la libertad con mayor peso debido a su impacto directo en la salud y el bienestar)\n* **Descripción:** Busca prevenir, diagnosticar y tratar oportunamente cualquier enfermedad, lesión o dolor. Incluye programas sanitarios preventivos, control de parásitos, vacunación, higiene y prácticas de manejo cuidadosas.\n* **Indicadores asociados (ejemplos):** Prevención y control de enfermedades, atención veterinaria oportuna, ausencia de lesiones visibles, control de parásitos internos y externos, poda de pezuñas, métodos de contención adecuados, vacunación al día, aislamiento de animales enfermos, registros médicos, control de vectores e higiene de instalaciones.\n\n### 4. Libertad de expresar comportamiento normal\n* **Peso:** **10%** ($0.10$)\n* **Descripción:** Permite a los animales manifestar sus comportamientos naturales propios de su especie (como socializar, pastorear, moverse libremente y ejercitarse), proporcionando espacio suficiente y un ambiente estimulante.\n* **Indicadores asociados (ejemplos):** Oportunidad de socializar con otros animales, espacio para moverse y ejercitarse, comportamiento reproductivo natural, acceso al exterior, oportunidad de pastoreo natural y enriquecimiento ambiental.\n\n### 5. Libertad de miedo y angustia\n* **Peso:** **15%** ($0.15$)\n* **Descripción:** Asegura que las condiciones de manejo y el entorno eviten el sufrimiento mental, el estrés innecesario, el miedo o la angustia, promoviendo un trato tranquilo y buenas prácticas por parte de los operarios.\n* **Indicadores asociados (ejemplos):** Manejo tranquilo y sin miedo, instalaciones seguras sin objetos peligrosos, separación adecuada de animales agresivos, control de ruidos y estímulos excesivos, transporte sin estrés, evitar aglomeraciones innecesarias y capacitación del personal en bienestar.\n\n---\n\n### Criterios de calificación\nCada uno de los **39 indicadores** oficiales distribuidos en estas libertades se califica de manera estandarizada según','2026-11-08 23:42:57'),
(11,13,'user','Qué predios tengo autorizados para consultar','2026-11-08 23:43:27'),
(12,13,'assistant','Actualmente tienes autorización (con rol **ADMIN**) para consultar los siguientes predios en el sistema EBA:\n\n1. **Granja Caprina El Roble**\n   * **ID:** 3\n   * **Especie:** Caprino\n   * **Municipio:** Villeta\n   * **Sistema productivo:** Intensivo\n   * **Número de animales:** 45\n\n2. **Hato Los Alpes**\n   * **ID:** 2\n   * **Especie:** Ovino (Ovino de lana: Sí)\n   * **Municipio:** Tunja\n   * **Sistema productivo:** Semi-intensivo\n   * **Número de animales:** 85\n\nSi deseas consultar evaluaciones, resultados oficiales u oportunidades de mejora para alguno de estos predios, indícamelo y con gusto te ayudaré.','2026-11-08 23:43:27'),
(13,13,'user','cual es el animal mas inteligente del mundo ?','2026-11-08 23:43:56'),
(14,13,'assistant','Fuera del ámbito del bienestar animal ovino y caprino y del sistema EBA del ICA, la respuesta general en el reino animal suele apuntar a los **chimpancés** y otros grandes simios (como orangutanes y bonobos) en términos de uso de herramientas y resolución compleja de problemas, o a los **delfines** y **elefantes** por su alta inteligencia social y autoconciencia. Entre las aves, los **córvidos** (como cuervos y urracas) destacan notablemente por su capacidad de razonamiento y fabricación de herramientas.\n\nVolviendo a nuestra área de especialización, en el contexto de los ovinos y caprinos, las **cabras** (caprinos) son animales extremadamente curiosos, ágiles para resolver problemas y con una gran capacidad de aprendizaje social y memoria a largo plazo. \n\nSi te refieres al sistema EBA o necesitas revisar información sobre las evaluaciones, los puntajes o las 5 libertades de los predios autorizados (**Granja Caprina El Roble** o **Hato Los Alpes**), dime con confianza cómo te puedo ayudar.','2026-11-08 23:43:56'),
(17,16,'user','hola','2026-11-08 23:53:33'),
(18,16,'assistant','¡Hola! Bienvenido a EBA Assistant. Estoy aquí para ayudarte a resolver dudas sobre el bienestar animal en explotaciones ovinas y caprinas, así como a orientarte en el uso y consulta de información dentro del sistema EBA del ICA (predios autorizados, evaluaciones, indicadores, libertades y resultados oficiales).\n\n¿En qué puedo ayudarte el día de hoy?','2026-11-08 23:53:33'),
(19,16,'user','Explícame las cinco libertades del bienestar animal. Utiliza un título principal, subtítulos en negrita, una lista numerada, una tabla con sus ponderaciones y una conclusión final.','2026-11-08 23:54:19'),
(20,16,'assistant','# Las Cinco Libertades del Bienestar Animal en el Sistema EBA\n\nEl bienestar animal en las explotaciones ovinas y caprinas se fundamenta en el marco internacional de las **Cinco Libertades**, las cuales son evaluadas dentro del sistema EBA del ICA a través de 39 indicadores específicos. A continuación, se detallan cada una de ellas:\n\n### **1. Libertad de hambre y sed**\nLos animales deben tener acceso permanente a agua fresca y a una dieta adecuada que mantenga su salud y vigor. Esto implica verificar la disponibilidad, limpieza y funcionalidad de los abrevaderos, así como el suministro de alimento en cantidad y calidad acordes con la especie (ovina o caprina) y su sistema productivo.\n\n### **2. Libertad de incomodidad**\nLos animales deben disponer de un entorno apropiado que incluya refugio y zonas de descanso cómodas y secas. Se evalúan las condiciones de las instalaciones, la protección frente a condiciones climáticas extremas (sol intenso, lluvia, vientos fuertes) y la prevención del hacinamiento.\n\n### **3. Libertad de dolor, lesión y enfermedad**\nSe debe prevenir la aparición de enfermedades y lesiones mediante un manejo sanitario adecuado, programas de vacunación, desparasitación y un diagnóstico oportuno. En caso de presentarse afecciones o dolor, los animales deben recibir tratamiento veterinario inmediato. Esta libertad tiene el mayor peso en la evaluación oficial debido a su impacto crítico en la salud del rebaño.\n\n### **4. Libertad de expresar comportamiento normal**\nLos animales deben contar con espacio suficiente, instalaciones adecuadas y la posibilidad de socializar con otros miembros de su misma especie. Esto permite que desarrollen sus patrones de conducta naturales, como el pastoreo, el ramoneo (muy relevante en caprinos) y la exploración.\n\n### **5. Libertad de miedo y angustia**\nLas condiciones de manejo y el trato diario deben evitar el sufrimiento mental, el estrés crónico y el miedo. Esto se evalúa observando las prácticas de manejo humanitario, la relación positiva entre los operarios y los animales, y la ausencia de factores que generen pánico o ansiedad innecesaria en el rebaño.\n\n---\n\n### Ponderaciones Oficiales de las Cinco Libertades en EBA\n\nLa calificación final de una evaluación en el sistema EBA se calcula ponderando el puntaje obtenido en cada una de las libertades de acuerdo con los siguientes porcentajes oficiales del ICA:\n\n| Libertad del Bienestar Animal | Ponderación Oficial |\n| :--- | :---: |\n| **L3 - Libertad de dolor, lesión y enfermedad** | 35% |\n| **L1 - Libertad de hambre y sed** | 20% |\n| **L2 - Libertad de incomodidad** | 20% |\n| **L5 - Libertad de miedo y angustia** | 15% |\n| **L4 - Libertad de expresar comportamiento normal** | 10% |\n| **Total** | **100%** |\n\n---\n\n### Conclusión Final\n\nLas Cinco Libertades constituyen el pilar fundamental para garantizar un estándar óptimo de bienestar animal en las explotaciones ovinas y caprinas. En el sistema EBA del ICA, cada una de estas libertades se traduce en criterios e indicadores específicos (calificados en niveles de 100, 55, 20 o 0) que permiten a los productores y evaluadores identificar fortalezas y áreas críticas. Cumplir con estos estándares no solo asegura el bienestar de los animales, sino que también mejora la productividad, la sanidad y la calidad general del sistema productivo.','2026-11-08 23:54:19'),
(132,43,'user','Analiza oportunidades de mejora en mi última evaluación','2026-11-09 01:51:33'),
(133,43,'assistant','He consultado tu última evaluación registrada en el sistema (ID: **18**, predio **Granja Caprina El Roble**, sistema **Intensivo**, especie **Caprino**).\n\n### Estado actual de la evaluación:\n* **Estado:** BORRADOR\n* **Puntaje total:** 0 (La evaluación aún no cuenta con ítems calificados o cerrados).\n* **Clasificación:** BAJO (Pendiente de calificación oficial por parte del evaluador).\n\nDado que la evaluación se encuentra en estado **Borrador** y aún no se han calificado los indicadores ni se ha cerrado, **no se registran resultados oficiales ni un plan de mejora activo** en este momento.\n\n### Recomendación:\n1. Completa la calificación de los 34 indicadores correspondientes al sistema intensivo caprino dentro del módulo de evaluación del sistema EBA.\n2. Cierra la evaluación para que el sistema genere el puntaje oficial, la clasificación y el plan de mejora con las oportunidades específicas de las 5 libertades.\n\nUna vez cerrada la evaluación, vuelve a consultarme y con gusto analizaremos las oportunidades de mejora basándonos en los resultados oficiales.','2026-11-09 01:51:33');
/*!40000 ALTER TABLE `asistente_mensajes` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `evaluaciones`
--

DROP TABLE IF EXISTS `evaluaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `evaluaciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `predio_id` int(11) NOT NULL,
  `evaluador_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `estado` enum('BORRADOR','CERRADA') DEFAULT 'BORRADOR',
  `puntaje_total` decimal(5,2) DEFAULT NULL,
  `clasificacion` enum('EXCELENTE BIENESTAR','ALTO','MEDIO','BAJO') DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `cerrada_en` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `predio_id` (`predio_id`),
  KEY `evaluador_id` (`evaluador_id`),
  FOREIGN KEY (`predio_id`) REFERENCES `predios` (`id`),
  FOREIGN KEY (`evaluador_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evaluaciones`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `evaluaciones` WRITE;
/*!40000 ALTER TABLE `evaluaciones` DISABLE KEYS */;
INSERT INTO `evaluaciones` (`id`, `predio_id`, `evaluador_id`, `fecha`, `estado`, `puntaje_total`, `clasificacion`, `observaciones`, `cerrada_en`, `created_at`, `updated_at`) VALUES (16,3,1,'2026-11-08','BORRADOR',NULL,NULL,'xxxx',NULL,'2026-11-08 18:03:53','2026-11-08 18:03:53'),
(17,3,1,'2026-11-08','CERRADA',98.50,'EXCELENTE BIENESTAR','xx','2026-11-08 18:17:55','2026-11-08 18:15:56','2026-11-08 18:17:55'),
(18,3,1,'2026-11-08','BORRADOR',NULL,NULL,NULL,NULL,'2026-11-08 19:37:10','2026-11-08 19:37:10');
/*!40000 ALTER TABLE `evaluaciones` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `evaluaciones_borradas`
--

DROP TABLE IF EXISTS `evaluaciones_borradas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `evaluaciones_borradas` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `evaluacion_id` int(11) NOT NULL,
  `motivo` varchar(255) NOT NULL,
  `fecha_borrado` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_evaluacion` (`evaluacion_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evaluaciones_borradas`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `evaluaciones_borradas` WRITE;
/*!40000 ALTER TABLE `evaluaciones_borradas` DISABLE KEYS */;
INSERT INTO `evaluaciones_borradas` (`id`, `evaluacion_id`, `motivo`, `fecha_borrado`) VALUES (1,8,'Error de prueba desde terminal','2026-11-08 12:02:29'),
(2,11,'Prueba desde terminal','2026-11-08 12:06:43'),
(3,13,'Error de prueba - equivocacion 2026-11-08','2026-11-08 12:20:47'),
(4,14,'Prueba final UI 2026-11-08','2026-11-08 12:26:23'),
(5,12,'Sin especificar','2026-11-08 12:36:30'),
(6,15,'Prueba equivocacion','2026-11-08 12:36:40'),
(7,10,'Error de prueba','2026-11-08 12:39:06'),
(8,9,'Error de prueba','2026-11-08 12:39:15'),
(9,7,'Error de prueba','2026-11-08 12:39:23'),
(10,2,'Prueba equivocación','2026-11-08 13:01:12'),
(11,1,'Prueba equivocación','2026-11-08 13:01:15'),
(12,19,'Prueba F2 aislamiento','2026-11-08 17:10:41'),
(13,20,'Limpieza F3','2026-11-08 17:18:36'),
(14,21,'Limpieza F6','2026-11-08 18:11:44'),
(15,22,'Limpieza F5B','2026-11-08 19:21:53');
/*!40000 ALTER TABLE `evaluaciones_borradas` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `indicadores`
--

DROP TABLE IF EXISTS `indicadores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `indicadores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `numero` int(11) NOT NULL,
  `libertad_id` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `metodo_evaluacion` enum('DOCUMENTAL','VISUAL','VISUAL_MUESTREO') NOT NULL,
  `aplica_extensivo` tinyint(1) DEFAULT 0,
  `aplica_semi_intensivo` tinyint(1) DEFAULT 0,
  `aplica_intensivo` tinyint(1) DEFAULT 0,
  `aplica_familiar` tinyint(1) DEFAULT 0,
  `solo_especie` enum('OVINO','CAPRINO') DEFAULT NULL,
  `solo_ovino_lana` tinyint(1) DEFAULT 0,
  `criterio_100` text DEFAULT NULL,
  `criterio_55` text DEFAULT NULL,
  `criterio_20` text DEFAULT NULL,
  `criterio_0` text DEFAULT NULL,
  `libertad_nombre` varchar(100) DEFAULT NULL,
  `libertad_peso` decimal(4,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `libertad_id` (`libertad_id`),
  FOREIGN KEY (`libertad_id`) REFERENCES `libertades` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `indicadores`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `indicadores` WRITE;
/*!40000 ALTER TABLE `indicadores` DISABLE KEYS */;
INSERT INTO `indicadores` (`id`, `numero`, `libertad_id`, `nombre`, `descripcion`, `metodo_evaluacion`, `aplica_extensivo`, `aplica_semi_intensivo`, `aplica_intensivo`, `aplica_familiar`, `solo_especie`, `solo_ovino_lana`, `criterio_100`, `criterio_55`, `criterio_20`, `criterio_0`, `libertad_nombre`, `libertad_peso`, `created_at`, `updated_at`) VALUES (1,1,1,'Disponibilidad de agua potable','El predio cuenta con fuentes de agua limpia y permanente para los animales.','VISUAL',1,1,1,1,NULL,0,'Disponible agua limpia y permanente en todo momento.','Disponible agua la mayor parte del tiempo, con algunas restricciones.','Disponible agua de forma intermitente o en condiciones deficientes.','No hay disponibilidad de agua para los animales.','Libertad de hambre y sed',0.20,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(2,2,1,'Disponibilidad de alimento','Los animales reciben suficiente alimento según su especie y etapa productiva.','VISUAL',1,1,1,1,NULL,0,'Alimento suficiente y de buena calidad para todos los animales.','Alimento suficiente en la mayoría de los casos.','Alimento insuficiente o de mala calidad.','No hay alimento disponible para los animales.','Libertad de hambre y sed',0.20,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(3,3,1,'Condición corporal adecuada','Los animales presentan una condición corporal acorde a su especie y edad.','VISUAL_MUESTREO',1,1,1,1,NULL,0,'Todos los animales tienen condición corporal óptima.','La mayoría tiene condición corporal adecuada.','Varios animales presentan condición corporal deficiente.','La mayoría de los animales están muy delgados o desnutridos.','Libertad de hambre y sed',0.20,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(4,4,1,'Acceso a pastoreo o forraje','Los animales pueden acceder a pastoreo o forraje de calidad.','DOCUMENTAL',1,1,0,1,NULL,0,'Acceso libre y permanente a pastoreo o forraje.','Acceso regular con algunas restricciones.','Acceso limitado o forraje de mala calidad.','Sin acceso a pastoreo o forraje.','Libertad de hambre y sed',0.20,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(5,5,2,'Refugio y protección contra el clima','Los animales cuentan con refugio adecuado contra lluvia, sol y frío.','VISUAL',1,1,1,1,NULL,0,'Refugio adecuado para todos los animales.','Refugio disponible pero con espacio limitado.','Refugio insuficiente o en mal estado.','No hay refugio disponible.','Libertad de incomodidad',0.20,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(6,6,2,'Espacio y densidad de animales','El espacio disponible permite movimiento y descanso adecuado.','VISUAL',1,1,1,1,NULL,0,'Espacio adecuado sin hacinamiento.','Espacio suficiente con leve hacinamiento en horarios puntuales.','Espacio reducido y hacinamiento frecuente.','Hacinamiento severo que impide el movimiento.','Libertad de incomodidad',0.20,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(7,7,2,'Superficie de descanso limpia y seca','El área donde descansan los animales está limpia y seca.','VISUAL',1,1,1,1,NULL,0,'Superficie siempre limpia y seca.','Superficie mayormente limpia y seca.','Superficie frecuentemente húmeda o sucia.','Superficie permanentemente húmeda y sucia.','Libertad de incomodidad',0.20,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(8,8,2,'Ventilación y temperatura','Las instalaciones permiten una ventilación adecuada y temperatura confortable.','VISUAL',0,1,1,1,NULL,0,'Ventilación y temperatura óptimas.','Ventilación adecuada con algunas variaciones.','Ventilación deficiente o temperaturas extremas frecuentes.','Sin ventilación y temperaturas extremas constantes.','Libertad de incomodidad',0.20,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(9,9,3,'Prevención y control de enfermedades','Existe un plan sanitario y control de enfermedades.','DOCUMENTAL',1,1,1,1,NULL,0,'Plan sanitario implementado y al día.','Plan sanitario con algunas falencias.','Control sanitario deficiente.','Sin control sanitario.','Libertad de dolor, lesión y enfermedad',0.35,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(10,10,3,'Atención veterinaria oportuna','Los animales reciben atención veterinaria cuando lo requieren.','DOCUMENTAL',1,1,1,1,NULL,0,'Atención veterinaria disponible y oportuna.','Atención veterinaria con algunas demoras.','Atención veterinaria difícil de conseguir.','Sin acceso a atención veterinaria.','Libertad de dolor, lesión y enfermedad',0.35,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(11,11,3,'Ausencia de lesiones visibles','Los animales no presentan lesiones, heridas o signos de maltrato.','VISUAL_MUESTREO',1,1,1,1,NULL,0,'Sin lesiones en ninguno de los animales observados.','Pocas lesiones leves y aisladas.','Varios animales con lesiones visibles.','La mayoría de los animales presentan lesiones.','Libertad de dolor, lesión y enfermedad',0.35,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(12,12,3,'Control de parásitos externos e internos','Existe programa de desparasitación y control de parásitos.','DOCUMENTAL',1,1,1,1,NULL,0,'Programa de desparasitación implementado y documentado.','Programa de desparasitación con algunas omisiones.','Control de parásitos deficiente.','Sin control de parásitos.','Libertad de dolor, lesión y enfermedad',0.35,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(13,13,3,'Poda de pezuñas y cuidado de extremidades','Las pezuñas están en buen estado y se les da mantenimiento.','VISUAL',1,1,1,1,NULL,0,'Pezuñas en buen estado y mantenimiento al día.','Pezuñas mayormente en buen estado.','Algunas pezuñas con problemas visibles.','Muchas pezuñas en mal estado sin atención.','Libertad de dolor, lesión y enfermedad',0.35,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(14,14,3,'Uso de métodos de contención adecuados','Los métodos de contención no causan dolor ni lesiones innecesarias.','VISUAL',1,1,1,1,NULL,0,'Contención humana y sin causar lesiones.','Contención adecuada con incidentes mínimos.','Métodos de contención que causan estrés o lesiones leves.','Métodos de contención agresivos que causan dolor.','Libertad de dolor, lesión y enfermedad',0.35,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(15,15,4,'Oportunidad de socializar con otros animales','Los animales pueden interactuar socialmente con su propia especie.','VISUAL',1,1,1,1,NULL,0,'Todos los animales pueden socializar libremente.','La mayoría puede socializar con restricciones leves.','Interacción social limitada.','Aislamiento de los animales sin interacción.','Libertad de expresar comportamiento normal',0.10,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(16,16,4,'Espacio para moverse y ejercitarse','El predio permite que los animales se muevan y ejerciten.','VISUAL',1,1,1,1,NULL,0,'Espacio amplio para movimiento y ejercicio.','Espacio suficiente para movimiento básico.','Espacio reducido que limita el movimiento.','Sin espacio para movimiento (confinamiento permanente).','Libertad de expresar comportamiento normal',0.10,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(17,17,4,'Comportamiento reproductivo natural','Se permite el comportamiento reproductivo natural de la especie.','DOCUMENTAL',1,1,1,1,NULL,0,'Se permite reproducción natural sin restricciones.','Reproducción controlada pero respetando comportamiento natural.','Restricciones severas al comportamiento reproductivo.','Impedimento total de comportamiento reproductivo natural.','Libertad de expresar comportamiento normal',0.10,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(18,18,5,'Manejo tranquilo y sin miedo','El personal maneja a los animales de forma tranquila y sin causar miedo.','VISUAL',1,1,1,1,NULL,0,'Manejo siempre tranquilo, sin causar miedo.','Manejo mayormente tranquilo con algunos episodios de estrés.','Manejo brusco frecuente que causa miedo.','Manejo agresivo que causa miedo constante.','Libertad de miedo y angustia',0.15,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(19,19,5,'Instalaciones seguras sin objetos peligrosos','Las instalaciones están libres de objetos que puedan causar lesiones o miedo.','VISUAL',1,1,1,1,NULL,0,'Instalaciones completamente seguras.','Instalaciones seguras con algunos objetos menores.','Presencia de varios objetos peligrosos.','Instalaciones peligrosas que causan lesiones o miedo.','Libertad de miedo y angustia',0.15,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(20,20,5,'Separación adecuada de animales agresivos','Los animales agresivos están separados para evitar lesiones y estrés.','VISUAL',1,1,1,1,NULL,0,'Separación adecuada de animales agresivos.','Separación con algunas omisiones.','Poca separación, ocurren peleas frecuentes.','Sin separación, constantes agresiones entre animales.','Libertad de miedo y angustia',0.15,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(21,21,5,'Ruidos y estímulos excesivos controlados','Se evitan ruidos fuertes o estímulos que causen angustia.','VISUAL',0,1,1,1,NULL,0,'Entorno tranquilo sin ruidos excesivos.','Ruidos ocasionales sin impacto severo.','Ruidos frecuentes que causan estrés.','Ruidos constantes que causan angustia severa.','Libertad de miedo y angustia',0.15,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(22,22,1,'Calidad del agua ofrecida','El agua ofrecida cumple con parámetros básicos de calidad.','DOCUMENTAL',1,1,1,1,NULL,0,'Agua de buena calidad, sin contaminación visible.','Agua aceptable con mínima contaminación.','Agua con contaminación visible.','Agua no apta para consumo.','Libertad de hambre y sed',0.20,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(23,23,1,'Suplementación mineral','Se ofrece suplementación mineral según necesidades de la especie.','DOCUMENTAL',1,1,1,0,NULL,0,'Suplementación mineral regular y adecuada.','Suplementación mineral ocasional.','Suplementación insuficiente.','Sin suplementación mineral.','Libertad de hambre y sed',0.20,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(24,24,2,'Protección contra temperaturas extremas','Los animales están protegidos de olas de calor o frío intenso.','VISUAL',1,1,1,1,NULL,0,'Protección completa contra temperaturas extremas.','Protección adecuada con algunas exposiciones.','Protección deficiente.','Sin protección contra temperaturas extremas.','Libertad de incomodidad',0.20,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(25,25,2,'Sombra disponible en potreros','Existe sombra natural o artificial en los potreros.','VISUAL',1,1,0,1,NULL,0,'Sombra disponible en todo el potrero.','Sombra disponible en la mayoría del potrero.','Sombra limitada.','Sin sombra disponible.','Libertad de incomodidad',0.20,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(26,26,3,'Vacunación al día','El calendario de vacunación está completo y actualizado.','DOCUMENTAL',1,1,1,1,NULL,0,'Todas las vacunas aplicadas al día.','Calendario de vacunación con algunos retrasos.','Vacunación incompleta.','Sin vacunación.','Libertad de dolor, lesión y enfermedad',0.35,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(27,27,3,'Aislamiento de animales enfermos','Los animales enfermos se aislan para evitar contagios.','VISUAL',1,1,1,1,NULL,0,'Aislamiento adecuado de animales enfermos.','Aislamiento con algunas omisiones.','Poco aislamiento, riesgo de contagio.','Sin aislamiento de animales enfermos.','Libertad de dolor, lesión y enfermedad',0.35,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(28,28,3,'Registro de tratamientos médicos','Se lleva registro de todos los tratamientos médicos aplicados.','DOCUMENTAL',0,1,1,0,NULL,0,'Registro completo y actualizado de tratamientos.','Registro parcial de tratamientos.','Registro deficiente.','Sin registro de tratamientos.','Libertad de dolor, lesión y enfermedad',0.35,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(29,29,4,'Acceso al exterior o áreas abiertas','Los animales tienen acceso a áreas abiertas o exterior.','VISUAL',1,1,0,1,NULL,0,'Acceso permanente a áreas abiertas.','Acceso regular con algunas restricciones.','Acceso limitado.','Sin acceso a exterior (encierro total).','Libertad de expresar comportamiento normal',0.10,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(30,30,4,'Oportunidad de pastoreo natural','Se permite el pastoreo natural según la especie.','VISUAL',1,1,0,1,NULL,0,'Pastoreo natural permitido sin restricciones.','Pastoreo natural con algunas limitaciones.','Pastoreo muy limitado.','Sin pastoreo natural.','Libertad de expresar comportamiento normal',0.10,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(31,31,5,'Transporte sin estrés excesivo','Cuando se transporta, se minimiza el estrés de los animales.','VISUAL',1,1,1,1,NULL,0,'Transporte con manejo adecuado y bajo estrés.','Transporte con estrés moderado.','Transporte que causa estrés significativo.','Transporte que causa angustia severa.','Libertad de miedo y angustia',0.15,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(32,32,5,'Evitar aglomeraciones innecesarias','Se evitan aglomeraciones que causen miedo o lesiones.','VISUAL',1,1,1,1,NULL,0,'Sin aglomeraciones innecesarias.','Aglomeraciones ocasionales sin impacto severo.','Aglomeraciones frecuentes.','Aglomeraciones constantes que causan lesiones.','Libertad de miedo y angustia',0.15,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(33,33,1,'Frecuencia de suministro de agua','El agua se renueva con la frecuencia adecuada.','VISUAL',1,1,1,1,NULL,0,'Agua renovada frecuentemente, siempre fresca.','Agua renovada regularmente.','Agua renovada con poca frecuencia.','Agua estancada o sin renovación.','Libertad de hambre y sed',0.20,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(34,34,2,'Camas o áreas de descanso adecuadas','Existen camas o áreas específicas para el descanso de los animales.','VISUAL',0,1,1,1,NULL,0,'Áreas de descanso adecuadas para todos.','Áreas de descanso con algunas limitaciones.','Áreas insuficientes.','Sin áreas de descanso.','Libertad de incomodidad',0.20,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(35,35,3,'Control de moscas y vectores','Se controlan moscas y otros vectores de enfermedad.','VISUAL',1,1,1,1,NULL,0,'Control efectivo de moscas y vectores.','Control parcial de vectores.','Control deficiente.','Sin control de vectores.','Libertad de dolor, lesión y enfermedad',0.35,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(36,36,3,'Higiene de las instalaciones','Las instalaciones se mantienen limpias e higienizadas.','VISUAL',1,1,1,1,NULL,0,'Instalaciones siempre limpias.','Instalaciones mayormente limpias.','Instalaciones frecuentemente sucias.','Instalaciones permanentemente sucias.','Libertad de dolor, lesión y enfermedad',0.35,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(37,37,4,'Enriquecimiento ambiental','Se ofrecen estímulos para el comportamiento natural.','VISUAL',0,1,1,0,NULL,0,'Enriquecimiento ambiental adecuado.','Algún tipo de enriquecimiento presente.','Poco o ningún enriquecimiento.','Sin enriquecimiento ambiental.','Libertad de expresar comportamiento normal',0.10,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(38,38,5,'Capacitación del personal en bienestar','El personal que maneja animales está capacitado en bienestar animal.','DOCUMENTAL',1,1,1,1,NULL,0,'Personal capacitado y certificado.','Personal con capacitación básica.','Personal con poca capacitación.','Sin capacitación en bienestar animal.','Libertad de miedo y angustia',0.15,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(100,100,2,'Esquila y cuidado de la lana','Para ovinos de lana, la esquila se realiza adecuadamente y sin causar estrés.','VISUAL',1,1,1,1,'OVINO',1,'Esquila realizada correctamente y en tiempo.','Esquila con algunas deficiencias menores.','Esquila deficiente que causa estrés.','Sin esquila o esquila que causa lesiones.','Libertad de incomodidad',0.20,'2026-11-08 14:58:31','2026-11-08 14:58:31');
/*!40000 ALTER TABLE `indicadores` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `item_evaluacion`
--

DROP TABLE IF EXISTS `item_evaluacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_evaluacion` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `evaluacion_id` int(11) NOT NULL,
  `indicador_id` int(11) NOT NULL,
  `numero` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `metodo_evaluacion` enum('DOCUMENTAL','VISUAL','VISUAL_MUESTREO') NOT NULL,
  `libertad_id` int(11) NOT NULL,
  `libertad_nombre` varchar(100) DEFAULT NULL,
  `libertad_peso` decimal(4,2) DEFAULT NULL,
  `seccion` varchar(100) DEFAULT NULL,
  `criterio_100` text DEFAULT NULL,
  `criterio_55` text DEFAULT NULL,
  `criterio_20` text DEFAULT NULL,
  `criterio_0` text DEFAULT NULL,
  `puntaje` enum('0','20','55','100') DEFAULT NULL,
  `observacion` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `evaluacion_id` (`evaluacion_id`),
  KEY `indicador_id` (`indicador_id`),
  KEY `libertad_id` (`libertad_id`),
  FOREIGN KEY (`evaluacion_id`) REFERENCES `evaluaciones` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`indicador_id`) REFERENCES `indicadores` (`id`),
  FOREIGN KEY (`libertad_id`) REFERENCES `libertades` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=740 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_evaluacion`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `item_evaluacion` WRITE;
/*!40000 ALTER TABLE `item_evaluacion` DISABLE KEYS */;
INSERT INTO `item_evaluacion` (`id`, `evaluacion_id`, `indicador_id`, `numero`, `nombre`, `descripcion`, `metodo_evaluacion`, `libertad_id`, `libertad_nombre`, `libertad_peso`, `seccion`, `criterio_100`, `criterio_55`, `criterio_20`, `criterio_0`, `puntaje`, `observacion`, `created_at`, `updated_at`) VALUES (506,16,1,1,'Disponibilidad de agua potable','El predio cuenta con fuentes de agua limpia y permanente para los animales.','VISUAL',1,'Libertad de hambre y sed',0.20,NULL,'Disponible agua limpia y permanente en todo momento.','Disponible agua la mayor parte del tiempo, con algunas restricciones.','Disponible agua de forma intermitente o en condiciones deficientes.','No hay disponibilidad de agua para los animales.','0',NULL,'2026-11-08 18:03:53','2026-11-08 18:03:56'),
(507,16,2,2,'Disponibilidad de alimento','Los animales reciben suficiente alimento según su especie y etapa productiva.','VISUAL',1,'Libertad de hambre y sed',0.20,NULL,'Alimento suficiente y de buena calidad para todos los animales.','Alimento suficiente en la mayoría de los casos.','Alimento insuficiente o de mala calidad.','No hay alimento disponible para los animales.','20',NULL,'2026-11-08 18:03:53','2026-11-08 18:03:57'),
(508,16,3,3,'Condición corporal adecuada','Los animales presentan una condición corporal acorde a su especie y edad.','VISUAL_MUESTREO',1,'Libertad de hambre y sed',0.20,NULL,'Todos los animales tienen condición corporal óptima.','La mayoría tiene condición corporal adecuada.','Varios animales presentan condición corporal deficiente.','La mayoría de los animales están muy delgados o desnutridos.','20',NULL,'2026-11-08 18:03:53','2026-11-08 18:03:58'),
(509,16,5,5,'Refugio y protección contra el clima','Los animales cuentan con refugio adecuado contra lluvia, sol y frío.','VISUAL',2,'Libertad de incomodidad',0.20,NULL,'Refugio adecuado para todos los animales.','Refugio disponible pero con espacio limitado.','Refugio insuficiente o en mal estado.','No hay refugio disponible.',NULL,NULL,'2026-11-08 18:03:53','2026-11-08 18:03:53'),
(510,16,6,6,'Espacio y densidad de animales','El espacio disponible permite movimiento y descanso adecuado.','VISUAL',2,'Libertad de incomodidad',0.20,NULL,'Espacio adecuado sin hacinamiento.','Espacio suficiente con leve hacinamiento en horarios puntuales.','Espacio reducido y hacinamiento frecuente.','Hacinamiento severo que impide el movimiento.',NULL,NULL,'2026-11-08 18:03:53','2026-11-08 18:03:53'),
(511,16,7,7,'Superficie de descanso limpia y seca','El área donde descansan los animales está limpia y seca.','VISUAL',2,'Libertad de incomodidad',0.20,NULL,'Superficie siempre limpia y seca.','Superficie mayormente limpia y seca.','Superficie frecuentemente húmeda o sucia.','Superficie permanentemente húmeda y sucia.',NULL,NULL,'2026-11-08 18:03:53','2026-11-08 18:03:53'),
(512,16,8,8,'Ventilación y temperatura','Las instalaciones permiten una ventilación adecuada y temperatura confortable.','VISUAL',2,'Libertad de incomodidad',0.20,NULL,'Ventilación y temperatura óptimas.','Ventilación adecuada con algunas variaciones.','Ventilación deficiente o temperaturas extremas frecuentes.','Sin ventilación y temperaturas extremas constantes.',NULL,NULL,'2026-11-08 18:03:53','2026-11-08 18:03:53'),
(513,16,9,9,'Prevención y control de enfermedades','Existe un plan sanitario y control de enfermedades.','DOCUMENTAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Plan sanitario implementado y al día.','Plan sanitario con algunas falencias.','Control sanitario deficiente.','Sin control sanitario.',NULL,NULL,'2026-11-08 18:03:53','2026-11-08 18:03:53'),
(514,16,10,10,'Atención veterinaria oportuna','Los animales reciben atención veterinaria cuando lo requieren.','DOCUMENTAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Atención veterinaria disponible y oportuna.','Atención veterinaria con algunas demoras.','Atención veterinaria difícil de conseguir.','Sin acceso a atención veterinaria.',NULL,NULL,'2026-11-08 18:03:53','2026-11-08 18:03:53'),
(515,16,11,11,'Ausencia de lesiones visibles','Los animales no presentan lesiones, heridas o signos de maltrato.','VISUAL_MUESTREO',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Sin lesiones en ninguno de los animales observados.','Pocas lesiones leves y aisladas.','Varios animales con lesiones visibles.','La mayoría de los animales presentan lesiones.',NULL,NULL,'2026-11-08 18:03:53','2026-11-08 18:03:53'),
(516,16,12,12,'Control de parásitos externos e internos','Existe programa de desparasitación y control de parásitos.','DOCUMENTAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Programa de desparasitación implementado y documentado.','Programa de desparasitación con algunas omisiones.','Control de parásitos deficiente.','Sin control de parásitos.',NULL,NULL,'2026-11-08 18:03:53','2026-11-08 18:03:53'),
(517,16,13,13,'Poda de pezuñas y cuidado de extremidades','Las pezuñas están en buen estado y se les da mantenimiento.','VISUAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Pezuñas en buen estado y mantenimiento al día.','Pezuñas mayormente en buen estado.','Algunas pezuñas con problemas visibles.','Muchas pezuñas en mal estado sin atención.',NULL,NULL,'2026-11-08 18:03:53','2026-11-08 18:03:53'),
(518,16,14,14,'Uso de métodos de contención adecuados','Los métodos de contención no causan dolor ni lesiones innecesarias.','VISUAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Contención humana y sin causar lesiones.','Contención adecuada con incidentes mínimos.','Métodos de contención que causan estrés o lesiones leves.','Métodos de contención agresivos que causan dolor.',NULL,NULL,'2026-11-08 18:03:53','2026-11-08 18:03:53'),
(519,16,15,15,'Oportunidad de socializar con otros animales','Los animales pueden interactuar socialmente con su propia especie.','VISUAL',4,'Libertad de expresar comportamiento normal',0.10,NULL,'Todos los animales pueden socializar libremente.','La mayoría puede socializar con restricciones leves.','Interacción social limitada.','Aislamiento de los animales sin interacción.',NULL,NULL,'2026-11-08 18:03:53','2026-11-08 18:03:53'),
(520,16,16,16,'Espacio para moverse y ejercitarse','El predio permite que los animales se muevan y ejerciten.','VISUAL',4,'Libertad de expresar comportamiento normal',0.10,NULL,'Espacio amplio para movimiento y ejercicio.','Espacio suficiente para movimiento básico.','Espacio reducido que limita el movimiento.','Sin espacio para movimiento (confinamiento permanente).',NULL,NULL,'2026-11-08 18:03:53','2026-11-08 18:03:53'),
(521,16,17,17,'Comportamiento reproductivo natural','Se permite el comportamiento reproductivo natural de la especie.','DOCUMENTAL',4,'Libertad de expresar comportamiento normal',0.10,NULL,'Se permite reproducción natural sin restricciones.','Reproducción controlada pero respetando comportamiento natural.','Restricciones severas al comportamiento reproductivo.','Impedimento total de comportamiento reproductivo natural.',NULL,NULL,'2026-11-08 18:03:53','2026-11-08 18:03:53'),
(522,16,18,18,'Manejo tranquilo y sin miedo','El personal maneja a los animales de forma tranquila y sin causar miedo.','VISUAL',5,'Libertad de miedo y angustia',0.15,NULL,'Manejo siempre tranquilo, sin causar miedo.','Manejo mayormente tranquilo con algunos episodios de estrés.','Manejo brusco frecuente que causa miedo.','Manejo agresivo que causa miedo constante.',NULL,NULL,'2026-11-08 18:03:53','2026-11-08 18:03:53'),
(523,16,19,19,'Instalaciones seguras sin objetos peligrosos','Las instalaciones están libres de objetos que puedan causar lesiones o miedo.','VISUAL',5,'Libertad de miedo y angustia',0.15,NULL,'Instalaciones completamente seguras.','Instalaciones seguras con algunos objetos menores.','Presencia de varios objetos peligrosos.','Instalaciones peligrosas que causan lesiones o miedo.',NULL,NULL,'2026-11-08 18:03:53','2026-11-08 18:03:53'),
(524,16,20,20,'Separación adecuada de animales agresivos','Los animales agresivos están separados para evitar lesiones y estrés.','VISUAL',5,'Libertad de miedo y angustia',0.15,NULL,'Separación adecuada de animales agresivos.','Separación con algunas omisiones.','Poca separación, ocurren peleas frecuentes.','Sin separación, constantes agresiones entre animales.',NULL,NULL,'2026-11-08 18:03:53','2026-11-08 18:03:53'),
(525,16,21,21,'Ruidos y estímulos excesivos controlados','Se evitan ruidos fuertes o estímulos que causen angustia.','VISUAL',5,'Libertad de miedo y angustia',0.15,NULL,'Entorno tranquilo sin ruidos excesivos.','Ruidos ocasionales sin impacto severo.','Ruidos frecuentes que causan estrés.','Ruidos constantes que causan angustia severa.',NULL,NULL,'2026-11-08 18:03:53','2026-11-08 18:03:53'),
(526,16,22,22,'Calidad del agua ofrecida','El agua ofrecida cumple con parámetros básicos de calidad.','DOCUMENTAL',1,'Libertad de hambre y sed',0.20,NULL,'Agua de buena calidad, sin contaminación visible.','Agua aceptable con mínima contaminación.','Agua con contaminación visible.','Agua no apta para consumo.',NULL,NULL,'2026-11-08 18:03:53','2026-11-08 18:03:53'),
(527,16,23,23,'Suplementación mineral','Se ofrece suplementación mineral según necesidades de la especie.','DOCUMENTAL',1,'Libertad de hambre y sed',0.20,NULL,'Suplementación mineral regular y adecuada.','Suplementación mineral ocasional.','Suplementación insuficiente.','Sin suplementación mineral.',NULL,NULL,'2026-11-08 18:03:53','2026-11-08 18:03:53'),
(528,16,24,24,'Protección contra temperaturas extremas','Los animales están protegidos de olas de calor o frío intenso.','VISUAL',2,'Libertad de incomodidad',0.20,NULL,'Protección completa contra temperaturas extremas.','Protección adecuada con algunas exposiciones.','Protección deficiente.','Sin protección contra temperaturas extremas.',NULL,NULL,'2026-11-08 18:03:53','2026-11-08 18:03:53'),
(529,16,26,26,'Vacunación al día','El calendario de vacunación está completo y actualizado.','DOCUMENTAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Todas las vacunas aplicadas al día.','Calendario de vacunación con algunos retrasos.','Vacunación incompleta.','Sin vacunación.',NULL,NULL,'2026-11-08 18:03:53','2026-11-08 18:03:53'),
(530,16,27,27,'Aislamiento de animales enfermos','Los animales enfermos se aislan para evitar contagios.','VISUAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Aislamiento adecuado de animales enfermos.','Aislamiento con algunas omisiones.','Poco aislamiento, riesgo de contagio.','Sin aislamiento de animales enfermos.',NULL,NULL,'2026-11-08 18:03:53','2026-11-08 18:03:53'),
(531,16,28,28,'Registro de tratamientos médicos','Se lleva registro de todos los tratamientos médicos aplicados.','DOCUMENTAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Registro completo y actualizado de tratamientos.','Registro parcial de tratamientos.','Registro deficiente.','Sin registro de tratamientos.',NULL,NULL,'2026-11-08 18:03:53','2026-11-08 18:03:53'),
(532,16,31,31,'Transporte sin estrés excesivo','Cuando se transporta, se minimiza el estrés de los animales.','VISUAL',5,'Libertad de miedo y angustia',0.15,NULL,'Transporte con manejo adecuado y bajo estrés.','Transporte con estrés moderado.','Transporte que causa estrés significativo.','Transporte que causa angustia severa.',NULL,NULL,'2026-11-08 18:03:53','2026-11-08 18:03:53'),
(533,16,32,32,'Evitar aglomeraciones innecesarias','Se evitan aglomeraciones que causen miedo o lesiones.','VISUAL',5,'Libertad de miedo y angustia',0.15,NULL,'Sin aglomeraciones innecesarias.','Aglomeraciones ocasionales sin impacto severo.','Aglomeraciones frecuentes.','Aglomeraciones constantes que causan lesiones.',NULL,NULL,'2026-11-08 18:03:53','2026-11-08 18:03:53'),
(534,16,33,33,'Frecuencia de suministro de agua','El agua se renueva con la frecuencia adecuada.','VISUAL',1,'Libertad de hambre y sed',0.20,NULL,'Agua renovada frecuentemente, siempre fresca.','Agua renovada regularmente.','Agua renovada con poca frecuencia.','Agua estancada o sin renovación.',NULL,NULL,'2026-11-08 18:03:53','2026-11-08 18:03:53'),
(535,16,34,34,'Camas o áreas de descanso adecuadas','Existen camas o áreas específicas para el descanso de los animales.','VISUAL',2,'Libertad de incomodidad',0.20,NULL,'Áreas de descanso adecuadas para todos.','Áreas de descanso con algunas limitaciones.','Áreas insuficientes.','Sin áreas de descanso.',NULL,NULL,'2026-11-08 18:03:53','2026-11-08 18:03:53'),
(536,16,35,35,'Control de moscas y vectores','Se controlan moscas y otros vectores de enfermedad.','VISUAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Control efectivo de moscas y vectores.','Control parcial de vectores.','Control deficiente.','Sin control de vectores.',NULL,NULL,'2026-11-08 18:03:53','2026-11-08 18:03:53'),
(537,16,36,36,'Higiene de las instalaciones','Las instalaciones se mantienen limpias e higienizadas.','VISUAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Instalaciones siempre limpias.','Instalaciones mayormente limpias.','Instalaciones frecuentemente sucias.','Instalaciones permanentemente sucias.',NULL,NULL,'2026-11-08 18:03:53','2026-11-08 18:03:53'),
(538,16,37,37,'Enriquecimiento ambiental','Se ofrecen estímulos para el comportamiento natural.','VISUAL',4,'Libertad de expresar comportamiento normal',0.10,NULL,'Enriquecimiento ambiental adecuado.','Algún tipo de enriquecimiento presente.','Poco o ningún enriquecimiento.','Sin enriquecimiento ambiental.',NULL,NULL,'2026-11-08 18:03:53','2026-11-08 18:03:53'),
(539,16,38,38,'Capacitación del personal en bienestar','El personal que maneja animales está capacitado en bienestar animal.','DOCUMENTAL',5,'Libertad de miedo y angustia',0.15,NULL,'Personal capacitado y certificado.','Personal con capacitación básica.','Personal con poca capacitación.','Sin capacitación en bienestar animal.',NULL,NULL,'2026-11-08 18:03:53','2026-11-08 18:03:53'),
(540,17,1,1,'Disponibilidad de agua potable','El predio cuenta con fuentes de agua limpia y permanente para los animales.','VISUAL',1,'Libertad de hambre y sed',0.20,NULL,'Disponible agua limpia y permanente en todo momento.','Disponible agua la mayor parte del tiempo, con algunas restricciones.','Disponible agua de forma intermitente o en condiciones deficientes.','No hay disponibilidad de agua para los animales.','55',NULL,'2026-11-08 18:15:56','2026-11-08 18:15:56'),
(541,17,2,2,'Disponibilidad de alimento','Los animales reciben suficiente alimento según su especie y etapa productiva.','VISUAL',1,'Libertad de hambre y sed',0.20,NULL,'Alimento suficiente y de buena calidad para todos los animales.','Alimento suficiente en la mayoría de los casos.','Alimento insuficiente o de mala calidad.','No hay alimento disponible para los animales.','100',NULL,'2026-11-08 18:15:56','2026-11-08 18:15:56'),
(542,17,3,3,'Condición corporal adecuada','Los animales presentan una condición corporal acorde a su especie y edad.','VISUAL_MUESTREO',1,'Libertad de hambre y sed',0.20,NULL,'Todos los animales tienen condición corporal óptima.','La mayoría tiene condición corporal adecuada.','Varios animales presentan condición corporal deficiente.','La mayoría de los animales están muy delgados o desnutridos.','100',NULL,'2026-11-08 18:15:56','2026-11-08 18:15:56'),
(543,17,5,5,'Refugio y protección contra el clima','Los animales cuentan con refugio adecuado contra lluvia, sol y frío.','VISUAL',2,'Libertad de incomodidad',0.20,NULL,'Refugio adecuado para todos los animales.','Refugio disponible pero con espacio limitado.','Refugio insuficiente o en mal estado.','No hay refugio disponible.','100',NULL,'2026-11-08 18:15:56','2026-11-08 18:15:56'),
(544,17,6,6,'Espacio y densidad de animales','El espacio disponible permite movimiento y descanso adecuado.','VISUAL',2,'Libertad de incomodidad',0.20,NULL,'Espacio adecuado sin hacinamiento.','Espacio suficiente con leve hacinamiento en horarios puntuales.','Espacio reducido y hacinamiento frecuente.','Hacinamiento severo que impide el movimiento.','100',NULL,'2026-11-08 18:15:56','2026-11-08 18:15:56'),
(545,17,7,7,'Superficie de descanso limpia y seca','El área donde descansan los animales está limpia y seca.','VISUAL',2,'Libertad de incomodidad',0.20,NULL,'Superficie siempre limpia y seca.','Superficie mayormente limpia y seca.','Superficie frecuentemente húmeda o sucia.','Superficie permanentemente húmeda y sucia.','100',NULL,'2026-11-08 18:15:56','2026-11-08 18:15:56'),
(546,17,8,8,'Ventilación y temperatura','Las instalaciones permiten una ventilación adecuada y temperatura confortable.','VISUAL',2,'Libertad de incomodidad',0.20,NULL,'Ventilación y temperatura óptimas.','Ventilación adecuada con algunas variaciones.','Ventilación deficiente o temperaturas extremas frecuentes.','Sin ventilación y temperaturas extremas constantes.','100',NULL,'2026-11-08 18:15:56','2026-11-08 18:15:56'),
(547,17,9,9,'Prevención y control de enfermedades','Existe un plan sanitario y control de enfermedades.','DOCUMENTAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Plan sanitario implementado y al día.','Plan sanitario con algunas falencias.','Control sanitario deficiente.','Sin control sanitario.','100',NULL,'2026-11-08 18:15:56','2026-11-08 18:15:56'),
(548,17,10,10,'Atención veterinaria oportuna','Los animales reciben atención veterinaria cuando lo requieren.','DOCUMENTAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Atención veterinaria disponible y oportuna.','Atención veterinaria con algunas demoras.','Atención veterinaria difícil de conseguir.','Sin acceso a atención veterinaria.','100',NULL,'2026-11-08 18:15:56','2026-11-08 18:15:56'),
(549,17,11,11,'Ausencia de lesiones visibles','Los animales no presentan lesiones, heridas o signos de maltrato.','VISUAL_MUESTREO',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Sin lesiones en ninguno de los animales observados.','Pocas lesiones leves y aisladas.','Varios animales con lesiones visibles.','La mayoría de los animales presentan lesiones.','100',NULL,'2026-11-08 18:15:56','2026-11-08 18:15:56'),
(550,17,12,12,'Control de parásitos externos e internos','Existe programa de desparasitación y control de parásitos.','DOCUMENTAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Programa de desparasitación implementado y documentado.','Programa de desparasitación con algunas omisiones.','Control de parásitos deficiente.','Sin control de parásitos.','100',NULL,'2026-11-08 18:15:56','2026-11-08 18:15:56'),
(551,17,13,13,'Poda de pezuñas y cuidado de extremidades','Las pezuñas están en buen estado y se les da mantenimiento.','VISUAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Pezuñas en buen estado y mantenimiento al día.','Pezuñas mayormente en buen estado.','Algunas pezuñas con problemas visibles.','Muchas pezuñas en mal estado sin atención.','100',NULL,'2026-11-08 18:15:56','2026-11-08 18:15:56'),
(552,17,14,14,'Uso de métodos de contención adecuados','Los métodos de contención no causan dolor ni lesiones innecesarias.','VISUAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Contención humana y sin causar lesiones.','Contención adecuada con incidentes mínimos.','Métodos de contención que causan estrés o lesiones leves.','Métodos de contención agresivos que causan dolor.','100',NULL,'2026-11-08 18:15:56','2026-11-08 18:15:56'),
(553,17,15,15,'Oportunidad de socializar con otros animales','Los animales pueden interactuar socialmente con su propia especie.','VISUAL',4,'Libertad de expresar comportamiento normal',0.10,NULL,'Todos los animales pueden socializar libremente.','La mayoría puede socializar con restricciones leves.','Interacción social limitada.','Aislamiento de los animales sin interacción.','100',NULL,'2026-11-08 18:15:56','2026-11-08 18:15:56'),
(554,17,16,16,'Espacio para moverse y ejercitarse','El predio permite que los animales se muevan y ejerciten.','VISUAL',4,'Libertad de expresar comportamiento normal',0.10,NULL,'Espacio amplio para movimiento y ejercicio.','Espacio suficiente para movimiento básico.','Espacio reducido que limita el movimiento.','Sin espacio para movimiento (confinamiento permanente).','100',NULL,'2026-11-08 18:15:56','2026-11-08 18:15:56'),
(555,17,17,17,'Comportamiento reproductivo natural','Se permite el comportamiento reproductivo natural de la especie.','DOCUMENTAL',4,'Libertad de expresar comportamiento normal',0.10,NULL,'Se permite reproducción natural sin restricciones.','Reproducción controlada pero respetando comportamiento natural.','Restricciones severas al comportamiento reproductivo.','Impedimento total de comportamiento reproductivo natural.','100',NULL,'2026-11-08 18:15:56','2026-11-08 18:15:56'),
(556,17,18,18,'Manejo tranquilo y sin miedo','El personal maneja a los animales de forma tranquila y sin causar miedo.','VISUAL',5,'Libertad de miedo y angustia',0.15,NULL,'Manejo siempre tranquilo, sin causar miedo.','Manejo mayormente tranquilo con algunos episodios de estrés.','Manejo brusco frecuente que causa miedo.','Manejo agresivo que causa miedo constante.','100',NULL,'2026-11-08 18:15:56','2026-11-08 18:15:56'),
(557,17,19,19,'Instalaciones seguras sin objetos peligrosos','Las instalaciones están libres de objetos que puedan causar lesiones o miedo.','VISUAL',5,'Libertad de miedo y angustia',0.15,NULL,'Instalaciones completamente seguras.','Instalaciones seguras con algunos objetos menores.','Presencia de varios objetos peligrosos.','Instalaciones peligrosas que causan lesiones o miedo.','100',NULL,'2026-11-08 18:15:56','2026-11-08 18:15:56'),
(558,17,20,20,'Separación adecuada de animales agresivos','Los animales agresivos están separados para evitar lesiones y estrés.','VISUAL',5,'Libertad de miedo y angustia',0.15,NULL,'Separación adecuada de animales agresivos.','Separación con algunas omisiones.','Poca separación, ocurren peleas frecuentes.','Sin separación, constantes agresiones entre animales.','100',NULL,'2026-11-08 18:15:56','2026-11-08 18:15:56'),
(559,17,21,21,'Ruidos y estímulos excesivos controlados','Se evitan ruidos fuertes o estímulos que causen angustia.','VISUAL',5,'Libertad de miedo y angustia',0.15,NULL,'Entorno tranquilo sin ruidos excesivos.','Ruidos ocasionales sin impacto severo.','Ruidos frecuentes que causan estrés.','Ruidos constantes que causan angustia severa.','100',NULL,'2026-11-08 18:15:56','2026-11-08 18:15:56'),
(560,17,22,22,'Calidad del agua ofrecida','El agua ofrecida cumple con parámetros básicos de calidad.','DOCUMENTAL',1,'Libertad de hambre y sed',0.20,NULL,'Agua de buena calidad, sin contaminación visible.','Agua aceptable con mínima contaminación.','Agua con contaminación visible.','Agua no apta para consumo.','100',NULL,'2026-11-08 18:15:56','2026-11-08 18:15:56'),
(561,17,23,23,'Suplementación mineral','Se ofrece suplementación mineral según necesidades de la especie.','DOCUMENTAL',1,'Libertad de hambre y sed',0.20,NULL,'Suplementación mineral regular y adecuada.','Suplementación mineral ocasional.','Suplementación insuficiente.','Sin suplementación mineral.','100',NULL,'2026-11-08 18:15:56','2026-11-08 18:15:56'),
(562,17,24,24,'Protección contra temperaturas extremas','Los animales están protegidos de olas de calor o frío intenso.','VISUAL',2,'Libertad de incomodidad',0.20,NULL,'Protección completa contra temperaturas extremas.','Protección adecuada con algunas exposiciones.','Protección deficiente.','Sin protección contra temperaturas extremas.','100',NULL,'2026-11-08 18:15:56','2026-11-08 18:15:56'),
(563,17,26,26,'Vacunación al día','El calendario de vacunación está completo y actualizado.','DOCUMENTAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Todas las vacunas aplicadas al día.','Calendario de vacunación con algunos retrasos.','Vacunación incompleta.','Sin vacunación.','100',NULL,'2026-11-08 18:15:56','2026-11-08 18:15:56'),
(564,17,27,27,'Aislamiento de animales enfermos','Los animales enfermos se aislan para evitar contagios.','VISUAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Aislamiento adecuado de animales enfermos.','Aislamiento con algunas omisiones.','Poco aislamiento, riesgo de contagio.','Sin aislamiento de animales enfermos.','100',NULL,'2026-11-08 18:15:56','2026-11-08 18:15:56'),
(565,17,28,28,'Registro de tratamientos médicos','Se lleva registro de todos los tratamientos médicos aplicados.','DOCUMENTAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Registro completo y actualizado de tratamientos.','Registro parcial de tratamientos.','Registro deficiente.','Sin registro de tratamientos.','100',NULL,'2026-11-08 18:15:56','2026-11-08 18:15:56'),
(566,17,31,31,'Transporte sin estrés excesivo','Cuando se transporta, se minimiza el estrés de los animales.','VISUAL',5,'Libertad de miedo y angustia',0.15,NULL,'Transporte con manejo adecuado y bajo estrés.','Transporte con estrés moderado.','Transporte que causa estrés significativo.','Transporte que causa angustia severa.','100',NULL,'2026-11-08 18:15:56','2026-11-08 18:15:56'),
(567,17,32,32,'Evitar aglomeraciones innecesarias','Se evitan aglomeraciones que causen miedo o lesiones.','VISUAL',5,'Libertad de miedo y angustia',0.15,NULL,'Sin aglomeraciones innecesarias.','Aglomeraciones ocasionales sin impacto severo.','Aglomeraciones frecuentes.','Aglomeraciones constantes que causan lesiones.','100',NULL,'2026-11-08 18:15:56','2026-11-08 18:15:56'),
(568,17,33,33,'Frecuencia de suministro de agua','El agua se renueva con la frecuencia adecuada.','VISUAL',1,'Libertad de hambre y sed',0.20,NULL,'Agua renovada frecuentemente, siempre fresca.','Agua renovada regularmente.','Agua renovada con poca frecuencia.','Agua estancada o sin renovación.','100',NULL,'2026-11-08 18:15:56','2026-11-08 18:15:56'),
(569,17,34,34,'Camas o áreas de descanso adecuadas','Existen camas o áreas específicas para el descanso de los animales.','VISUAL',2,'Libertad de incomodidad',0.20,NULL,'Áreas de descanso adecuadas para todos.','Áreas de descanso con algunas limitaciones.','Áreas insuficientes.','Sin áreas de descanso.','100',NULL,'2026-11-08 18:15:56','2026-11-08 18:15:56'),
(570,17,35,35,'Control de moscas y vectores','Se controlan moscas y otros vectores de enfermedad.','VISUAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Control efectivo de moscas y vectores.','Control parcial de vectores.','Control deficiente.','Sin control de vectores.','100',NULL,'2026-11-08 18:15:56','2026-11-08 18:15:56'),
(571,17,36,36,'Higiene de las instalaciones','Las instalaciones se mantienen limpias e higienizadas.','VISUAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Instalaciones siempre limpias.','Instalaciones mayormente limpias.','Instalaciones frecuentemente sucias.','Instalaciones permanentemente sucias.','100',NULL,'2026-11-08 18:15:56','2026-11-08 18:15:56'),
(572,17,37,37,'Enriquecimiento ambiental','Se ofrecen estímulos para el comportamiento natural.','VISUAL',4,'Libertad de expresar comportamiento normal',0.10,NULL,'Enriquecimiento ambiental adecuado.','Algún tipo de enriquecimiento presente.','Poco o ningún enriquecimiento.','Sin enriquecimiento ambiental.','100',NULL,'2026-11-08 18:15:56','2026-11-08 18:15:56'),
(573,17,38,38,'Capacitación del personal en bienestar','El personal que maneja animales está capacitado en bienestar animal.','DOCUMENTAL',5,'Libertad de miedo y angustia',0.15,NULL,'Personal capacitado y certificado.','Personal con capacitación básica.','Personal con poca capacitación.','Sin capacitación en bienestar animal.','100',NULL,'2026-11-08 18:15:56','2026-11-08 18:15:56'),
(574,18,1,1,'Disponibilidad de agua potable','El predio cuenta con fuentes de agua limpia y permanente para los animales.','VISUAL',1,'Libertad de hambre y sed',0.20,NULL,'Disponible agua limpia y permanente en todo momento.','Disponible agua la mayor parte del tiempo, con algunas restricciones.','Disponible agua de forma intermitente o en condiciones deficientes.','No hay disponibilidad de agua para los animales.',NULL,NULL,'2026-11-08 19:37:10','2026-11-08 19:37:10'),
(575,18,2,2,'Disponibilidad de alimento','Los animales reciben suficiente alimento según su especie y etapa productiva.','VISUAL',1,'Libertad de hambre y sed',0.20,NULL,'Alimento suficiente y de buena calidad para todos los animales.','Alimento suficiente en la mayoría de los casos.','Alimento insuficiente o de mala calidad.','No hay alimento disponible para los animales.',NULL,NULL,'2026-11-08 19:37:10','2026-11-08 19:37:10'),
(576,18,3,3,'Condición corporal adecuada','Los animales presentan una condición corporal acorde a su especie y edad.','VISUAL_MUESTREO',1,'Libertad de hambre y sed',0.20,NULL,'Todos los animales tienen condición corporal óptima.','La mayoría tiene condición corporal adecuada.','Varios animales presentan condición corporal deficiente.','La mayoría de los animales están muy delgados o desnutridos.',NULL,NULL,'2026-11-08 19:37:10','2026-11-08 19:37:10'),
(577,18,5,5,'Refugio y protección contra el clima','Los animales cuentan con refugio adecuado contra lluvia, sol y frío.','VISUAL',2,'Libertad de incomodidad',0.20,NULL,'Refugio adecuado para todos los animales.','Refugio disponible pero con espacio limitado.','Refugio insuficiente o en mal estado.','No hay refugio disponible.',NULL,NULL,'2026-11-08 19:37:10','2026-11-08 19:37:10'),
(578,18,6,6,'Espacio y densidad de animales','El espacio disponible permite movimiento y descanso adecuado.','VISUAL',2,'Libertad de incomodidad',0.20,NULL,'Espacio adecuado sin hacinamiento.','Espacio suficiente con leve hacinamiento en horarios puntuales.','Espacio reducido y hacinamiento frecuente.','Hacinamiento severo que impide el movimiento.',NULL,NULL,'2026-11-08 19:37:10','2026-11-08 19:37:10'),
(579,18,7,7,'Superficie de descanso limpia y seca','El área donde descansan los animales está limpia y seca.','VISUAL',2,'Libertad de incomodidad',0.20,NULL,'Superficie siempre limpia y seca.','Superficie mayormente limpia y seca.','Superficie frecuentemente húmeda o sucia.','Superficie permanentemente húmeda y sucia.',NULL,NULL,'2026-11-08 19:37:10','2026-11-08 19:37:10'),
(580,18,8,8,'Ventilación y temperatura','Las instalaciones permiten una ventilación adecuada y temperatura confortable.','VISUAL',2,'Libertad de incomodidad',0.20,NULL,'Ventilación y temperatura óptimas.','Ventilación adecuada con algunas variaciones.','Ventilación deficiente o temperaturas extremas frecuentes.','Sin ventilación y temperaturas extremas constantes.',NULL,NULL,'2026-11-08 19:37:10','2026-11-08 19:37:10'),
(581,18,9,9,'Prevención y control de enfermedades','Existe un plan sanitario y control de enfermedades.','DOCUMENTAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Plan sanitario implementado y al día.','Plan sanitario con algunas falencias.','Control sanitario deficiente.','Sin control sanitario.',NULL,NULL,'2026-11-08 19:37:10','2026-11-08 19:37:10'),
(582,18,10,10,'Atención veterinaria oportuna','Los animales reciben atención veterinaria cuando lo requieren.','DOCUMENTAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Atención veterinaria disponible y oportuna.','Atención veterinaria con algunas demoras.','Atención veterinaria difícil de conseguir.','Sin acceso a atención veterinaria.',NULL,NULL,'2026-11-08 19:37:10','2026-11-08 19:37:10'),
(583,18,11,11,'Ausencia de lesiones visibles','Los animales no presentan lesiones, heridas o signos de maltrato.','VISUAL_MUESTREO',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Sin lesiones en ninguno de los animales observados.','Pocas lesiones leves y aisladas.','Varios animales con lesiones visibles.','La mayoría de los animales presentan lesiones.',NULL,NULL,'2026-11-08 19:37:10','2026-11-08 19:37:10'),
(584,18,12,12,'Control de parásitos externos e internos','Existe programa de desparasitación y control de parásitos.','DOCUMENTAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Programa de desparasitación implementado y documentado.','Programa de desparasitación con algunas omisiones.','Control de parásitos deficiente.','Sin control de parásitos.',NULL,NULL,'2026-11-08 19:37:10','2026-11-08 19:37:10'),
(585,18,13,13,'Poda de pezuñas y cuidado de extremidades','Las pezuñas están en buen estado y se les da mantenimiento.','VISUAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Pezuñas en buen estado y mantenimiento al día.','Pezuñas mayormente en buen estado.','Algunas pezuñas con problemas visibles.','Muchas pezuñas en mal estado sin atención.',NULL,NULL,'2026-11-08 19:37:10','2026-11-08 19:37:10'),
(586,18,14,14,'Uso de métodos de contención adecuados','Los métodos de contención no causan dolor ni lesiones innecesarias.','VISUAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Contención humana y sin causar lesiones.','Contención adecuada con incidentes mínimos.','Métodos de contención que causan estrés o lesiones leves.','Métodos de contención agresivos que causan dolor.',NULL,NULL,'2026-11-08 19:37:10','2026-11-08 19:37:10'),
(587,18,15,15,'Oportunidad de socializar con otros animales','Los animales pueden interactuar socialmente con su propia especie.','VISUAL',4,'Libertad de expresar comportamiento normal',0.10,NULL,'Todos los animales pueden socializar libremente.','La mayoría puede socializar con restricciones leves.','Interacción social limitada.','Aislamiento de los animales sin interacción.',NULL,NULL,'2026-11-08 19:37:10','2026-11-08 19:37:10'),
(588,18,16,16,'Espacio para moverse y ejercitarse','El predio permite que los animales se muevan y ejerciten.','VISUAL',4,'Libertad de expresar comportamiento normal',0.10,NULL,'Espacio amplio para movimiento y ejercicio.','Espacio suficiente para movimiento básico.','Espacio reducido que limita el movimiento.','Sin espacio para movimiento (confinamiento permanente).',NULL,NULL,'2026-11-08 19:37:10','2026-11-08 19:37:10'),
(589,18,17,17,'Comportamiento reproductivo natural','Se permite el comportamiento reproductivo natural de la especie.','DOCUMENTAL',4,'Libertad de expresar comportamiento normal',0.10,NULL,'Se permite reproducción natural sin restricciones.','Reproducción controlada pero respetando comportamiento natural.','Restricciones severas al comportamiento reproductivo.','Impedimento total de comportamiento reproductivo natural.',NULL,NULL,'2026-11-08 19:37:10','2026-11-08 19:37:10'),
(590,18,18,18,'Manejo tranquilo y sin miedo','El personal maneja a los animales de forma tranquila y sin causar miedo.','VISUAL',5,'Libertad de miedo y angustia',0.15,NULL,'Manejo siempre tranquilo, sin causar miedo.','Manejo mayormente tranquilo con algunos episodios de estrés.','Manejo brusco frecuente que causa miedo.','Manejo agresivo que causa miedo constante.',NULL,NULL,'2026-11-08 19:37:10','2026-11-08 19:37:10'),
(591,18,19,19,'Instalaciones seguras sin objetos peligrosos','Las instalaciones están libres de objetos que puedan causar lesiones o miedo.','VISUAL',5,'Libertad de miedo y angustia',0.15,NULL,'Instalaciones completamente seguras.','Instalaciones seguras con algunos objetos menores.','Presencia de varios objetos peligrosos.','Instalaciones peligrosas que causan lesiones o miedo.',NULL,NULL,'2026-11-08 19:37:10','2026-11-08 19:37:10'),
(592,18,20,20,'Separación adecuada de animales agresivos','Los animales agresivos están separados para evitar lesiones y estrés.','VISUAL',5,'Libertad de miedo y angustia',0.15,NULL,'Separación adecuada de animales agresivos.','Separación con algunas omisiones.','Poca separación, ocurren peleas frecuentes.','Sin separación, constantes agresiones entre animales.',NULL,NULL,'2026-11-08 19:37:10','2026-11-08 19:37:10'),
(593,18,21,21,'Ruidos y estímulos excesivos controlados','Se evitan ruidos fuertes o estímulos que causen angustia.','VISUAL',5,'Libertad de miedo y angustia',0.15,NULL,'Entorno tranquilo sin ruidos excesivos.','Ruidos ocasionales sin impacto severo.','Ruidos frecuentes que causan estrés.','Ruidos constantes que causan angustia severa.',NULL,NULL,'2026-11-08 19:37:10','2026-11-08 19:37:10'),
(594,18,22,22,'Calidad del agua ofrecida','El agua ofrecida cumple con parámetros básicos de calidad.','DOCUMENTAL',1,'Libertad de hambre y sed',0.20,NULL,'Agua de buena calidad, sin contaminación visible.','Agua aceptable con mínima contaminación.','Agua con contaminación visible.','Agua no apta para consumo.',NULL,NULL,'2026-11-08 19:37:10','2026-11-08 19:37:10'),
(595,18,23,23,'Suplementación mineral','Se ofrece suplementación mineral según necesidades de la especie.','DOCUMENTAL',1,'Libertad de hambre y sed',0.20,NULL,'Suplementación mineral regular y adecuada.','Suplementación mineral ocasional.','Suplementación insuficiente.','Sin suplementación mineral.',NULL,NULL,'2026-11-08 19:37:10','2026-11-08 19:37:10'),
(596,18,24,24,'Protección contra temperaturas extremas','Los animales están protegidos de olas de calor o frío intenso.','VISUAL',2,'Libertad de incomodidad',0.20,NULL,'Protección completa contra temperaturas extremas.','Protección adecuada con algunas exposiciones.','Protección deficiente.','Sin protección contra temperaturas extremas.',NULL,NULL,'2026-11-08 19:37:10','2026-11-08 19:37:10'),
(597,18,26,26,'Vacunación al día','El calendario de vacunación está completo y actualizado.','DOCUMENTAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Todas las vacunas aplicadas al día.','Calendario de vacunación con algunos retrasos.','Vacunación incompleta.','Sin vacunación.',NULL,NULL,'2026-11-08 19:37:10','2026-11-08 19:37:10'),
(598,18,27,27,'Aislamiento de animales enfermos','Los animales enfermos se aislan para evitar contagios.','VISUAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Aislamiento adecuado de animales enfermos.','Aislamiento con algunas omisiones.','Poco aislamiento, riesgo de contagio.','Sin aislamiento de animales enfermos.',NULL,NULL,'2026-11-08 19:37:10','2026-11-08 19:37:10'),
(599,18,28,28,'Registro de tratamientos médicos','Se lleva registro de todos los tratamientos médicos aplicados.','DOCUMENTAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Registro completo y actualizado de tratamientos.','Registro parcial de tratamientos.','Registro deficiente.','Sin registro de tratamientos.',NULL,NULL,'2026-11-08 19:37:10','2026-11-08 19:37:10'),
(600,18,31,31,'Transporte sin estrés excesivo','Cuando se transporta, se minimiza el estrés de los animales.','VISUAL',5,'Libertad de miedo y angustia',0.15,NULL,'Transporte con manejo adecuado y bajo estrés.','Transporte con estrés moderado.','Transporte que causa estrés significativo.','Transporte que causa angustia severa.',NULL,NULL,'2026-11-08 19:37:10','2026-11-08 19:37:10'),
(601,18,32,32,'Evitar aglomeraciones innecesarias','Se evitan aglomeraciones que causen miedo o lesiones.','VISUAL',5,'Libertad de miedo y angustia',0.15,NULL,'Sin aglomeraciones innecesarias.','Aglomeraciones ocasionales sin impacto severo.','Aglomeraciones frecuentes.','Aglomeraciones constantes que causan lesiones.',NULL,NULL,'2026-11-08 19:37:10','2026-11-08 19:37:10'),
(602,18,33,33,'Frecuencia de suministro de agua','El agua se renueva con la frecuencia adecuada.','VISUAL',1,'Libertad de hambre y sed',0.20,NULL,'Agua renovada frecuentemente, siempre fresca.','Agua renovada regularmente.','Agua renovada con poca frecuencia.','Agua estancada o sin renovación.',NULL,NULL,'2026-11-08 19:37:10','2026-11-08 19:37:10'),
(603,18,34,34,'Camas o áreas de descanso adecuadas','Existen camas o áreas específicas para el descanso de los animales.','VISUAL',2,'Libertad de incomodidad',0.20,NULL,'Áreas de descanso adecuadas para todos.','Áreas de descanso con algunas limitaciones.','Áreas insuficientes.','Sin áreas de descanso.',NULL,NULL,'2026-11-08 19:37:10','2026-11-08 19:37:10'),
(604,18,35,35,'Control de moscas y vectores','Se controlan moscas y otros vectores de enfermedad.','VISUAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Control efectivo de moscas y vectores.','Control parcial de vectores.','Control deficiente.','Sin control de vectores.',NULL,NULL,'2026-11-08 19:37:10','2026-11-08 19:37:10'),
(605,18,36,36,'Higiene de las instalaciones','Las instalaciones se mantienen limpias e higienizadas.','VISUAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Instalaciones siempre limpias.','Instalaciones mayormente limpias.','Instalaciones frecuentemente sucias.','Instalaciones permanentemente sucias.',NULL,NULL,'2026-11-08 19:37:10','2026-11-08 19:37:10'),
(606,18,37,37,'Enriquecimiento ambiental','Se ofrecen estímulos para el comportamiento natural.','VISUAL',4,'Libertad de expresar comportamiento normal',0.10,NULL,'Enriquecimiento ambiental adecuado.','Algún tipo de enriquecimiento presente.','Poco o ningún enriquecimiento.','Sin enriquecimiento ambiental.',NULL,NULL,'2026-11-08 19:37:10','2026-11-08 19:37:10'),
(607,18,38,38,'Capacitación del personal en bienestar','El personal que maneja animales está capacitado en bienestar animal.','DOCUMENTAL',5,'Libertad de miedo y angustia',0.15,NULL,'Personal capacitado y certificado.','Personal con capacitación básica.','Personal con poca capacitación.','Sin capacitación en bienestar animal.',NULL,NULL,'2026-11-08 19:37:10','2026-11-08 19:37:10');
/*!40000 ALTER TABLE `item_evaluacion` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `libertades`
--

DROP TABLE IF EXISTS `libertades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `libertades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `peso` decimal(4,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `libertades`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `libertades` WRITE;
/*!40000 ALTER TABLE `libertades` DISABLE KEYS */;
INSERT INTO `libertades` (`id`, `nombre`, `peso`) VALUES (1,'Libertad de hambre y sed',0.20),
(2,'Libertad de incomodidad',0.20),
(3,'Libertad de dolor, lesión y enfermedad',0.35),
(4,'Libertad de expresar comportamiento normal',0.10),
(5,'Libertad de miedo y angustia',0.15);
/*!40000 ALTER TABLE `libertades` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `predios`
--

DROP TABLE IF EXISTS `predios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `predios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `municipio` varchar(100) NOT NULL,
  `direccion` text DEFAULT NULL,
  `especie` enum('OVINO','CAPRINO') NOT NULL,
  `sistema_productivo` enum('EXTENSIVO','SEMI_INTENSIVO','INTENSIVO','FAMILIAR') NOT NULL,
  `es_ovino_de_lana` tinyint(1) DEFAULT 0,
  `numero_animales` int(11) DEFAULT 0,
  `responsable_id` int(11) DEFAULT NULL,
  `creado_por` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `responsable_id` (`responsable_id`),
  KEY `creado_por` (`creado_por`),
  FOREIGN KEY (`responsable_id`) REFERENCES `usuarios` (`id`),
  FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `predios`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `predios` WRITE;
/*!40000 ALTER TABLE `predios` DISABLE KEYS */;
INSERT INTO `predios` (`id`, `nombre`, `municipio`, `direccion`, `especie`, `sistema_productivo`, `es_ovino_de_lana`, `numero_animales`, `responsable_id`, `creado_por`, `created_at`, `updated_at`) VALUES (2,'Hato Los Alpes','Tunja','Vereda Las Acacias','OVINO','SEMI_INTENSIVO',1,85,3,2,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(3,'Granja Caprina El Roble','Villeta','Corregimiento El Tres','CAPRINO','INTENSIVO',0,45,3,2,'2026-11-08 14:58:31','2026-11-08 14:58:31');
/*!40000 ALTER TABLE `predios` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `predios_borrados`
--

DROP TABLE IF EXISTS `predios_borrados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `predios_borrados` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `predio_id` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `municipio` varchar(100) DEFAULT NULL,
  `motivo` varchar(255) NOT NULL,
  `fecha_borrado` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_predio` (`predio_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `predios_borrados`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `predios_borrados` WRITE;
/*!40000 ALTER TABLE `predios_borrados` DISABLE KEYS */;
INSERT INTO `predios_borrados` (`id`, `predio_id`, `nombre`, `municipio`, `motivo`, `fecha_borrado`) VALUES (1,6,'Predio Prueba Borrar','Tunja','Error de prueba','2026-11-08 12:53:44'),
(2,7,'Predio Prueba Borrar2','Tunja','Error de prueba','2026-11-08 12:59:19'),
(3,1,'Finca La Esperanza','San Gil','Prueba equivocación','2026-11-08 13:01:19'),
(4,4,'Predio Familiar Los Nogales','Pamplona','Error de prueba','2026-11-08 13:01:29'),
(5,8,'Predio Aislado ADMIN','Tunja','Prueba F2 aislamiento','2026-11-08 17:10:41'),
(6,9,'Aislado F3','Tunja','Limpieza F3','2026-11-08 17:18:36'),
(7,10,'Aislado F6','Tunja','Limpieza F6','2026-11-08 18:11:44'),
(8,11,'Aislado F5B','Tunja','Limpieza F5B','2026-11-08 19:21:53');
/*!40000 ALTER TABLE `predios_borrados` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `recomendaciones_ia`
--

DROP TABLE IF EXISTS `recomendaciones_ia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `recomendaciones_ia` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `evaluacion_id` int(11) NOT NULL,
  `contenido` text NOT NULL,
  `modelo` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `evaluacion_id` (`evaluacion_id`),
  FOREIGN KEY (`evaluacion_id`) REFERENCES `evaluaciones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recomendaciones_ia`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `recomendaciones_ia` WRITE;
/*!40000 ALTER TABLE `recomendaciones_ia` DISABLE KEYS */;
INSERT INTO `recomendaciones_ia` (`id`, `evaluacion_id`, `contenido`, `modelo`, `created_at`, `updated_at`) VALUES (9,17,'Recomendación generada por el modelo EBA-IA para la evaluación #17 del predio \"Granja Caprina El Roble\" (Villeta).\n\nEspecie: CAPRINO · Sistema productivo: INTENSIVO · Puntaje total: 98.5 / 100 · Clasificación: EXCELENTE BIENESTAR.\n\nExisten 1 indicador(es) en nivel medio (55 puntos) que pueden mejorarse: Disponibilidad de agua potable.\n\nLa libertad con menor puntaje es \"Libertad de hambre y sed\" (92.5). Revisar prácticas asociadas a esta dimensión.\n\nObservaciones del evaluador: \"xx\".\n\nEsta recomendación es una orientación automática y no reemplaza el concepto técnico del ICA ni la evaluación de un veterinario colegiado.','EBA-IA-simulado-v1','2026-11-08 18:17:55','2026-11-08 18:17:55');
/*!40000 ALTER TABLE `recomendaciones_ia` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('ADMIN','EVALUADOR','RESPONSABLE') NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` (`id`, `nombre`, `correo`, `password`, `rol`, `activo`, `created_at`, `updated_at`) VALUES (1,'Administrador Sistema','admin@ica.gov.co','admin123','ADMIN',1,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(2,'Evaluador ICA','evaluador@ica.gov.co','eval123','EVALUADOR',1,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(3,'Responsable Predio','responsable@ica.gov.co','resp123','RESPONSABLE',1,'2026-11-08 14:58:31','2026-11-08 14:58:31');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Dumping events for database 'eba_db'
--

--
-- Dumping routines for database 'eba_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-11-08 22:26:18
