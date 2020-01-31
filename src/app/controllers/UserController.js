import User from '../models/User';

class UserController {
    async store(req, res) {
        const userExists = await User.findOne({
            where: { email: req.body.email },
        });

        if (userExists)
            return res.status(400).json({ error: 'Usuario ja Existe' });

        const { id, email, name, provider } = await User.create(req.body);

        return res.json({ id, email, name, provider });
    }

    async update(req, res) {
        console.log(req.userId)
        return res.json({ ok: true });
    }
}

export default new UserController();
