import { Router, Request, Response } from 'express';
import { CollegeService } from '../services/college.service';

const router = Router();
const collegeService = new CollegeService();

router.get('/', async (req: Request, res: Response) => {
  try {
    const colleges = await collegeService.getAll();
    res.json(colleges);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, domain } = req.body;
    const college = await collegeService.create(name, domain);
    res.json(college);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, domain } = req.body;
    const college = await collegeService.update(id, name, domain);
    res.json(college);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id/toggle', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) throw new Error('ID is required');
    const { is_active } = req.body;
    await collegeService.toggleActive(id, is_active);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export const collegeRouter = router;
