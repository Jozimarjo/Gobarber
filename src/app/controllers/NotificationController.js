import Notification from '../schemas/Notification';
import User from '../models/User';

class NotificationController {
    async index(req, res) {
        const isProvider = await User.findOne({
            where: { id: req.userId, provider: true },
        });
        if (!isProvider)
            res.status(401).json({
                error:
                    'Apenas prestadores de Servicos podem acessar as notificacoes',
            });
        const notifications = await Notification.find({
            user: req.userId,
        })
            .sort({ createdAt: 'desc' })
            .limit(20);
        return res.json(notifications);
    }

    async update(req, res) {
        const notifications = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );
        return res.json(notifications);
    }
}

export default new NotificationController();
