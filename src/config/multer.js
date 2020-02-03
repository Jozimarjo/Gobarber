import multer from 'multer';
import crypto from 'crypto';
import { extname, resolve } from 'path';

export default {
    storage: multer.diskStorage({
        destination: resolve(__dirname, '..', '..', 'tmp', 'uploads'), // destino dos arquivos
        filename: (req, file, cb) => {
            console.log('multer = ', req.body);
            // file name como iremos formatar o nome do arquivo da imagem.
            crypto.randomBytes(16, (err, res) => {
                if (err) return cb(err);
                return cb(
                    null,
                    res.toString('hex') + extname(file.originalname)
                );
            });
        },
    }),
};
