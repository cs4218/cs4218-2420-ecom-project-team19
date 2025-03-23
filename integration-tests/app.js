import express from 'express';
import categoryRoutes from '../routes/categoryRoutes';
import authRoutes from '../routes/authRoute.js';
import dotenv from 'dotenv';

dotenv.config(); // load .env

const app = express();

app.use(express.json());
app.use('/api/v1/category', categoryRoutes);
app.use("/api/v1/auth", authRoutes);

export default app;
