import { Router } from 'express';
import User from './app/models/User';

import UserControllers from './app/controllers/UserController';

const routes = new Router();

routes.get('/', async (req, res) => {
    const user = await User.create({
        name: 'Diego Fernandes',
        email: 'diego@rocketseat.com.br',
        password_hash: '123134123',
    });

    res.json(user);
});

routes.post('/users', UserControllers.store);
export default routes;
