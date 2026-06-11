import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool;

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'anup',
  database: process.env.DB_NAME || 'pro',
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_LIMIT || 10),
  queueLimit: 0,
  ssl: process.env.DB_SSL === 'true' || Number(process.env.DB_PORT) === 4000 ? {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  } : undefined
};

export async function connectDB() {
  try {
    console.log(`🔌 Attempting database connection to ${dbConfig.host}:${dbConfig.port}...`);
    pool = mysql.createPool(dbConfig);
    await pool.query('SELECT 1');
    console.log('✅ Connected to MySQL database');
  } catch (err) {
    console.error('❌ Error connecting to MySQL:', err);
    process.exit(1);
  }
}

export async function executeQuery(query, params = []) {
  if (!pool) {
    throw new Error('Database pool is not initialized. Call connectDB() first.');
  }
  return pool.execute(query, params);
}

export async function withTransaction(handler) {
  if (!pool) {
    throw new Error('Database pool is not initialized. Call connectDB() first.');
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await handler(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export const db = {
  execute: executeQuery
};

export { pool };
