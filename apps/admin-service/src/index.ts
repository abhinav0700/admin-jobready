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

const PORT = config.adminServicePort || 5000;

app.listen(PORT, () => {
  console.log(`Admin Service running on port ${PORT}`);
});
