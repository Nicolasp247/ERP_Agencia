-- CreateTable
CREATE TABLE `continente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pais` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `id_continente` INTEGER NULL,

    INDEX `id_continente`(`id_continente`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ciudad` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `id_pais` INTEGER NULL,

    INDEX `id_pais`(`id_pais`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tiposervicio` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,
    `codigo` VARCHAR(20) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tiposervicio_nombre_key`(`nombre`),
    UNIQUE INDEX `tiposervicio_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cliente_agente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(20) NOT NULL,
    `razon_social` VARCHAR(150) NOT NULL,
    `nombre_contacto` VARCHAR(120) NULL,
    `telefono` VARCHAR(40) NULL,
    `email` VARCHAR(120) NULL,
    `direccion` VARCHAR(255) NULL,
    `nit` VARCHAR(60) NULL,
    `id_pais` INTEGER NULL,
    `id_ciudad` INTEGER NULL,
    `comision_base_pct` DECIMAL(5, 2) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,

    UNIQUE INDEX `uq_cliente_agente_codigo`(`codigo`),
    INDEX `idx_cliente_agente_razon_social`(`razon_social`),
    INDEX `idx_cliente_agente_activo`(`activo`),
    INDEX `idx_cliente_agente_pais`(`id_pais`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cliente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_cliente_agente` INTEGER NULL,
    `nombre_completo` VARCHAR(150) NOT NULL,
    `telefono` VARCHAR(40) NULL,
    `email` VARCHAR(120) NULL,
    `id_pais` INTEGER NULL,
    `id_ciudad` INTEGER NULL,
    `observaciones` TEXT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,

    INDEX `idx_cliente_nombre`(`nombre_completo`),
    INDEX `idx_cliente_agente`(`id_cliente_agente`),
    INDEX `idx_cliente_activo`(`activo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proveedor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(10) NULL,
    `nombre_comercial` VARCHAR(100) NOT NULL,
    `sitio_web` VARCHAR(255) NULL,
    `id_pais` INTEGER NULL,
    `id_ciudad` INTEGER NULL,
    `observaciones` TEXT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,

    UNIQUE INDEX `proveedor_codigo_key`(`codigo`),
    INDEX `idx_proveedor_nombre`(`nombre_comercial`),
    INDEX `idx_proveedor_activo`(`activo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proveedor_contacto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_proveedor` INTEGER NOT NULL,
    `nombre_contacto` VARCHAR(120) NULL,
    `email` VARCHAR(120) NOT NULL,
    `telefono` VARCHAR(40) NULL,
    `cargo` VARCHAR(80) NULL,
    `principal` BOOLEAN NOT NULL DEFAULT false,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_proveedor_contacto_proveedor`(`id_proveedor`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `servicio` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_tipo` INTEGER NOT NULL,
    `id_proveedor` INTEGER NOT NULL,
    `id_ciudad` INTEGER NOT NULL,
    `nombre_wtravel` VARCHAR(120) NOT NULL,
    `tiempo_servicio` VARCHAR(50) NULL,
    `privado` BOOLEAN NOT NULL DEFAULT false,
    `descripcion` TEXT NULL,
    `link_reserva` VARCHAR(255) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,

    UNIQUE INDEX `servicio_nombre_wtravel_key`(`nombre_wtravel`),
    INDEX `idx_servicio_activo_tipo_ciudad`(`activo`, `id_tipo`, `id_ciudad`),
    INDEX `idx_servicio_proveedor_tipo`(`id_proveedor`, `id_tipo`),
    INDEX `idx_servicio_nombre_busqueda`(`nombre_wtravel`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `alojamiento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_servicio` INTEGER NOT NULL,
    `noches` INTEGER NOT NULL,
    `habitaciones` INTEGER NOT NULL,
    `desayuno` BOOLEAN NOT NULL DEFAULT true,
    `regimen` ENUM('SOLO_ALOJAMIENTO', 'ALOJAMIENTO_DESAYUNO', 'TODO_INCLUIDO', 'OTRO') NULL,
    `regimen_otro` VARCHAR(80) NULL,
    `categoria_hotel` ENUM('H3_ECONOMICO', 'H3_SUPERIOR', 'H4_ECONOMICO', 'H4_SUPERIOR', 'H5_ECONOMICO', 'H5_SUPERIOR', 'LUJO_ECONOMICO', 'LUJO_SUPERIOR', 'OTRO') NULL,
    `categoria_hotel_otro` VARCHAR(80) NULL,
    `categoria_hab` ENUM('ESTANDAR', 'SUPERIOR', 'SUITE', 'OTRO') NULL,
    `categoria_hab_otro` VARCHAR(80) NULL,
    `proveedor_hotel` VARCHAR(10) NULL,

    UNIQUE INDEX `alojamiento_id_servicio_key`(`id_servicio`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `boleto_entrada` (
    `id_servicio` INTEGER NOT NULL,
    `boleto_entrada` VARCHAR(150) NOT NULL,
    `tipo_entrada` ENUM('ESTANDAR', 'PRIORITARIA', 'OTRA') NOT NULL DEFAULT 'ESTANDAR',
    `tipo_entrada_otro` VARCHAR(80) NULL,
    `audioguia` BOOLEAN NOT NULL DEFAULT false,
    `tipo_guia` VARCHAR(50) NULL,
    `idioma` VARCHAR(40) NULL,

    PRIMARY KEY (`id_servicio`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tour` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_servicio` INTEGER NOT NULL,
    `tipo_guia` ENUM('GUIA', 'AUDIOGUIA') NOT NULL,
    `idioma` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `uq_tour_servicio`(`id_servicio`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `traslado` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_servicio` INTEGER NOT NULL,
    `origen` VARCHAR(100) NOT NULL,
    `destino` VARCHAR(100) NOT NULL,
    `escalas` INTEGER NOT NULL DEFAULT 0,
    `vehiculo` VARCHAR(50) NULL,

    UNIQUE INDEX `uq_traslado_servicio`(`id_servicio`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tren` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_servicio` INTEGER NOT NULL,
    `origen` VARCHAR(100) NOT NULL,
    `destino` VARCHAR(100) NOT NULL,
    `escalas` INTEGER NOT NULL DEFAULT 0,
    `clase` VARCHAR(50) NOT NULL,
    `sillas_reservadas` BOOLEAN NOT NULL DEFAULT true,
    `equipaje` VARCHAR(255) NULL,

    UNIQUE INDEX `uq_tren_servicio`(`id_servicio`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vuelo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_servicio` INTEGER NOT NULL,
    `origen` VARCHAR(100) NOT NULL,
    `destino` VARCHAR(100) NOT NULL,
    `escalas` INTEGER NOT NULL DEFAULT 0,
    `clase` VARCHAR(50) NOT NULL,
    `equipaje` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `uq_vuelo_servicio`(`id_servicio`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `servicio_precio_mes` (
    `id_servicio` INTEGER NOT NULL,
    `anio` INTEGER NOT NULL,
    `mes` INTEGER NOT NULL,
    `tipo_habitacion` CHAR(3) NOT NULL,
    `precio_usd` DECIMAL(10, 2) NULL,
    `moneda_codigo` CHAR(3) NOT NULL DEFAULT 'USD',
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_servicio`, `anio`, `mes`, `tipo_habitacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hotel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `estrellas` DECIMAL(2, 1) NOT NULL,
    `booking_score` DECIMAL(2, 1) NULL,
    `tripadvisor_score` DECIMAL(2, 1) NULL,
    `descripcion` TEXT NULL,
    `link_booking` VARCHAR(255) NULL,
    `link_tripadvisor` VARCHAR(255) NULL,
    `id_ciudad` INTEGER NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `fk_hotel_ciudad`(`id_ciudad`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hotel_precio_mes` (
    `hotel_id` INTEGER NOT NULL,
    `categoria_hotel` VARCHAR(40) NOT NULL,
    `categoria_hab` VARCHAR(40) NOT NULL,
    `regimen` VARCHAR(40) NOT NULL,
    `anio` INTEGER NOT NULL,
    `mes` INTEGER NOT NULL,
    `tipo_habitacion` CHAR(3) NOT NULL,
    `precio_usd` DECIMAL(10, 2) NULL,
    `moneda_codigo` CHAR(3) NOT NULL DEFAULT 'USD',
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_hotel_precio_lookup`(`hotel_id`, `anio`, `mes`),
    INDEX `idx_hotel_precio_filtros`(`hotel_id`, `categoria_hotel`, `categoria_hab`, `regimen`, `anio`),
    PRIMARY KEY (`hotel_id`, `categoria_hotel`, `categoria_hab`, `regimen`, `anio`, `mes`, `tipo_habitacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `alojamiento_precio_mes` (
    `id_ciudad` INTEGER NOT NULL,
    `categoria` VARCHAR(40) NOT NULL,
    `categoria_hab` VARCHAR(40) NOT NULL,
    `regimen` VARCHAR(40) NOT NULL,
    `anio` INTEGER NOT NULL,
    `mes` INTEGER NOT NULL,
    `tipo_habitacion` CHAR(3) NOT NULL,
    `precio_usd` DECIMAL(10, 2) NULL,
    `moneda_codigo` CHAR(3) NOT NULL DEFAULT 'USD',
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_aloj_precio_lookup`(`id_ciudad`, `anio`, `mes`, `categoria`, `categoria_hab`, `regimen`, `tipo_habitacion`),
    INDEX `idx_aloj_precio_filtros`(`id_ciudad`, `categoria`, `categoria_hab`, `regimen`, `anio`),
    PRIMARY KEY (`id_ciudad`, `categoria`, `categoria_hab`, `regimen`, `anio`, `mes`, `tipo_habitacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `catalogo_opcion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `grupo` VARCHAR(60) NOT NULL,
    `valor` VARCHAR(120) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `valor_norm` VARCHAR(255) NOT NULL,

    INDEX `idx_catalogo_opcion_grupo_activo`(`grupo`, `activo`),
    UNIQUE INDEX `uq_grupo_valor`(`grupo`, `valor`),
    UNIQUE INDEX `uq_catalogo_grupo_valor_norm`(`grupo`, `valor_norm`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(120) NOT NULL,
    `email` VARCHAR(120) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuario_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rol` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(50) NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `rol_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario_rol` (
    `id_usuario` INTEGER NOT NULL,
    `id_rol` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_usuario`, `id_rol`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cotizacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_cliente` INTEGER NOT NULL,
    `id_cliente_agente` INTEGER NULL,
    `nombre_cotizacion` VARCHAR(255) NOT NULL,
    `estado` ENUM('ACTIVA', 'DESCARTADA', 'CONVERTIDA_RESERVA') NOT NULL DEFAULT 'ACTIVA',
    `fecha_viaje_principal` DATE NOT NULL,
    `id_destino_principal` INTEGER NULL,
    `categoria_viaje` VARCHAR(50) NULL,
    `moneda_codigo` CHAR(3) NOT NULL DEFAULT 'USD',
    `presupuesto_estimado` DECIMAL(12, 2) NULL,
    `presupuesto_tipo` ENUM('POR_PERSONA', 'TOTAL') NULL,
    `comision_pct_aplicada` DECIMAL(5, 2) NULL,
    `margen_aplicado_valor` DECIMAL(12, 2) NULL,
    `adultos_65` INTEGER NOT NULL DEFAULT 0,
    `adultos_19_64` INTEGER NOT NULL DEFAULT 0,
    `jovenes_12_18` INTEGER NOT NULL DEFAULT 0,
    `ninos_3_11` INTEGER NOT NULL DEFAULT 0,
    `infantes_0_2` INTEGER NOT NULL DEFAULT 0,
    `total_pasajeros` INTEGER NOT NULL,
    `nota` TEXT NULL,
    `fecha_descartada` DATETIME(3) NULL,
    `fecha_convertida_reserva` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,

    INDEX `idx_cotizacion_estado_fecha`(`estado`, `fecha_viaje_principal`),
    INDEX `idx_cotizacion_cliente`(`id_cliente`),
    INDEX `idx_cotizacion_cliente_agente`(`id_cliente_agente`),
    INDEX `idx_cotizacion_fecha_viaje`(`fecha_viaje_principal`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cotizacion_item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_cotizacion` INTEGER NOT NULL,
    `id_servicio` INTEGER NOT NULL,
    `fecha_servicio` DATE NOT NULL,
    `orden_dia` INTEGER NOT NULL,
    `es_opcional` BOOLEAN NOT NULL DEFAULT false,
    `operador_mostrado` VARCHAR(150) NULL,
    `link_operador` VARCHAR(255) NULL,
    `titulo_override` VARCHAR(255) NULL,
    `clase_override` VARCHAR(50) NULL,
    `idioma_override` VARCHAR(50) NULL,
    `nota_linea` TEXT NULL,
    `precio_sugerido` DECIMAL(12, 2) NULL,
    `precio_venta` DECIMAL(12, 2) NULL,
    `precio_moneda_codigo` CHAR(3) NOT NULL DEFAULT 'USD',
    `precio_editado_manual` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_cot_item_cotizacion_orden`(`id_cotizacion`, `orden_dia`),
    INDEX `idx_cot_item_fecha`(`fecha_servicio`),
    INDEX `idx_cot_item_servicio`(`id_servicio`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reserva` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_cotizacion_origen` INTEGER NOT NULL,
    `id_cliente` INTEGER NOT NULL,
    `id_cliente_agente` INTEGER NULL,
    `codigo_reserva` VARCHAR(50) NOT NULL,
    `estado` ENUM('PENDIENTE', 'PARCIALMENTE_CONFIRMADA', 'CONFIRMADA', 'CANCELADA') NOT NULL DEFAULT 'PENDIENTE',
    `confirmacion_comercial_estado` ENUM('NO_CONFIRMADA', 'CONFIRMADA') NOT NULL DEFAULT 'NO_CONFIRMADA',
    `fecha_viaje_principal` DATE NOT NULL,
    `id_destino_principal` INTEGER NULL,
    `categoria_viaje` VARCHAR(50) NULL,
    `moneda_codigo` CHAR(3) NOT NULL DEFAULT 'USD',
    `total_pasajeros` INTEGER NOT NULL,
    `adultos_65` INTEGER NOT NULL DEFAULT 0,
    `adultos_19_64` INTEGER NOT NULL DEFAULT 0,
    `jovenes_12_18` INTEGER NOT NULL DEFAULT 0,
    `ninos_3_11` INTEGER NOT NULL DEFAULT 0,
    `infantes_0_2` INTEGER NOT NULL DEFAULT 0,
    `comision_pct_snapshot` DECIMAL(5, 2) NULL,
    `nota` TEXT NULL,
    `fecha_conversion` DATETIME(3) NOT NULL,
    `fecha_cancelacion` DATETIME(3) NULL,
    `motivo_cancelacion` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,

    UNIQUE INDEX `uq_reserva_cotizacion_origen`(`id_cotizacion_origen`),
    UNIQUE INDEX `uq_reserva_codigo`(`codigo_reserva`),
    INDEX `idx_reserva_estado`(`estado`),
    INDEX `idx_reserva_cliente_agente`(`id_cliente_agente`),
    INDEX `idx_reserva_fecha_viaje`(`fecha_viaje_principal`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reserva_item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_reserva` INTEGER NOT NULL,
    `id_cotizacion_item_origen` INTEGER NOT NULL,
    `id_servicio` INTEGER NOT NULL,
    `fecha_servicio` DATE NOT NULL,
    `orden_dia` INTEGER NOT NULL,
    `es_opcional` BOOLEAN NOT NULL DEFAULT false,
    `titulo_snapshot` VARCHAR(255) NULL,
    `idioma_snapshot` VARCHAR(50) NULL,
    `clase_snapshot` VARCHAR(50) NULL,
    `nota_linea_snapshot` TEXT NULL,
    `costo_cotizado` DECIMAL(12, 2) NULL,
    `costo_final` DECIMAL(12, 2) NULL,
    `moneda_codigo` CHAR(3) NOT NULL DEFAULT 'USD',
    `numero_confirmacion` VARCHAR(120) NULL,
    `fecha_primer_confirmacion` DATETIME(3) NULL,
    `fecha_ultima_confirmacion` DATETIME(3) NULL,
    `estado_item` ENUM('PENDIENTE', 'CONFIRMADO', 'CANCELADO', 'NO_APLICA') NOT NULL DEFAULT 'PENDIENTE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_res_item_reserva_orden`(`id_reserva`, `orden_dia`),
    INDEX `idx_res_item_num_confirmacion`(`numero_confirmacion`),
    INDEX `idx_res_item_estado`(`estado_item`),
    INDEX `idx_res_item_fecha`(`fecha_servicio`),
    INDEX `idx_res_item_servicio`(`id_servicio`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reserva_confirmacion_comercial` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_reserva` INTEGER NOT NULL,
    `version` INTEGER NOT NULL,
    `estado` ENUM('ACTIVA', 'REEMPLAZADA') NOT NULL DEFAULT 'ACTIVA',
    `total_venta_confirmada` DECIMAL(12, 2) NOT NULL,
    `moneda_codigo` CHAR(3) NOT NULL DEFAULT 'USD',
    `observacion` TEXT NULL,
    `fecha_confirmacion` DATETIME(3) NOT NULL,
    `confirmed_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_reserva_confirmacion_estado`(`id_reserva`, `estado`),
    UNIQUE INDEX `uq_reserva_confirmacion_version`(`id_reserva`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reserva_confirmacion_comercial_item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_confirmacion_comercial` INTEGER NOT NULL,
    `id_reserva_item` INTEGER NOT NULL,
    `precio_venta_confirmado` DECIMAL(12, 2) NOT NULL,
    `es_opcional_vendido` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `uq_confirmacion_item_reserva_item`(`id_confirmacion_comercial`, `id_reserva_item`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `liquidacion_reserva` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_reserva` INTEGER NOT NULL,
    `total_venta_confirmada` DECIMAL(12, 2) NOT NULL,
    `total_costo_real` DECIMAL(12, 2) NOT NULL,
    `utilidad_bruta_total` DECIMAL(12, 2) NOT NULL,
    `utilidad_por_persona` DECIMAL(12, 2) NULL,
    `valor_agencia` DECIMAL(12, 2) NULL,
    `diferencia_cotizado_vs_real` DECIMAL(12, 2) NULL,
    `moneda_codigo` CHAR(3) NOT NULL DEFAULT 'USD',
    `estado_cierre` ENUM('ABIERTA', 'CERRADA') NOT NULL DEFAULT 'ABIERTA',
    `fecha_calculo` DATETIME(3) NOT NULL,
    `fecha_cierre` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uq_liquidacion_reserva`(`id_reserva`),
    INDEX `idx_liquidacion_estado`(`estado_cierre`),
    INDEX `idx_liquidacion_fecha`(`fecha_calculo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auditoria_evento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `entidad` VARCHAR(60) NOT NULL,
    `entidad_id` INTEGER NOT NULL,
    `accion` VARCHAR(60) NOT NULL,
    `valor_anterior` JSON NULL,
    `valor_nuevo` JSON NULL,
    `fecha_evento` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `id_usuario` INTEGER NULL,

    INDEX `idx_auditoria_entidad`(`entidad`, `entidad_id`),
    INDEX `idx_auditoria_fecha`(`fecha_evento`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pais` ADD CONSTRAINT `pais_id_continente_fkey` FOREIGN KEY (`id_continente`) REFERENCES `continente`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ciudad` ADD CONSTRAINT `ciudad_id_pais_fkey` FOREIGN KEY (`id_pais`) REFERENCES `pais`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cliente_agente` ADD CONSTRAINT `cliente_agente_id_pais_fkey` FOREIGN KEY (`id_pais`) REFERENCES `pais`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cliente_agente` ADD CONSTRAINT `cliente_agente_id_ciudad_fkey` FOREIGN KEY (`id_ciudad`) REFERENCES `ciudad`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cliente` ADD CONSTRAINT `cliente_id_cliente_agente_fkey` FOREIGN KEY (`id_cliente_agente`) REFERENCES `cliente_agente`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cliente` ADD CONSTRAINT `cliente_id_pais_fkey` FOREIGN KEY (`id_pais`) REFERENCES `pais`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cliente` ADD CONSTRAINT `cliente_id_ciudad_fkey` FOREIGN KEY (`id_ciudad`) REFERENCES `ciudad`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `proveedor` ADD CONSTRAINT `proveedor_id_pais_fkey` FOREIGN KEY (`id_pais`) REFERENCES `pais`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `proveedor` ADD CONSTRAINT `proveedor_id_ciudad_fkey` FOREIGN KEY (`id_ciudad`) REFERENCES `ciudad`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `proveedor_contacto` ADD CONSTRAINT `proveedor_contacto_id_proveedor_fkey` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `servicio` ADD CONSTRAINT `servicio_id_tipo_fkey` FOREIGN KEY (`id_tipo`) REFERENCES `tiposervicio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `servicio` ADD CONSTRAINT `servicio_id_proveedor_fkey` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `servicio` ADD CONSTRAINT `servicio_id_ciudad_fkey` FOREIGN KEY (`id_ciudad`) REFERENCES `ciudad`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alojamiento` ADD CONSTRAINT `alojamiento_id_servicio_fkey` FOREIGN KEY (`id_servicio`) REFERENCES `servicio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `boleto_entrada` ADD CONSTRAINT `boleto_entrada_id_servicio_fkey` FOREIGN KEY (`id_servicio`) REFERENCES `servicio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tour` ADD CONSTRAINT `tour_id_servicio_fkey` FOREIGN KEY (`id_servicio`) REFERENCES `servicio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `traslado` ADD CONSTRAINT `traslado_id_servicio_fkey` FOREIGN KEY (`id_servicio`) REFERENCES `servicio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tren` ADD CONSTRAINT `tren_id_servicio_fkey` FOREIGN KEY (`id_servicio`) REFERENCES `servicio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vuelo` ADD CONSTRAINT `vuelo_id_servicio_fkey` FOREIGN KEY (`id_servicio`) REFERENCES `servicio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `servicio_precio_mes` ADD CONSTRAINT `servicio_precio_mes_id_servicio_fkey` FOREIGN KEY (`id_servicio`) REFERENCES `servicio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hotel` ADD CONSTRAINT `hotel_id_ciudad_fkey` FOREIGN KEY (`id_ciudad`) REFERENCES `ciudad`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hotel_precio_mes` ADD CONSTRAINT `hotel_precio_mes_hotel_id_fkey` FOREIGN KEY (`hotel_id`) REFERENCES `hotel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alojamiento_precio_mes` ADD CONSTRAINT `alojamiento_precio_mes_id_ciudad_fkey` FOREIGN KEY (`id_ciudad`) REFERENCES `ciudad`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuario_rol` ADD CONSTRAINT `usuario_rol_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuario_rol` ADD CONSTRAINT `usuario_rol_id_rol_fkey` FOREIGN KEY (`id_rol`) REFERENCES `rol`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cotizacion` ADD CONSTRAINT `cotizacion_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cotizacion` ADD CONSTRAINT `cotizacion_id_cliente_agente_fkey` FOREIGN KEY (`id_cliente_agente`) REFERENCES `cliente_agente`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cotizacion` ADD CONSTRAINT `cotizacion_id_destino_principal_fkey` FOREIGN KEY (`id_destino_principal`) REFERENCES `continente`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cotizacion_item` ADD CONSTRAINT `cotizacion_item_id_cotizacion_fkey` FOREIGN KEY (`id_cotizacion`) REFERENCES `cotizacion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cotizacion_item` ADD CONSTRAINT `cotizacion_item_id_servicio_fkey` FOREIGN KEY (`id_servicio`) REFERENCES `servicio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reserva` ADD CONSTRAINT `reserva_id_cotizacion_origen_fkey` FOREIGN KEY (`id_cotizacion_origen`) REFERENCES `cotizacion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reserva` ADD CONSTRAINT `reserva_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reserva` ADD CONSTRAINT `reserva_id_cliente_agente_fkey` FOREIGN KEY (`id_cliente_agente`) REFERENCES `cliente_agente`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reserva` ADD CONSTRAINT `reserva_id_destino_principal_fkey` FOREIGN KEY (`id_destino_principal`) REFERENCES `continente`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reserva_item` ADD CONSTRAINT `reserva_item_id_reserva_fkey` FOREIGN KEY (`id_reserva`) REFERENCES `reserva`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reserva_item` ADD CONSTRAINT `reserva_item_id_cotizacion_item_origen_fkey` FOREIGN KEY (`id_cotizacion_item_origen`) REFERENCES `cotizacion_item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reserva_item` ADD CONSTRAINT `reserva_item_id_servicio_fkey` FOREIGN KEY (`id_servicio`) REFERENCES `servicio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reserva_confirmacion_comercial` ADD CONSTRAINT `reserva_confirmacion_comercial_id_reserva_fkey` FOREIGN KEY (`id_reserva`) REFERENCES `reserva`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reserva_confirmacion_comercial` ADD CONSTRAINT `reserva_confirmacion_comercial_confirmed_by_fkey` FOREIGN KEY (`confirmed_by`) REFERENCES `usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reserva_confirmacion_comercial_item` ADD CONSTRAINT `reserva_confirmacion_comercial_item_id_confirmacion_comerci_fkey` FOREIGN KEY (`id_confirmacion_comercial`) REFERENCES `reserva_confirmacion_comercial`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reserva_confirmacion_comercial_item` ADD CONSTRAINT `reserva_confirmacion_comercial_item_id_reserva_item_fkey` FOREIGN KEY (`id_reserva_item`) REFERENCES `reserva_item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `liquidacion_reserva` ADD CONSTRAINT `liquidacion_reserva_id_reserva_fkey` FOREIGN KEY (`id_reserva`) REFERENCES `reserva`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditoria_evento` ADD CONSTRAINT `auditoria_evento_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Preserve legacy aggregated view used for alojamiento monthly reference prices.
CREATE OR REPLACE VIEW `v_alojamiento_precio_mes` AS
SELECT
  h.`id_ciudad` AS `id_ciudad`,
  hpm.`categoria_hotel` AS `categoria_hotel`,
  hpm.`categoria_hab` AS `categoria_hab`,
  hpm.`regimen` AS `regimen`,
  hpm.`anio` AS `anio`,
  hpm.`mes` AS `mes`,
  hpm.`tipo_habitacion` AS `tipo_habitacion`,
  ROUND(AVG(hpm.`precio_usd`), 2) AS `precio_usd`,
  COUNT(*) AS `n_hoteles`
FROM `hotel_precio_mes` hpm
INNER JOIN `hotel` h ON h.`id` = hpm.`hotel_id`
WHERE hpm.`precio_usd` IS NOT NULL
GROUP BY
  h.`id_ciudad`,
  hpm.`categoria_hotel`,
  hpm.`categoria_hab`,
  hpm.`regimen`,
  hpm.`anio`,
  hpm.`mes`,
  hpm.`tipo_habitacion`;

