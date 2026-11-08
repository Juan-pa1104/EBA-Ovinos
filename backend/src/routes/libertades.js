import { Router } from 'express';
import { listarLibertades } from '../controllers/indicadorController.js';
import { autenticar } from '../middleware/auth.js';

const router = Router();

router.get('/', autenticar, listarLibertades);

export default router;
