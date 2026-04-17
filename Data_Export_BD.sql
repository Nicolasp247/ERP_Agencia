CREATE DATABASE  IF NOT EXISTS `turismo_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `turismo_db`;
-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: turismo_db
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `alojamiento`
--

DROP TABLE IF EXISTS `alojamiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alojamiento` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_servicio` int NOT NULL,
  `noches` int NOT NULL,
  `habitaciones` int NOT NULL,
  `desayuno` tinyint(1) DEFAULT '1',
  `regimen` enum('SOLO_ALOJAMIENTO','ALOJAMIENTO_DESAYUNO','TODO_INCLUIDO','OTRO') DEFAULT NULL,
  `regimen_otro` varchar(80) DEFAULT NULL,
  `categoria_hotel` enum('H3_ECONOMICO','H3_SUPERIOR','H4_ECONOMICO','H4_SUPERIOR','H5_ECONOMICO','H5_SUPERIOR','LUJO_ECONOMICO','LUJO_SUPERIOR','OTRO') DEFAULT NULL,
  `categoria_hotel_otro` varchar(80) DEFAULT NULL,
  `categoria_hab` enum('ESTANDAR','SUPERIOR','SUITE','OTRO') DEFAULT NULL,
  `categoria_hab_otro` varchar(80) DEFAULT NULL,
  `proveedor_hotel` varchar(5) DEFAULT 'AEI',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_servicio` (`id_servicio`),
  CONSTRAINT `fk_aloja_servicio` FOREIGN KEY (`id_servicio`) REFERENCES `servicio` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alojamiento`
--

LOCK TABLES `alojamiento` WRITE;
/*!40000 ALTER TABLE `alojamiento` DISABLE KEYS */;
/*!40000 ALTER TABLE `alojamiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alojamiento_precio_mes`
--

DROP TABLE IF EXISTS `alojamiento_precio_mes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alojamiento_precio_mes` (
  `id_ciudad` int NOT NULL,
  `categoria` varchar(40) NOT NULL,
  `categoria_hab` varchar(40) NOT NULL DEFAULT 'ESTANDAR',
  `regimen` varchar(40) NOT NULL,
  `anio` int NOT NULL,
  `mes` tinyint NOT NULL,
  `tipo_habitacion` char(3) NOT NULL DEFAULT 'DBL',
  `precio_usd` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id_ciudad`,`categoria`,`categoria_hab`,`regimen`,`anio`,`mes`,`tipo_habitacion`),
  KEY `idx_aloj_precio_lookup` (`id_ciudad`,`anio`,`mes`,`categoria`,`categoria_hab`,`regimen`,`tipo_habitacion`),
  KEY `idx_aloj_precio_filtros` (`id_ciudad`,`categoria`,`categoria_hab`,`regimen`,`anio`),
  CONSTRAINT `fk_aloj_precio_ciudad` FOREIGN KEY (`id_ciudad`) REFERENCES `ciudad` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alojamiento_precio_mes`
--

LOCK TABLES `alojamiento_precio_mes` WRITE;
/*!40000 ALTER TABLE `alojamiento_precio_mes` DISABLE KEYS */;
/*!40000 ALTER TABLE `alojamiento_precio_mes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `boleto_entrada`
--

DROP TABLE IF EXISTS `boleto_entrada`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `boleto_entrada` (
  `id_servicio` int NOT NULL,
  `boleto_entrada` varchar(150) NOT NULL,
  `tipo_entrada` enum('ESTANDAR','PRIORITARIA','OTRA') NOT NULL DEFAULT 'ESTANDAR',
  `tipo_entrada_otro` varchar(80) DEFAULT NULL,
  `audioguia` tinyint(1) NOT NULL DEFAULT '0',
  `tipo_guia` varchar(50) DEFAULT NULL,
  `idioma` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id_servicio`),
  CONSTRAINT `fk_boleto_servicio` FOREIGN KEY (`id_servicio`) REFERENCES `servicio` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `boleto_entrada`
--

LOCK TABLES `boleto_entrada` WRITE;
/*!40000 ALTER TABLE `boleto_entrada` DISABLE KEYS */;
/*!40000 ALTER TABLE `boleto_entrada` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `catalogo_opcion`
--

DROP TABLE IF EXISTS `catalogo_opcion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `catalogo_opcion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `grupo` varchar(60) NOT NULL,
  `valor` varchar(120) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `valor_norm` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_grupo_valor` (`grupo`,`valor`),
  UNIQUE KEY `uq_catalogo` (`grupo`,`valor`),
  UNIQUE KEY `uq_catalogo_grupo_valor` (`grupo`,`valor`),
  UNIQUE KEY `uq_catalogo_grupo_valor_norm` (`grupo`,`valor_norm`)
) ENGINE=InnoDB AUTO_INCREMENT=102 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `catalogo_opcion`
--

LOCK TABLES `catalogo_opcion` WRITE;
/*!40000 ALTER TABLE `catalogo_opcion` DISABLE KEYS */;
INSERT INTO `catalogo_opcion` VALUES (100,'tour_tipo_guia','GUIA',1,'2026-03-29 20:04:24','guia'),(101,'idiomas','Español',1,'2026-03-29 20:04:24','español');
/*!40000 ALTER TABLE `catalogo_opcion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ciudad`
--

DROP TABLE IF EXISTS `ciudad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ciudad` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `id_pais` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_pais` (`id_pais`),
  CONSTRAINT `ciudad_ibfk_1` FOREIGN KEY (`id_pais`) REFERENCES `pais` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ciudad`
--

LOCK TABLES `ciudad` WRITE;
/*!40000 ALTER TABLE `ciudad` DISABLE KEYS */;
INSERT INTO `ciudad` VALUES (18,'MADRID',11),(19,'BARCELONA',11);
/*!40000 ALTER TABLE `ciudad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `continente`
--

DROP TABLE IF EXISTS `continente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `continente` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `continente`
--

LOCK TABLES `continente` WRITE;
/*!40000 ALTER TABLE `continente` DISABLE KEYS */;
INSERT INTO `continente` VALUES (4,'EUROPA'),(5,'AMERICA'),(6,'AFRICA');
/*!40000 ALTER TABLE `continente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cotizacion`
--

DROP TABLE IF EXISTS `cotizacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cotizacion` (
  `id_cotizacion` bigint unsigned NOT NULL AUTO_INCREMENT,
  `agente` varchar(20) NOT NULL,
  `nombre_pasajero` varchar(150) NOT NULL,
  `adultos_65` smallint unsigned NOT NULL DEFAULT '0',
  `adultos_19_64` smallint unsigned NOT NULL DEFAULT '0',
  `jovenes_12_18` smallint unsigned NOT NULL DEFAULT '0',
  `ninos_3_11` smallint unsigned NOT NULL DEFAULT '0',
  `infantes_0_2` smallint unsigned NOT NULL DEFAULT '0',
  `total_pasajeros` smallint unsigned NOT NULL,
  `categorias` varchar(100) DEFAULT NULL,
  `fecha_viaje` date NOT NULL,
  `destino` int DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `nombre_cotizacion` varchar(255) NOT NULL,
  `moneda_id` int unsigned DEFAULT NULL,
  `nota` text,
  PRIMARY KEY (`id_cotizacion`),
  UNIQUE KEY `uq_cotizacion_nombre` (`nombre_cotizacion`),
  KEY `idx_cotizacion_fecha_viaje` (`fecha_viaje`),
  KEY `idx_cotizacion_agente` (`agente`),
  KEY `idx_cotizacion_nombre` (`nombre_pasajero`),
  KEY `idx_cotizacion_nombre_auto` (`nombre_cotizacion`),
  KEY `fk_cotizacion_destino` (`destino`),
  CONSTRAINT `fk_cotizacion_destino` FOREIGN KEY (`destino`) REFERENCES `continente` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cotizacion`
--

LOCK TABLES `cotizacion` WRITE;
/*!40000 ALTER TABLE `cotizacion` DISABLE KEYS */;
INSERT INTO `cotizacion` VALUES (15,'Agente de prueba','Pasajero de prueba',1,2,0,1,0,4,'4*','2026-04-10',4,'2026-03-29 22:01:09','2604 EUR Agente de prueba Pasajero de prueba 4 personas',NULL,'Todo lo de aqui es de prueba');
/*!40000 ALTER TABLE `cotizacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cotizacion_item`
--

DROP TABLE IF EXISTS `cotizacion_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cotizacion_item` (
  `id_item` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_cotizacion` bigint unsigned NOT NULL,
  `id_servicio` bigint unsigned NOT NULL,
  `fecha_servicio` date NOT NULL,
  `orden_dia` smallint unsigned NOT NULL DEFAULT '1',
  `es_opcional` tinyint(1) NOT NULL DEFAULT '0',
  `operador_mostrado` varchar(150) DEFAULT NULL,
  `link_operador` varchar(255) DEFAULT NULL,
  `titulo_override` varchar(255) DEFAULT NULL,
  `clase_override` varchar(50) DEFAULT NULL,
  `idioma_override` varchar(50) DEFAULT NULL,
  `nota_linea` text,
  `precio_usd` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id_item`),
  KEY `idx_item_cotizacion` (`id_cotizacion`),
  KEY `idx_item_servicio` (`id_servicio`),
  KEY `idx_item_fecha` (`fecha_servicio`),
  CONSTRAINT `fk_item_cotizacion` FOREIGN KEY (`id_cotizacion`) REFERENCES `cotizacion` (`id_cotizacion`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=110 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cotizacion_item`
--

LOCK TABLES `cotizacion_item` WRITE;
/*!40000 ALTER TABLE `cotizacion_item` DISABLE KEYS */;
INSERT INTO `cotizacion_item` VALUES (109,15,9,'2026-04-29',1,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `cotizacion_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hotel`
--

DROP TABLE IF EXISTS `hotel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hotel` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `estrellas` decimal(2,1) NOT NULL,
  `booking_score` decimal(2,1) DEFAULT NULL,
  `tripadvisor_score` decimal(2,1) DEFAULT NULL,
  `descripcion` text,
  `link_booking` varchar(255) DEFAULT NULL,
  `link_tripadvisor` varchar(255) DEFAULT NULL,
  `id_ciudad` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_hotel_ciudad` (`id_ciudad`),
  CONSTRAINT `fk_hotel_ciudad` FOREIGN KEY (`id_ciudad`) REFERENCES `ciudad` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hotel`
--

LOCK TABLES `hotel` WRITE;
/*!40000 ALTER TABLE `hotel` DISABLE KEYS */;
/*!40000 ALTER TABLE `hotel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hotel_precio_mes`
--

DROP TABLE IF EXISTS `hotel_precio_mes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hotel_precio_mes` (
  `hotel_id` int NOT NULL,
  `categoria_hotel` varchar(40) NOT NULL,
  `categoria_hab` varchar(40) NOT NULL,
  `regimen` varchar(40) NOT NULL,
  `anio` int NOT NULL,
  `mes` tinyint NOT NULL,
  `tipo_habitacion` char(3) NOT NULL DEFAULT 'DBL',
  `precio_usd` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`hotel_id`,`categoria_hotel`,`categoria_hab`,`regimen`,`anio`,`mes`,`tipo_habitacion`),
  KEY `idx_hotel_precio_lookup` (`hotel_id`,`anio`,`mes`),
  KEY `idx_hotel_precio_filtros` (`hotel_id`,`categoria_hotel`,`categoria_hab`,`regimen`,`anio`),
  CONSTRAINT `fk_hotel_precio_hotel` FOREIGN KEY (`hotel_id`) REFERENCES `hotel` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hotel_precio_mes`
--

LOCK TABLES `hotel_precio_mes` WRITE;
/*!40000 ALTER TABLE `hotel_precio_mes` DISABLE KEYS */;
/*!40000 ALTER TABLE `hotel_precio_mes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hotelzona`
--

DROP TABLE IF EXISTS `hotelzona`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hotelzona` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hotel_id` int NOT NULL,
  `zona_id` int NOT NULL,
  `metros` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `hotel_id` (`hotel_id`),
  KEY `zona_id` (`zona_id`),
  CONSTRAINT `hotelzona_ibfk_1` FOREIGN KEY (`hotel_id`) REFERENCES `hotel` (`id`) ON DELETE CASCADE,
  CONSTRAINT `hotelzona_ibfk_2` FOREIGN KEY (`zona_id`) REFERENCES `zona` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hotelzona`
--

LOCK TABLES `hotelzona` WRITE;
/*!40000 ALTER TABLE `hotelzona` DISABLE KEYS */;
/*!40000 ALTER TABLE `hotelzona` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pais`
--

DROP TABLE IF EXISTS `pais`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pais` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `id_continente` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_continente` (`id_continente`),
  CONSTRAINT `pais_ibfk_1` FOREIGN KEY (`id_continente`) REFERENCES `continente` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pais`
--

LOCK TABLES `pais` WRITE;
/*!40000 ALTER TABLE `pais` DISABLE KEYS */;
INSERT INTO `pais` VALUES (11,'ESPAÑA',4),(12,'FRANCIA',4);
/*!40000 ALTER TABLE `pais` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedor`
--

DROP TABLE IF EXISTS `proveedor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedor` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `web` varchar(255) DEFAULT NULL,
  `iniciales` varchar(5) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `web` (`web`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedor`
--

LOCK TABLES `proveedor` WRITE;
/*!40000 ALTER TABLE `proveedor` DISABLE KEYS */;
INSERT INTO `proveedor` VALUES (4,'Civitatis','https://www.civitatis.com/es/agencias/?srsltid=AfmBOooGN-veHtW_DgkK4AooxTq-0mYNLsBx0vNJxD_MeEbo2SFP7GLZ','CVT'),(5,'American Executive','https://www.americanexecutive.net/login/?returnURL=%2Fhotels%2F','AEI'),(6,'Tren Italia','https://www.trenitalia.com/it.html','ITA');
/*!40000 ALTER TABLE `proveedor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servicio`
--

DROP TABLE IF EXISTS `servicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `servicio` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_tipo` int NOT NULL,
  `id_proveedor` int NOT NULL,
  `id_ciudad` int NOT NULL,
  `nombre_wtravel` varchar(120) NOT NULL,
  `tiempo_servicio` varchar(50) DEFAULT NULL,
  `privado` tinyint(1) DEFAULT '0',
  `descripcion` text,
  `link_reserva` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre_wtravel` (`nombre_wtravel`),
  KEY `fk_servicio_tipo` (`id_tipo`),
  KEY `fk_servicio_proveedor` (`id_proveedor`),
  KEY `fk_servicio_ciudad` (`id_ciudad`),
  CONSTRAINT `fk_servicio_ciudad` FOREIGN KEY (`id_ciudad`) REFERENCES `ciudad` (`id`),
  CONSTRAINT `fk_servicio_proveedor` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id`),
  CONSTRAINT `fk_servicio_tipo` FOREIGN KEY (`id_tipo`) REFERENCES `tiposervicio` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicio`
--

LOCK TABLES `servicio` WRITE;
/*!40000 ALTER TABLE `servicio` DISABLE KEYS */;
INSERT INTO `servicio` VALUES (9,4,4,18,'Excursión a Toledo y Segovia, en grupo, guía en español','11h',0,'Excursión a Toledo y Segovia','https://www.civitatis.com/es/madrid/excursion-toledo-segovia/');
/*!40000 ALTER TABLE `servicio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servicio_precio_mes`
--

DROP TABLE IF EXISTS `servicio_precio_mes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `servicio_precio_mes` (
  `id_servicio` int NOT NULL,
  `anio` smallint NOT NULL DEFAULT '2025',
  `mes` tinyint NOT NULL,
  `tipo_habitacion` enum('SGL','DBL','TPL') NOT NULL DEFAULT 'DBL',
  `precio_usd` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id_servicio`,`anio`,`mes`,`tipo_habitacion`),
  CONSTRAINT `fk_spm_servicio` FOREIGN KEY (`id_servicio`) REFERENCES `servicio` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicio_precio_mes`
--

LOCK TABLES `servicio_precio_mes` WRITE;
/*!40000 ALTER TABLE `servicio_precio_mes` DISABLE KEYS */;
INSERT INTO `servicio_precio_mes` VALUES (9,2026,1,'DBL',100.00),(9,2026,2,'DBL',200.00),(9,2026,3,'DBL',300.00),(9,2026,4,'DBL',400.00),(9,2026,5,'DBL',500.00),(9,2026,6,'DBL',600.00),(9,2026,7,'DBL',700.00),(9,2026,8,'DBL',800.00),(9,2026,9,'DBL',900.00),(9,2026,10,'DBL',1000.00),(9,2026,11,'DBL',1100.00),(9,2026,12,'DBL',1200.00);
/*!40000 ALTER TABLE `servicio_precio_mes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `serviciohora`
--

DROP TABLE IF EXISTS `serviciohora`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `serviciohora` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_servicio` int NOT NULL,
  `hora` time NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_hora_servicio` (`id_servicio`),
  CONSTRAINT `fk_hora_servicio` FOREIGN KEY (`id_servicio`) REFERENCES `servicio` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `serviciohora`
--

LOCK TABLES `serviciohora` WRITE;
/*!40000 ALTER TABLE `serviciohora` DISABLE KEYS */;
/*!40000 ALTER TABLE `serviciohora` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tiposervicio`
--

DROP TABLE IF EXISTS `tiposervicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tiposervicio` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tiposervicio`
--

LOCK TABLES `tiposervicio` WRITE;
/*!40000 ALTER TABLE `tiposervicio` DISABLE KEYS */;
INSERT INTO `tiposervicio` VALUES (1,'Alojamiento'),(5,'Boleto entrada'),(4,'Excursión'),(3,'Traslado'),(6,'Tren'),(2,'Visita'),(7,'Vuelo');
/*!40000 ALTER TABLE `tiposervicio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tour`
--

DROP TABLE IF EXISTS `tour`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tour` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_servicio` int NOT NULL,
  `tipo_guia` enum('GUIA','AUDIOGUIA') NOT NULL,
  `idioma` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tour_servicio` (`id_servicio`),
  CONSTRAINT `fk_tour_servicio` FOREIGN KEY (`id_servicio`) REFERENCES `servicio` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tour`
--

LOCK TABLES `tour` WRITE;
/*!40000 ALTER TABLE `tour` DISABLE KEYS */;
INSERT INTO `tour` VALUES (12,9,'GUIA','Español');
/*!40000 ALTER TABLE `tour` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `traslado`
--

DROP TABLE IF EXISTS `traslado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `traslado` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_servicio` int NOT NULL,
  `origen` varchar(100) NOT NULL,
  `destino` varchar(100) NOT NULL,
  `escalas` int NOT NULL DEFAULT '0',
  `vehiculo` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_traslado_servicio` (`id_servicio`),
  CONSTRAINT `fk_traslado_servicio` FOREIGN KEY (`id_servicio`) REFERENCES `servicio` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `traslado`
--

LOCK TABLES `traslado` WRITE;
/*!40000 ALTER TABLE `traslado` DISABLE KEYS */;
/*!40000 ALTER TABLE `traslado` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tren`
--

DROP TABLE IF EXISTS `tren`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tren` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_servicio` int NOT NULL,
  `origen` varchar(100) NOT NULL,
  `destino` varchar(100) NOT NULL,
  `escalas` int NOT NULL DEFAULT '0',
  `clase` varchar(50) NOT NULL,
  `sillas_reservadas` tinyint(1) NOT NULL DEFAULT '1',
  `equipaje` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tren_servicio` (`id_servicio`),
  CONSTRAINT `fk_tren_servicio` FOREIGN KEY (`id_servicio`) REFERENCES `servicio` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tren`
--

LOCK TABLES `tren` WRITE;
/*!40000 ALTER TABLE `tren` DISABLE KEYS */;
/*!40000 ALTER TABLE `tren` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `v_alojamiento_precio_mes`
--

DROP TABLE IF EXISTS `v_alojamiento_precio_mes`;
/*!50001 DROP VIEW IF EXISTS `v_alojamiento_precio_mes`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_alojamiento_precio_mes` AS SELECT 
 1 AS `id_ciudad`,
 1 AS `categoria_hotel`,
 1 AS `categoria_hab`,
 1 AS `regimen`,
 1 AS `anio`,
 1 AS `mes`,
 1 AS `tipo_habitacion`,
 1 AS `precio_usd`,
 1 AS `n_hoteles`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `vuelo`
--

DROP TABLE IF EXISTS `vuelo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vuelo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_servicio` int NOT NULL,
  `origen` varchar(100) NOT NULL,
  `destino` varchar(100) NOT NULL,
  `escalas` int NOT NULL DEFAULT '0',
  `clase` varchar(50) NOT NULL,
  `equipaje` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_vuelo_servicio` (`id_servicio`),
  CONSTRAINT `fk_vuelo_servicio` FOREIGN KEY (`id_servicio`) REFERENCES `servicio` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vuelo`
--

LOCK TABLES `vuelo` WRITE;
/*!40000 ALTER TABLE `vuelo` DISABLE KEYS */;
/*!40000 ALTER TABLE `vuelo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `zona`
--

DROP TABLE IF EXISTS `zona`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `zona` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `id_ciudad` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_ciudad` (`id_ciudad`),
  CONSTRAINT `zona_ibfk_1` FOREIGN KEY (`id_ciudad`) REFERENCES `ciudad` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `zona`
--

LOCK TABLES `zona` WRITE;
/*!40000 ALTER TABLE `zona` DISABLE KEYS */;
/*!40000 ALTER TABLE `zona` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `v_alojamiento_precio_mes`
--

/*!50001 DROP VIEW IF EXISTS `v_alojamiento_precio_mes`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_alojamiento_precio_mes` AS select `h`.`id_ciudad` AS `id_ciudad`,`hpm`.`categoria_hotel` AS `categoria_hotel`,`hpm`.`categoria_hab` AS `categoria_hab`,`hpm`.`regimen` AS `regimen`,`hpm`.`anio` AS `anio`,`hpm`.`mes` AS `mes`,`hpm`.`tipo_habitacion` AS `tipo_habitacion`,round(avg(`hpm`.`precio_usd`),2) AS `precio_usd`,count(0) AS `n_hoteles` from (`hotel_precio_mes` `hpm` join `hotel` `h` on((`h`.`id` = `hpm`.`hotel_id`))) where (`hpm`.`precio_usd` is not null) group by `h`.`id_ciudad`,`hpm`.`categoria_hotel`,`hpm`.`categoria_hab`,`hpm`.`regimen`,`hpm`.`anio`,`hpm`.`mes`,`hpm`.`tipo_habitacion` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-15 10:00:22
