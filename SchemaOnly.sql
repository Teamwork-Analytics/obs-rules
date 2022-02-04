CREATE DATABASE  IF NOT EXISTS `MonashAugustDataCollection` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `MonashAugustDataCollection`;
-- MySQL dump 10.13  Distrib 8.0.16, for macos10.14 (x86_64)
--
-- Host: ec2-54-79-7-209.ap-southeast-2.compute.amazonaws.com    Database: MonashAugustDataCollection
-- ------------------------------------------------------
-- Server version	5.5.68-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
 SET NAMES utf8 ;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `action_session`
--

DROP TABLE IF EXISTS `action_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `action_session` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_session` int(11) NOT NULL,
  `id_action` int(11) NOT NULL,
  `action_desc` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_action_sess_action_idx` (`id_action`),
  KEY `fk_action_sess_session_idx` (`id_session`),
  CONSTRAINT `fk_action_sess_action` FOREIGN KEY (`id_action`) REFERENCES `actions` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_action_sess_session` FOREIGN KEY (`id_session`) REFERENCES `session` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=3112 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `action_session_object`
--

DROP TABLE IF EXISTS `action_session_object`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `action_session_object` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_session` int(11) NOT NULL,
  `id_action` int(11) NOT NULL,
  `id_object` int(11) DEFAULT NULL,
  `action_desc` varchar(200) NOT NULL,
  `time_action` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `param_value` varchar(100) DEFAULT NULL,
  `duration` time(6) DEFAULT NULL,
  `mseconds` int(11) DEFAULT NULL,
  `id_actionsession` int(11) DEFAULT NULL,
  `notes` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_action_session_action_idx1` (`id_action`),
  KEY `fk_action_session_sess_idx` (`id_session`),
  KEY `fk_action_session_objsess_idx` (`id_object`),
  KEY `fk_action_session_act_sess_idx` (`id_actionsession`),
  CONSTRAINT `fk_action_session_act_sess` FOREIGN KEY (`id_actionsession`) REFERENCES `action_session` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_action_session_action` FOREIGN KEY (`id_action`) REFERENCES `actions` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_action_session_objsess` FOREIGN KEY (`id_object`) REFERENCES `object_session` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_action_session_sess` FOREIGN KEY (`id_session`) REFERENCES `session` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=4040 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `MonashAugustDataCollection`.`action_session_BEFORE_INSERT` BEFORE INSERT ON `action_session_object` FOR EACH ROW
BEGIN
DECLARE x TIMESTAMP;
	IF (NEW.time_action IS NULL OR NEW.time_action = '') THEN
    
		SET x = (SELECT time_action FROM action_session_object WHERE id_session = NEW.id_session AND action_desc = 'Session started'); 
		SET NEW.time_action = TIMESTAMPADD(SECOND,NEW.mseconds/1000,x);
        SET NEW.duration = TIMEDIFF(NEW.time_action,x);
    END IF;
    
    IF (NEW.time_action IS NOT NULL OR NEW.id_object IS NOT NULL) THEN
		SET x = (SELECT time_action FROM action_session_object WHERE id_session = NEW.id_session AND action_desc = 'Session started'); 
        SET NEW.duration = TIMEDIFF(NEW.time_action,x);
    END IF;
    
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `MonashAugustDataCollection`.`action_session_BEFORE_UPDATE` BEFORE UPDATE ON `action_session_object` FOR EACH ROW
BEGIN
DECLARE x TIMESTAMP;
	IF (NEW.time_action IS NULL OR NEW.time_action = '') THEN
    
		SET x = (SELECT time_action FROM action_session_object WHERE id_session = NEW.id_session AND action_desc = 'Session started'); 
		SET NEW.time_action = TIMESTAMPADD(SECOND,NEW.mseconds/1000,x);
        SET NEW.duration = TIMEDIFF(NEW.time_action,x);
    END IF;
    
    IF (NEW.time_action IS NOT NULL OR NEW.id_object IS NOT NULL) THEN
		SET x = (SELECT time_action FROM action_session_object WHERE id_session = NEW.id_session AND action_desc = 'Session started'); 
        SET NEW.duration = TIMEDIFF(NEW.time_action,x);
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `action_session_rules`
--

DROP TABLE IF EXISTS `action_session_rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `action_session_rules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_actionsession` int(11) NOT NULL,
  `id_action` int(11) DEFAULT NULL,
  `time_response` time(5) DEFAULT NULL,
  `parameter` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_id_actionsession_idx` (`id_actionsession`),
  KEY `fk_id_action_idx` (`id_action`),
  CONSTRAINT `fk_id_action` FOREIGN KEY (`id_action`) REFERENCES `actions` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_id_actionsession` FOREIGN KEY (`id_actionsession`) REFERENCES `action_session` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `actions`
--

DROP TABLE IF EXISTS `actions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `actions` (
  `name` varchar(255) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `action_type` varchar(45) DEFAULT NULL,
  `action_subclass` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=240 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `datatype`
--

DROP TABLE IF EXISTS `datatype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `datatype` (
  `name` varchar(20) DEFAULT NULL,
  `vendor_name` varchar(30) DEFAULT NULL,
  `id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `datatype_session`
--

DROP TABLE IF EXISTS `datatype_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `datatype_session` (
  `start_capture` timestamp NULL DEFAULT NULL,
  `end_capture` timestamp NULL DEFAULT NULL,
  `file_log` varchar(250) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  `id_session` int(11) NOT NULL,
  `id_datatype` int(11) NOT NULL,
  `id_session_datatype` int(11) NOT NULL,
  `status` int(11) DEFAULT '0',
  `id_empatica` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`id_session`,`id_datatype`,`id_session_datatype`),
  KEY `fk_datatype_session_datatype1_idx` (`id_datatype`),
  KEY `fk_datatype_session_idx` (`id_session`),
  KEY `fk_empatica_serial_idx` (`id_empatica`),
  CONSTRAINT `fk_datatype` FOREIGN KEY (`id_datatype`) REFERENCES `datatype` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_datatype_session` FOREIGN KEY (`id_session`) REFERENCES `session` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_empatica_serial` FOREIGN KEY (`id_empatica`) REFERENCES `trackers` (`serial`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `location_data_session`
--

DROP TABLE IF EXISTS `location_data_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `location_data_session` (
  `id_tag` varchar(25) NOT NULL,
  `x` float DEFAULT NULL,
  `y` float DEFAULT NULL,
  `z` float DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT NULL,
  `id_session` int(11) NOT NULL,
  `acc_x` float DEFAULT NULL,
  `time_from_start` time(6) DEFAULT NULL,
  `acc_y` float DEFAULT NULL,
  `acc_z` float DEFAULT NULL,
  `yaw` float DEFAULT NULL,
  `pitch` float DEFAULT NULL,
  `roll` float DEFAULT NULL,
  KEY `fk_session_idx` (`id_session`),
  KEY `fk_locdatasession_tracker_idx` (`id_tag`),
  CONSTRAINT `fk_locdatasession_tracker` FOREIGN KEY (`id_tag`) REFERENCES `trackers` (`serial`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_session` FOREIGN KEY (`id_session`) REFERENCES `session` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `MonashAugustDataCollection`.`location_data_session_BEFORE_INSERT` BEFORE INSERT ON `location_data_session` FOR EACH ROW
BEGIN
	DECLARE x TIMESTAMP;
	SET x = (SELECT action_session.time_action FROM action_session WHERE action_session.id_session = NEW.id_session AND action_session.id_action = 8); 
	SET NEW.time_from_start = ABS(TIMEDIFF(x,NEW.timestamp));
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `MonashAugustDataCollection`.`location_data_session_BEFORE_UPDATE` BEFORE UPDATE ON `location_data_session` FOR EACH ROW
BEGIN
	DECLARE x TIMESTAMP;
	SET x = (SELECT action_session.time_action FROM action_session WHERE action_session.id_session = NEW.id_session AND action_session.id_action = 8); 
	SET NEW.time_from_start = ABS(TIMEDIFF(x,NEW.timestamp));
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `object_session`
--

DROP TABLE IF EXISTS `object_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `object_session` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `serial` varchar(25) DEFAULT NULL,
  `id_object` int(11) NOT NULL,
  `id_session` int(11) NOT NULL,
  `type` varchar(45) DEFAULT NULL,
  `empatica` varchar(25) DEFAULT NULL,
  `coordinates` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_objsess_obj_idx` (`id_object`),
  KEY `fk_objsess_session_idx` (`id_session`),
  KEY `fk_objsess_tracker_idx` (`serial`),
  KEY `fk_objsess_empatica_idx` (`empatica`),
  CONSTRAINT `fk_objsess_empatica` FOREIGN KEY (`empatica`) REFERENCES `trackers` (`serial`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_objsess_obj` FOREIGN KEY (`id_object`) REFERENCES `objects` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_objsess_session` FOREIGN KEY (`id_session`) REFERENCES `session` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_objsess_tracker` FOREIGN KEY (`serial`) REFERENCES `trackers` (`serial`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1396 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `objects`
--

DROP TABLE IF EXISTS `objects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `objects` (
  `name` varchar(20) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rules`
--

DROP TABLE IF EXISTS `rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `rules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `type` int(11) NOT NULL,
  `id_session` int(11) NOT NULL,
  `id_first_act` int(11) DEFAULT NULL,
  `id_second_act` int(11) DEFAULT NULL,
  `magnitude` varchar(20) NOT NULL,
  `value_of_mag` varchar(10) NOT NULL,
  `feedback_ok` varchar(2000) NOT NULL,
  `feedback_wrong` varchar(2000) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `type_idx` (`type`),
  KEY `type_of_rule_idx` (`type`),
  KEY `id_session_idx` (`id_session`),
  KEY `id_first_act_idx` (`id_first_act`,`id_second_act`),
  CONSTRAINT `id_session` FOREIGN KEY (`id_session`) REFERENCES `session` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `type` FOREIGN KEY (`type`) REFERENCES `rules_obs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=429 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rules_obs`
--

DROP TABLE IF EXISTS `rules_obs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `rules_obs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(70) NOT NULL,
  `description` varchar(80) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `session`
--

DROP TABLE IF EXISTS `session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `session` (
  `time_start` timestamp NULL DEFAULT NULL,
  `time_end` timestamp NULL DEFAULT NULL,
  `session_date` date DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  `room` varchar(15) DEFAULT NULL,
  `description` varchar(250) DEFAULT NULL,
  `config_file` varchar(250) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `duration` time(6) DEFAULT '00:00:00.000000',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=223 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `MonashAugustDataCollection`.`session_BEFORE_UPDATE` BEFORE UPDATE ON `session` FOR EACH ROW
BEGIN
	
            SET NEW.duration = timediff(NEW.time_end,OLD.time_start);
        
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `trackers`
--

DROP TABLE IF EXISTS `trackers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `trackers` (
  `type` varchar(45) NOT NULL,
  `serial` varchar(25) NOT NULL,
  PRIMARY KEY (`serial`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping events for database 'MonashAugustDataCollection'
--

--
-- Dumping routines for database 'MonashAugustDataCollection'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-12-27 13:14:23
