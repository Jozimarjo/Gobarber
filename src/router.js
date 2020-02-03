import { Router } from 'express';
import multer from 'multer';
import User from './app/models/User';

import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.get('/', async (req, res) => {
    const user = await User.create({
        name: 'Diego Fernandes',
        email: 'diego@rocketseat.com.br',
        password_hash: '123134123',
    });

    res.json(user);
});

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);
routes.use(authMiddleware);
routes.put('/users', UserController.update);

routes.post('/files', upload.single('file'), (req, res) => {
    console.log('Cheagamos novamente');
    return res.json({ ok: true });
});

export default routes;
