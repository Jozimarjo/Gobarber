import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import Notification from '../schemas/Notification';
import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';
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
            attributes: ['id', 'date', 'past', 'cancelable'],
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
        /**
         * Checar se o provider_id e um provedor de Serviço
         */
        const isProvider = await User.findOne({
            where: { id: provider_id, provider: true },
        });
        if (!isProvider)
            return res.status(401).json({
                error: 'você só pode criar compromissos com fornecedores',
            });

        /**
         * Checar se o prestador de servico e diferente de quem esta agendando o servico
         */
        if (req.userId === provider_id)
            return res.status(401).json({
                error: 'Voce nao pode agendar um servico para si mesmo',
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

        const appointment = await Appointment.create({
            user_id: req.userId,
            provider_id,
            date: hourStart,
        });

        /**
         * Notify appointment provider
         */
        const user = await User.findByPk(req.userId);
        const formattedDate = format(
            hourStart,
            "'dia' dd 'de' MMMM', as' H:mm'h'",
            { locale: pt }
        );
        await Notification.create({
            content: `Novo agendamento de ${user.name} para o ${formattedDate}`,
            user: provider_id,
        });
        return res.json(appointment);
    }

    async delete(req, res) {
        const appointment = await Appointment.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'provider',
                    attributes: ['name', 'email'],
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['name'],
                },
            ],
        });

        if (appointment.user_id !== req.userId)
            return res.status(401).json({
                error: 'Voce nao tem permissao para cancelar esse servico',
            });
        const dateWithSub = subHours(appointment.date, 2);

        if (isBefore(dateWithSub, new Date()))
            return res.status(401).json({
                error:
                    'Voce so pode cancelar um agendamento com 2 horas de antecedencia',
            });
        appointment.canceled_at = new Date();
        await appointment.save();

        await Queue.add(CancellationMail.key, {
            appointment,
        });
        res.json(appointment);
    }
}
export default new AppointmentController();
