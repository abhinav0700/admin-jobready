import { Router, Request, Response } from 'express';
import { UserService } from '../services/user.service';

const router = Router();
const userService = new UserService();

router.get('/', async (req: Request, res: Response) => {
  try {
    const users = await userService.getAll();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/college/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) throw new Error('ID is required');
    const users = await userService.getByCollege(id);
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/bulk-upload', async (req: Request, res: Response) => {
  try {
    const { collegeId, csvContent } = req.body;
    const result = await userService.bulkUpload(collegeId, csvContent);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export const userRouter = router;
