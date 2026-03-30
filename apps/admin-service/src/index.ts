import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from '@admin-panel/config';
import { authRouter } from './routes/auth.routes';
import { collegeRouter } from './routes/college.routes';
import { userRouter } from './routes/user.routes';
import { dashboardRouter } from './routes/dashboard.routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/colleges', collegeRouter);
app.use('/api/users', userRouter);
app.use('/api/dashboard', dashboardRouter);

// Try to find an available port
const tryPort = (startPort: number, maxAttempts: number = 20): Promise<number> => {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const attemptBind = (port: number) => {
      const server = app.listen(port, '0.0.0.0', () => {
        console.log(`Admin Service running on port ${port}`);
        resolve(port);
      });

      server.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE' && attempts < maxAttempts) {
          attempts++;
          console.log(`Port ${port} in use, trying ${port + 1}...`);
          attemptBind(startPort + attempts);
        } else {
          if (err.code === 'EADDRINUSE') {
            reject(new Error(`Could not find available port after ${maxAttempts} attempts starting from ${startPort}`));
          } else {
            reject(err);
          }
        }
      });
    };

    attemptBind(startPort);
  });
};

const startPort = process.env.PORT ? parseInt(process.env.PORT) : 54321;
tryPort(startPort, 20).catch(err => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
