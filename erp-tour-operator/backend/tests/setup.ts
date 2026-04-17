process.env.DATABASE_URL = process.env.DATABASE_URL ?? "mysql://root:root@localhost:3306/erp_tour_operator";
process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-secret";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "8h";
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:5173";
