import Bee from 'bee-queue';
import CancellationMail from '../app/jobs/CancellationMail';
import redisConfig from '../config/redis';
/**
 * todos trabalhos dentro das Queues são chamados de jobs
 */

/**
 * para cada job criamos uma fila
 * para cada fila nos armazenamos o bee , que e a nossa instancia que conecta com redis , que consegue armazenar e recuperar valores do banco de dados
 * handle quem processa a fila, recebe as variaveis de dentro do email
 * processqueue processa em tempo real os nossos queue
 */
const jobs = [CancellationMail];
class Queue {
    constructor() {
        this.queues = {};

        this.init();
    }

    init() {
        jobs.forEach(({ key, handle }) => {
            this.queues[key] = {
                bee: new Bee(key, { redis: redisConfig }),
                handle,
            };
        });
    }

    add(queue, job) {
        console.log('Queue: ', queue);

        return this.queues[queue].bee.createJob(job).save();
    }

    processQueue() {
        jobs.forEach(job => {
            const { bee, handle } = this.queues[job.key];
            bee.process(handle);
        });
    }
}
export default new Queue();
