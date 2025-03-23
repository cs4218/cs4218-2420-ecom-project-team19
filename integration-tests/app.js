import express from 'express';
import categoryRoutes from '../routes/categoryRoutes';
import dotenv from 'dotenv';
import connectDB from "../config/db.js";

dotenv.config(); // load .env

//connectDB();

const app = express();

app.use(express.json());
app.use('/api/v1/category', categoryRoutes);

export default app;
