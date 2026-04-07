import { Router, Request, Response } from 'express';
import { FacultyService } from '../services/faculty.service';

const router = Router();
const facultyService = new FacultyService();

router.get('/departments', async (req: Request, res: Response) => {
  try {
    const departments = await facultyService.getDepartments();
    res.json(departments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/college/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const faculties = await facultyService.getFacultiesByCollege(id);
    res.json(faculties);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, departmentId, collegeId } = req.body;
    if (!name || !email || !departmentId || !collegeId) {
      throw new Error('All fields are required (name, email, departmentId, collegeId)');
    }
    const faculty = await facultyService.createFaculty(name, email, departmentId, collegeId);
    res.status(201).json(faculty);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, departmentId } = req.body;
    const updated = await facultyService.updateFaculty(id, { name, departmentId });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const result = await facultyService.deleteFaculty(id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export const facultyRouter = router;
