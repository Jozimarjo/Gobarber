import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore } from 'date-fns';
import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
// Usuario comum --> nao prestador de serviço
class AppointmentController {
    async index(req, res) {
        const { page = 1 } = req.query;
        const appointments = await Appointment.findAll({
            where: {
                user_id: req.userId,
                canceled_at: null,
            },
            order: ['date'],
            attributes: ['id', 'date'],
            limit: 20,
            offset: (page - 1) * 20,
            include: [
                {
                    model: User,
                    as: 'provider',
                    attributes: ['id', 'name'],
                    include: [
                        {
                            model: File,
                            as: 'avatar',
                            attributes: ['id', 'url', 'path'],
                        },
                    ],
                },
            ],
        });
        return res.json(appointments);
    }

    async store(req, res) {
        const schema = Yup.object().shape({
            date: Yup.date().required(),
            provider_id: Yup.number().required(),
        });

        if (!(await schema.isValid(req.body)))
            return res.status(400).json({ error: 'Validation fails' });

        const { provider_id, date } = req.body;
        console.log('CHEGAMOS NO STORE ', date, ' --- ', provider_id);
        /**
         * Checar se o usario e um provedor de Serviço
         */
        const isProvider = await User.findOne({
            where: { id: provider_id, provider: true },
        });
        if (!isProvider)
            res.status(401).json({
                error: 'você só pode criar compromissos com fornecedores',
            });
        /**
         * Checando se a data e superior a atual
         */
        const hourStart = startOfHour(parseISO(date));

        if (isBefore(hourStart, new Date()))
            return res.status(400).json({
                error: 'Data invalida',
            });

        /**
         * Checando se a data esta disponivel
         */
        const checkAvailaability = await Appointment.findOne({
            where: {
                provider_id,
                canceled_at: null,
                date: hourStart,
            },
        });
        if (checkAvailaability)
            return res.status(400).json({
                error: 'Data indisponivel ',
            });
        console.log('CHEGAMOS NO STORE ', hourStart, ' --- ', provider_id);

        const appointment = await Appointment.create({
            user_id: req.userId,
            provider_id,
            date: hourStart,
        });
        return res.json(appointment);
    }
}
export default new AppointmentController();
