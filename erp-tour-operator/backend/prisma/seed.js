"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const passwordHash = await bcryptjs_1.default.hash("admin123", 10);
    await prisma.rol.upsert({
        where: { codigo: "ADMIN" },
        update: { nombre: "Administrador" },
        create: { codigo: "ADMIN", nombre: "Administrador" }
    });
    await prisma.rol.upsert({
        where: { codigo: "OPERACIONES" },
        update: { nombre: "Operaciones" },
        create: { codigo: "OPERACIONES", nombre: "Operaciones" }
    });
    const admin = await prisma.usuario.upsert({
        where: { email: "admin@erp.local" },
        update: {
            nombre: "Administrador",
            passwordHash
        },
        create: {
            nombre: "Administrador",
            email: "admin@erp.local",
            passwordHash
        }
    });
    const adminRole = await prisma.rol.findUniqueOrThrow({
        where: { codigo: "ADMIN" }
    });
    await prisma.usuarioRol.upsert({
        where: {
            idUsuario_idRol: {
                idUsuario: admin.id,
                idRol: adminRole.id
            }
        },
        update: {},
        create: {
            idUsuario: admin.id,
            idRol: adminRole.id
        }
    });
    await prisma.continente.createMany({
        data: [
            { id: 4, nombre: "EUROPA" },
            { id: 5, nombre: "AMERICA" },
            { id: 6, nombre: "AFRICA" }
        ],
        skipDuplicates: true
    });
    await prisma.pais.createMany({
        data: [
            { id: 11, nombre: "ESPAÑA", idContinente: 4 },
            { id: 12, nombre: "FRANCIA", idContinente: 4 }
        ],
        skipDuplicates: true
    });
    await prisma.ciudad.createMany({
        data: [
            { id: 18, nombre: "MADRID", idPais: 11 },
            { id: 19, nombre: "BARCELONA", idPais: 11 }
        ],
        skipDuplicates: true
    });
    const tipos = [
        { id: 1, nombre: "Alojamiento", codigo: "ALOJAMIENTO" },
        { id: 2, nombre: "Visita", codigo: "VISITA" },
        { id: 3, nombre: "Traslado", codigo: "TRASLADO" },
        { id: 4, nombre: "Excursión", codigo: "EXCURSION" },
        { id: 5, nombre: "Boleto entrada", codigo: "ENTRADA" },
        { id: 6, nombre: "Tren", codigo: "TREN" },
        { id: 7, nombre: "Vuelo", codigo: "VUELO" }
    ];
    for (const tipo of tipos) {
        await prisma.tipoServicio.upsert({
            where: { id: tipo.id },
            update: { nombre: tipo.nombre, codigo: tipo.codigo, activo: true },
            create: tipo
        });
    }
    await prisma.catalogoOpcion.createMany({
        data: [
            { id: 100, grupo: "tour_tipo_guia", valor: "GUIA", valorNorm: "guia" },
            { id: 101, grupo: "idiomas", valor: "Español", valorNorm: "espanol" }
        ],
        skipDuplicates: true
    });
    const proveedor = await prisma.proveedor.upsert({
        where: { id: 4 },
        update: {
            codigo: "CVT",
            nombreComercial: "Civitatis",
            sitioWeb: "https://www.civitatis.com/es/agencias/?srsltid=AfmBOooGN-veHtW_DgkK4AooxTq-0mYNLsBx0vNJxD_MeEbo2SFP7GLZ",
            activo: true
        },
        create: {
            id: 4,
            codigo: "CVT",
            nombreComercial: "Civitatis",
            sitioWeb: "https://www.civitatis.com/es/agencias/?srsltid=AfmBOooGN-veHtW_DgkK4AooxTq-0mYNLsBx0vNJxD_MeEbo2SFP7GLZ",
            activo: true
        }
    });
    const servicio = await prisma.servicio.upsert({
        where: { id: 9 },
        update: {
            idTipo: 4,
            idProveedor: proveedor.id,
            idCiudad: 18,
            nombreWtravel: "Excursión a Toledo y Segovia",
            tiempoServicio: "11h",
            descripcion: "Excursión a Toledo y Segovia, en grupo, guía en español",
            linkReserva: "https://www.civitatis.com/es/madrid/excursion-toledo-segovia/"
        },
        create: {
            id: 9,
            idTipo: 4,
            idProveedor: proveedor.id,
            idCiudad: 18,
            nombreWtravel: "Excursión a Toledo y Segovia",
            tiempoServicio: "11h",
            descripcion: "Excursión a Toledo y Segovia, en grupo, guía en español",
            linkReserva: "https://www.civitatis.com/es/madrid/excursion-toledo-segovia/"
        }
    });
    await prisma.tour.upsert({
        where: { idServicio: servicio.id },
        update: { tipoGuia: "GUIA", idioma: "Español" },
        create: {
            idServicio: servicio.id,
            tipoGuia: "GUIA",
            idioma: "Español"
        }
    });
    await prisma.servicioPrecioMes.createMany({
        data: Array.from({ length: 12 }, (_, index) => ({
            idServicio: servicio.id,
            anio: 2026,
            mes: index + 1,
            tipoHabitacion: "DBL",
            precioUsd: (index + 1) * 100
        })),
        skipDuplicates: true
    });
}
main()
    .catch(async (error) => {
    console.error(error);
    process.exitCode = 1;
})
    .finally(async () => {
    await prisma.$disconnect();
});
