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
}
export default new UserController();
