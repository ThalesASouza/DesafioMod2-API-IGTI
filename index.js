import express from 'express';
import winston from 'winston';
import rotas from './rotas/rotas.js';


const porta = 8080;
const app = express();

const {combine,timestamp,label,printf} = winston.format;

const myformat = printf(({level,message,label,timestamp}) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

global.logger = winston.createLogger({
  level: 'silly',
  transports:[
    new (winston.transports.Console)(),
    new (winston.transports.File)({filename: './logs/Grades-APi.log'})
  ],
  format: combine(
    label({label: "Grades-Api"}),
    timestamp(),
    myformat
  )
});

app.use(express.json());
app.use('/grades', rotas);

app.listen(porta, () => {
    logger.info('API STARTED');
}); 
