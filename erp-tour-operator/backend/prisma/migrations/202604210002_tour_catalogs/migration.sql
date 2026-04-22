CREATE TABLE `idioma` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  `activo` BOOLEAN NOT NULL DEFAULT true,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX `idioma_nombre_key`(`nombre`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `tipo_guia` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  `activo` BOOLEAN NOT NULL DEFAULT true,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX `tipo_guia_nombre_key`(`nombre`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `tipo_guia` (`nombre`, `activo`) VALUES
('GUIA', true),
('AUDIOGUIA', true);

INSERT INTO `idioma` (`nombre`, `activo`)
SELECT DISTINCT `idioma`, true
FROM `tour`
WHERE `idioma` IS NOT NULL AND TRIM(`idioma`) <> '';

ALTER TABLE `tour`
  ADD COLUMN `id_tipo_guia` INT NULL,
  ADD COLUMN `id_idioma` INT NULL;

UPDATE `tour` t
JOIN `tipo_guia` tg ON tg.nombre = t.tipo_guia
SET t.id_tipo_guia = tg.id;

UPDATE `tour` t
JOIN `idioma` i ON i.nombre = t.idioma
SET t.id_idioma = i.id;

ALTER TABLE `tour`
  MODIFY `id_tipo_guia` INT NOT NULL,
  MODIFY `id_idioma` INT NOT NULL;

ALTER TABLE `tour`
  ADD CONSTRAINT `tour_id_tipo_guia_fkey`
    FOREIGN KEY (`id_tipo_guia`) REFERENCES `tipo_guia`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `tour_id_idioma_fkey`
    FOREIGN KEY (`id_idioma`) REFERENCES `idioma`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX `idx_tour_tipo_guia` ON `tour`(`id_tipo_guia`);
CREATE INDEX `idx_tour_idioma` ON `tour`(`id_idioma`);

ALTER TABLE `tour`
  DROP COLUMN `tipo_guia`,
  DROP COLUMN `idioma`;