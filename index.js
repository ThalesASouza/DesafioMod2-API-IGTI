import express from 'express';
import {promises} from 'fs';
import rotas from './rotas/rotas.js';


const porta = 8080;
const app = express();


app.use(express.json());
app.use('/grades', rotas);

app.listen(porta, () => {
    
  console.log('API started');

});
