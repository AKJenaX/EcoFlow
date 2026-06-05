import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB } from './db.js';
import { requestContext } from './middleware/requestContext.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { registerRulesEngine } from './services/rulesEngine.js';
import { attachWebSocketServer } from './services/wsServer.js';

import authorityRoutes from './authority.js';
import vehicleRoutes from './vehicle.js';
import driverRoutes from './driver.js';
import userRoutes from './usertable.js';
import binRoutes from './bin.js';
import aiRoutes from './ai.js';
import authRoutes from './routes/auth.js';
import auditRoutes from './routes/audit.js';
import iotRoutes from './routes/iot.js';
import slaRoutes from './routes/sla.js';
import incidentsRoutes from './routes/incidents.js';
import analyticsRoutes from './routes/analytics.js';
import optimizeRoutes from './routes/optimize.js';
import forecastRoutes from './routes/forecast.js';
import anomalyRoutes from './routes/anomalies.js';
import complaintsRoutes from './routes/complaints.js';
import copilotRoutes from './routes/copilot.js';
import routeOptimizerRoutes from './routes/routes.js';
import pickupRequestRoutes from './routes/pickupRequests.js';

const app = express();
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*'
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX || 500)
  })
);
app.use(requestContext);
app.use(express.json());

app.use('/authority', authorityRoutes);
app.use('/vehicle', vehicleRoutes);
app.use('/driver', driverRoutes);
app.use('/user', userRoutes);
app.use('/bin', binRoutes);
app.use('/ai', aiRoutes);
app.use('/auth', authRoutes);
app.use('/audit', auditRoutes);
app.use('/iot', iotRoutes);
app.use('/sla', slaRoutes);
app.use('/incidents', incidentsRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/optimize', optimizeRoutes);
app.use('/forecast', forecastRoutes);
app.use('/anomalies', anomalyRoutes);
app.use('/complaints', complaintsRoutes);
app.use('/copilot', copilotRoutes);
app.use('/api/routes', routeOptimizerRoutes);
app.use('/api/pickup-requests', pickupRequestRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ecoflow-backend' });
});

app.get('/ready', (_req, res) => {
  res.json({ status: 'ready' });
});

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = Number(process.env.PORT || 3000);

connectDB().then(() => {
  registerRulesEngine();
  // Use http.createServer so we can attach the WebSocket server to the same port
  const httpServer = http.createServer(app);
  attachWebSocketServer(httpServer);
  httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
