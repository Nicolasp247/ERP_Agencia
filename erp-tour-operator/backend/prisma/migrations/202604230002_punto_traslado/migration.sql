CREATE TABLE `punto_traslado` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_ciudad` INT NOT NULL,
  `nombre` VARCHAR(150) NOT NULL,
  `activo` BOOLEAN NOT NULL DEFAULT true,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uq_punto_traslado_ciudad_nombre` (`id_ciudad`, `nombre`),
  INDEX `idx_punto_traslado_ciudad` (`id_ciudad`),
  CONSTRAINT `punto_traslado_id_ciudad_fkey`
    FOREIGN KEY (`id_ciudad`) REFERENCES `ciudad`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `punto_traslado` (`id_ciudad`, `nombre`, `activo`)
SELECT DISTINCT s.id_ciudad, t.origen, true
FROM `traslado` t
INNER JOIN `servicio` s ON s.id = t.id_servicio
WHERE t.origen IS NOT NULL AND TRIM(t.origen) <> '';

INSERT INTO `punto_traslado` (`id_ciudad`, `nombre`, `activo`)
SELECT DISTINCT s.id_ciudad, t.destino, true
FROM `traslado` t
INNER JOIN `servicio` s ON s.id = t.id_servicio
WHERE t.destino IS NOT NULL AND TRIM(t.destino) <> ''
AND NOT EXISTS (
  SELECT 1
  FROM `punto_traslado` pt
  WHERE pt.id_ciudad = s.id_ciudad
    AND pt.nombre = t.destino
);

ALTER TABLE `traslado`
  ADD COLUMN `id_origen` INT NULL,
  ADD COLUMN `id_destino` INT NULL;

UPDATE `traslado` t
INNER JOIN `servicio` s ON s.id = t.id_servicio
INNER JOIN `punto_traslado` po
  ON po.id_ciudad = s.id_ciudad
 AND po.nombre = t.origen
SET t.id_origen = po.id;

UPDATE `traslado` t
INNER JOIN `servicio` s ON s.id = t.id_servicio
INNER JOIN `punto_traslado` pd
  ON pd.id_ciudad = s.id_ciudad
 AND pd.nombre = t.destino
SET t.id_destino = pd.id;

ALTER TABLE `traslado`
  MODIFY `id_origen` INT NOT NULL,
  MODIFY `id_destino` INT NOT NULL;

ALTER TABLE `traslado`
  ADD CONSTRAINT `traslado_id_origen_fkey`
    FOREIGN KEY (`id_origen`) REFERENCES `punto_traslado`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `traslado_id_destino_fkey`
    FOREIGN KEY (`id_destino`) REFERENCES `punto_traslado`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX `idx_traslado_origen` ON `traslado`(`id_origen`);
CREATE INDEX `idx_traslado_destino` ON `traslado`(`id_destino`);

ALTER TABLE `traslado`
  DROP COLUMN `origen`,
  DROP COLUMN `destino`;