import { Router, Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';

const router = Router();
const dashboardService = new DashboardService();

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await dashboardService.getStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export const dashboardRouter = router;
