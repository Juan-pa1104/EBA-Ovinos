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
-- Current Database: `eba_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `eba_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `eba_db`;

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
  CONSTRAINT `1` FOREIGN KEY (`predio_id`) REFERENCES `predios` (`id`),
  CONSTRAINT `2` FOREIGN KEY (`evaluador_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evaluaciones`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `evaluaciones` WRITE;
/*!40000 ALTER TABLE `evaluaciones` DISABLE KEYS */;
INSERT INTO `evaluaciones` VALUES
(1,1,2,'2026-11-08','CERRADA',100.00,'EXCELENTE BIENESTAR','Evaluación de demostración: todos los indicadores calificados como conformes.','2026-11-08 14:59:13','2026-11-08 14:59:13','2026-11-08 15:02:31');
/*!40000 ALTER TABLE `evaluaciones` ENABLE KEYS */;
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
  CONSTRAINT `1` FOREIGN KEY (`libertad_id`) REFERENCES `libertades` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `indicadores`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `indicadores` WRITE;
/*!40000 ALTER TABLE `indicadores` DISABLE KEYS */;
INSERT INTO `indicadores` VALUES
(1,1,1,'Disponibilidad de agua potable','El predio cuenta con fuentes de agua limpia y permanente para los animales.','VISUAL',1,1,1,1,NULL,0,'Disponible agua limpia y permanente en todo momento.','Disponible agua la mayor parte del tiempo, con algunas restricciones.','Disponible agua de forma intermitente o en condiciones deficientes.','No hay disponibilidad de agua para los animales.','Libertad de hambre y sed',0.20,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
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
  CONSTRAINT `1` FOREIGN KEY (`evaluacion_id`) REFERENCES `evaluaciones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`indicador_id`) REFERENCES `indicadores` (`id`),
  CONSTRAINT `3` FOREIGN KEY (`libertad_id`) REFERENCES `libertades` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_evaluacion`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `item_evaluacion` WRITE;
/*!40000 ALTER TABLE `item_evaluacion` DISABLE KEYS */;
INSERT INTO `item_evaluacion` VALUES
(1,1,1,1,'Disponibilidad de agua potable','El predio cuenta con fuentes de agua limpia y permanente para los animales.','VISUAL',1,'Libertad de hambre y sed',0.20,NULL,'Disponible agua limpia y permanente en todo momento.','Disponible agua la mayor parte del tiempo, con algunas restricciones.','Disponible agua de forma intermitente o en condiciones deficientes.','No hay disponibilidad de agua para los animales.','100','Conforme','2026-11-08 14:59:13','2026-11-08 14:59:13'),
(2,1,2,2,'Disponibilidad de alimento','Los animales reciben suficiente alimento según su especie y etapa productiva.','VISUAL',1,'Libertad de hambre y sed',0.20,NULL,'Alimento suficiente y de buena calidad para todos los animales.','Alimento suficiente en la mayoría de los casos.','Alimento insuficiente o de mala calidad.','No hay alimento disponible para los animales.','100','Conforme','2026-11-08 14:59:13','2026-11-08 14:59:13'),
(3,1,3,3,'Condición corporal adecuada','Los animales presentan una condición corporal acorde a su especie y edad.','VISUAL_MUESTREO',1,'Libertad de hambre y sed',0.20,NULL,'Todos los animales tienen condición corporal óptima.','La mayoría tiene condición corporal adecuada.','Varios animales presentan condición corporal deficiente.','La mayoría de los animales están muy delgados o desnutridos.','100','Conforme','2026-11-08 14:59:13','2026-11-08 14:59:13'),
(4,1,4,4,'Acceso a pastoreo o forraje','Los animales pueden acceder a pastoreo o forraje de calidad.','DOCUMENTAL',1,'Libertad de hambre y sed',0.20,NULL,'Acceso libre y permanente a pastoreo o forraje.','Acceso regular con algunas restricciones.','Acceso limitado o forraje de mala calidad.','Sin acceso a pastoreo o forraje.','100','Conforme','2026-11-08 14:59:13','2026-11-08 14:59:13'),
(5,1,5,5,'Refugio y protección contra el clima','Los animales cuentan con refugio adecuado contra lluvia, sol y frío.','VISUAL',2,'Libertad de incomodidad',0.20,NULL,'Refugio adecuado para todos los animales.','Refugio disponible pero con espacio limitado.','Refugio insuficiente o en mal estado.','No hay refugio disponible.','100','Conforme','2026-11-08 14:59:13','2026-11-08 14:59:13'),
(6,1,6,6,'Espacio y densidad de animales','El espacio disponible permite movimiento y descanso adecuado.','VISUAL',2,'Libertad de incomodidad',0.20,NULL,'Espacio adecuado sin hacinamiento.','Espacio suficiente con leve hacinamiento en horarios puntuales.','Espacio reducido y hacinamiento frecuente.','Hacinamiento severo que impide el movimiento.','100','Conforme','2026-11-08 14:59:13','2026-11-08 14:59:13'),
(7,1,7,7,'Superficie de descanso limpia y seca','El área donde descansan los animales está limpia y seca.','VISUAL',2,'Libertad de incomodidad',0.20,NULL,'Superficie siempre limpia y seca.','Superficie mayormente limpia y seca.','Superficie frecuentemente húmeda o sucia.','Superficie permanentemente húmeda y sucia.','100','Conforme','2026-11-08 14:59:13','2026-11-08 14:59:13'),
(8,1,9,9,'Prevención y control de enfermedades','Existe un plan sanitario y control de enfermedades.','DOCUMENTAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Plan sanitario implementado y al día.','Plan sanitario con algunas falencias.','Control sanitario deficiente.','Sin control sanitario.','100','Conforme','2026-11-08 14:59:13','2026-11-08 14:59:13'),
(9,1,10,10,'Atención veterinaria oportuna','Los animales reciben atención veterinaria cuando lo requieren.','DOCUMENTAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Atención veterinaria disponible y oportuna.','Atención veterinaria con algunas demoras.','Atención veterinaria difícil de conseguir.','Sin acceso a atención veterinaria.','100','Conforme','2026-11-08 14:59:13','2026-11-08 14:59:13'),
(10,1,11,11,'Ausencia de lesiones visibles','Los animales no presentan lesiones, heridas o signos de maltrato.','VISUAL_MUESTREO',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Sin lesiones en ninguno de los animales observados.','Pocas lesiones leves y aisladas.','Varios animales con lesiones visibles.','La mayoría de los animales presentan lesiones.','100','Conforme','2026-11-08 14:59:13','2026-11-08 14:59:13'),
(11,1,12,12,'Control de parásitos externos e internos','Existe programa de desparasitación y control de parásitos.','DOCUMENTAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Programa de desparasitación implementado y documentado.','Programa de desparasitación con algunas omisiones.','Control de parásitos deficiente.','Sin control de parásitos.','100','Conforme','2026-11-08 14:59:13','2026-11-08 14:59:13'),
(12,1,13,13,'Poda de pezuñas y cuidado de extremidades','Las pezuñas están en buen estado y se les da mantenimiento.','VISUAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Pezuñas en buen estado y mantenimiento al día.','Pezuñas mayormente en buen estado.','Algunas pezuñas con problemas visibles.','Muchas pezuñas en mal estado sin atención.','100','Conforme','2026-11-08 14:59:13','2026-11-08 14:59:13'),
(13,1,14,14,'Uso de métodos de contención adecuados','Los métodos de contención no causan dolor ni lesiones innecesarias.','VISUAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Contención humana y sin causar lesiones.','Contención adecuada con incidentes mínimos.','Métodos de contención que causan estrés o lesiones leves.','Métodos de contención agresivos que causan dolor.','100','Conforme','2026-11-08 14:59:13','2026-11-08 14:59:13'),
(14,1,15,15,'Oportunidad de socializar con otros animales','Los animales pueden interactuar socialmente con su propia especie.','VISUAL',4,'Libertad de expresar comportamiento normal',0.10,NULL,'Todos los animales pueden socializar libremente.','La mayoría puede socializar con restricciones leves.','Interacción social limitada.','Aislamiento de los animales sin interacción.','100','Conforme','2026-11-08 14:59:13','2026-11-08 14:59:13'),
(15,1,16,16,'Espacio para moverse y ejercitarse','El predio permite que los animales se muevan y ejerciten.','VISUAL',4,'Libertad de expresar comportamiento normal',0.10,NULL,'Espacio amplio para movimiento y ejercicio.','Espacio suficiente para movimiento básico.','Espacio reducido que limita el movimiento.','Sin espacio para movimiento (confinamiento permanente).','100','Conforme','2026-11-08 14:59:13','2026-11-08 14:59:13'),
(16,1,17,17,'Comportamiento reproductivo natural','Se permite el comportamiento reproductivo natural de la especie.','DOCUMENTAL',4,'Libertad de expresar comportamiento normal',0.10,NULL,'Se permite reproducción natural sin restricciones.','Reproducción controlada pero respetando comportamiento natural.','Restricciones severas al comportamiento reproductivo.','Impedimento total de comportamiento reproductivo natural.','100','Conforme','2026-11-08 14:59:13','2026-11-08 14:59:13'),
(17,1,18,18,'Manejo tranquilo y sin miedo','El personal maneja a los animales de forma tranquila y sin causar miedo.','VISUAL',5,'Libertad de miedo y angustia',0.15,NULL,'Manejo siempre tranquilo, sin causar miedo.','Manejo mayormente tranquilo con algunos episodios de estrés.','Manejo brusco frecuente que causa miedo.','Manejo agresivo que causa miedo constante.','100','Conforme','2026-11-08 14:59:13','2026-11-08 14:59:13'),
(18,1,19,19,'Instalaciones seguras sin objetos peligrosos','Las instalaciones están libres de objetos que puedan causar lesiones o miedo.','VISUAL',5,'Libertad de miedo y angustia',0.15,NULL,'Instalaciones completamente seguras.','Instalaciones seguras con algunos objetos menores.','Presencia de varios objetos peligrosos.','Instalaciones peligrosas que causan lesiones o miedo.','100','Conforme','2026-11-08 14:59:13','2026-11-08 14:59:13'),
(19,1,20,20,'Separación adecuada de animales agresivos','Los animales agresivos están separados para evitar lesiones y estrés.','VISUAL',5,'Libertad de miedo y angustia',0.15,NULL,'Separación adecuada de animales agresivos.','Separación con algunas omisiones.','Poca separación, ocurren peleas frecuentes.','Sin separación, constantes agresiones entre animales.','100','Conforme','2026-11-08 14:59:13','2026-11-08 14:59:13'),
(20,1,22,22,'Calidad del agua ofrecida','El agua ofrecida cumple con parámetros básicos de calidad.','DOCUMENTAL',1,'Libertad de hambre y sed',0.20,NULL,'Agua de buena calidad, sin contaminación visible.','Agua aceptable con mínima contaminación.','Agua con contaminación visible.','Agua no apta para consumo.','100','Conforme','2026-11-08 14:59:13','2026-11-08 14:59:13'),
(21,1,23,23,'Suplementación mineral','Se ofrece suplementación mineral según necesidades de la especie.','DOCUMENTAL',1,'Libertad de hambre y sed',0.20,NULL,'Suplementación mineral regular y adecuada.','Suplementación mineral ocasional.','Suplementación insuficiente.','Sin suplementación mineral.','100','Conforme','2026-11-08 14:59:13','2026-11-08 14:59:13'),
(22,1,24,24,'Protección contra temperaturas extremas','Los animales están protegidos de olas de calor o frío intenso.','VISUAL',2,'Libertad de incomodidad',0.20,NULL,'Protección completa contra temperaturas extremas.','Protección adecuada con algunas exposiciones.','Protección deficiente.','Sin protección contra temperaturas extremas.','100','Conforme','2026-11-08 14:59:13','2026-11-08 14:59:13'),
(23,1,25,25,'Sombra disponible en potreros','Existe sombra natural o artificial en los potreros.','VISUAL',2,'Libertad de incomodidad',0.20,NULL,'Sombra disponible en todo el potrero.','Sombra disponible en la mayoría del potrero.','Sombra limitada.','Sin sombra disponible.','100','Conforme','2026-11-08 14:59:13','2026-11-08 14:59:13'),
(24,1,26,26,'Vacunación al día','El calendario de vacunación está completo y actualizado.','DOCUMENTAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Todas las vacunas aplicadas al día.','Calendario de vacunación con algunos retrasos.','Vacunación incompleta.','Sin vacunación.','100','Conforme','2026-11-08 14:59:13','2026-11-08 14:59:13'),
(25,1,27,27,'Aislamiento de animales enfermos','Los animales enfermos se aislan para evitar contagios.','VISUAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Aislamiento adecuado de animales enfermos.','Aislamiento con algunas omisiones.','Poco aislamiento, riesgo de contagio.','Sin aislamiento de animales enfermos.','100','Conforme','2026-11-08 14:59:13','2026-11-08 14:59:13'),
(26,1,29,29,'Acceso al exterior o áreas abiertas','Los animales tienen acceso a áreas abiertas o exterior.','VISUAL',4,'Libertad de expresar comportamiento normal',0.10,NULL,'Acceso permanente a áreas abiertas.','Acceso regular con algunas restricciones.','Acceso limitado.','Sin acceso a exterior (encierro total).','100','Conforme','2026-11-08 14:59:13','2026-11-08 14:59:13'),
(27,1,30,30,'Oportunidad de pastoreo natural','Se permite el pastoreo natural según la especie.','VISUAL',4,'Libertad de expresar comportamiento normal',0.10,NULL,'Pastoreo natural permitido sin restricciones.','Pastoreo natural con algunas limitaciones.','Pastoreo muy limitado.','Sin pastoreo natural.','100','Conforme','2026-11-08 14:59:13','2026-11-08 14:59:13'),
(28,1,31,31,'Transporte sin estrés excesivo','Cuando se transporta, se minimiza el estrés de los animales.','VISUAL',5,'Libertad de miedo y angustia',0.15,NULL,'Transporte con manejo adecuado y bajo estrés.','Transporte con estrés moderado.','Transporte que causa estrés significativo.','Transporte que causa angustia severa.','100','Conforme','2026-11-08 14:59:13','2026-11-08 14:59:13'),
(29,1,32,32,'Evitar aglomeraciones innecesarias','Se evitan aglomeraciones que causen miedo o lesiones.','VISUAL',5,'Libertad de miedo y angustia',0.15,NULL,'Sin aglomeraciones innecesarias.','Aglomeraciones ocasionales sin impacto severo.','Aglomeraciones frecuentes.','Aglomeraciones constantes que causan lesiones.','100','Conforme','2026-11-08 14:59:13','2026-11-08 14:59:13'),
(30,1,33,33,'Frecuencia de suministro de agua','El agua se renueva con la frecuencia adecuada.','VISUAL',1,'Libertad de hambre y sed',0.20,NULL,'Agua renovada frecuentemente, siempre fresca.','Agua renovada regularmente.','Agua renovada con poca frecuencia.','Agua estancada o sin renovación.','100','Conforme','2026-11-08 14:59:13','2026-11-08 14:59:13'),
(31,1,35,35,'Control de moscas y vectores','Se controlan moscas y otros vectores de enfermedad.','VISUAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Control efectivo de moscas y vectores.','Control parcial de vectores.','Control deficiente.','Sin control de vectores.','100','Conforme','2026-11-08 14:59:13','2026-11-08 14:59:13'),
(32,1,36,36,'Higiene de las instalaciones','Las instalaciones se mantienen limpias e higienizadas.','VISUAL',3,'Libertad de dolor, lesión y enfermedad',0.35,NULL,'Instalaciones siempre limpias.','Instalaciones mayormente limpias.','Instalaciones frecuentemente sucias.','Instalaciones permanentemente sucias.','100','Conforme','2026-11-08 14:59:13','2026-11-08 14:59:13'),
(33,1,38,38,'Capacitación del personal en bienestar','El personal que maneja animales está capacitado en bienestar animal.','DOCUMENTAL',5,'Libertad de miedo y angustia',0.15,NULL,'Personal capacitado y certificado.','Personal con capacitación básica.','Personal con poca capacitación.','Sin capacitación en bienestar animal.','100','Conforme','2026-11-08 14:59:13','2026-11-08 14:59:13');
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
INSERT INTO `libertades` VALUES
(1,'Libertad de hambre y sed',0.20),
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
  CONSTRAINT `1` FOREIGN KEY (`responsable_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `2` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `predios`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `predios` WRITE;
/*!40000 ALTER TABLE `predios` DISABLE KEYS */;
INSERT INTO `predios` VALUES
(1,'Finca La Esperanza','San Gil','Vereda La Concordia, km 12','OVINO','EXTENSIVO',0,120,3,2,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(2,'Hato Los Alpes','Tunja','Vereda Las Acacias','OVINO','SEMI_INTENSIVO',1,85,3,2,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(3,'Granja Caprina El Roble','Villeta','Corregimiento El Tres','CAPRINO','INTENSIVO',0,45,3,2,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
(4,'Predio Familiar Los Nogales','Pamplona','Zona rural','OVINO','FAMILIAR',0,30,NULL,2,'2026-11-08 14:58:31','2026-11-08 14:58:31');
/*!40000 ALTER TABLE `predios` ENABLE KEYS */;
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
  CONSTRAINT `1` FOREIGN KEY (`evaluacion_id`) REFERENCES `evaluaciones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recomendaciones_ia`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `recomendaciones_ia` WRITE;
/*!40000 ALTER TABLE `recomendaciones_ia` DISABLE KEYS */;
INSERT INTO `recomendaciones_ia` VALUES
(1,1,'Recomendación generada por el modelo EBA-IA para la evaluación #1 del predio \"Finca La Esperanza\" (San Gil).\n\nEspecie: OVINO · Sistema productivo: EXTENSIVO · Puntaje total: 100.0 / 100 · Clasificación: EXCELENTE BIENESTAR.\n\nLa libertad con menor puntaje es \"Libertad de hambre y sed\" (100.0). Revisar prácticas asociadas a esta dimensión.\n\nObservaciones del evaluador: \"Prueba de integracion\".\n\nEsta recomendación es una orientación automática y no reemplaza el concepto técnico del ICA ni la evaluación de un veterinario colegiado.','EBA-IA-simulado-v1','2026-11-08 14:59:13','2026-11-08 14:59:13');
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
INSERT INTO `usuarios` VALUES
(1,'Administrador Sistema','admin@ica.gov.co','admin123','ADMIN',1,'2026-11-08 14:58:31','2026-11-08 14:58:31'),
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

-- Dump completed on 2026-11-08 10:25:12
