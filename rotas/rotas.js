import express from 'express';
import { promises } from 'fs';


global.fileName = 'grades.json';

const rotas = express.Router();
const readFile = promises.readFile;
const writeFile = promises.writeFile;

// Insere uma nova grade
rotas.post('/inserirGrade', async (req, res) => {
  try {
    let newGrade = await req.body;

    let date = new Date();
    date.setHours(date.getHours() - 3);

    let data = await readFile(global.fileName, 'utf8');
    let json = JSON.parse(data);

    newGrade = { id: json.nextId, ...newGrade, timestamp: date };
    json.nextId++;
    json.grades.push(newGrade);

    await writeFile(global.fileName, JSON.stringify(json));
    res.send(newGrade);
    logger.info(`POST /inserirGrade -  ${JSON.stringify(newGrade)}`);
  } catch (err) {
    res.status(400).send({ Error: err.message });
    logger.error(err);
  }
});

// Atualiza uma grade
rotas.put('/atualizarGrade', async (req, res) => {
  try {
    let newGrade = await req.body;

    let date = new Date();
    date.setHours(date.getHours() - 3);

    let data = await readFile(global.fileName, 'utf8');
    let json = JSON.parse(data);
    let index = json.grades.findIndex(grades => grades.id === newGrade.id);

    json.grades[index] = newGrade;
    json.grades[index].timestamp = date;

    await writeFile(global.fileName, JSON.stringify(json));
    res.send(newGrade);
    logger.info(`PUT /atualizarGrade -  ${JSON.stringify(newGrade)}`);
  } catch (err) {
    res.status(400).send({ Error: err.message });
    logger.error(err);
  }

});

//Deleta uma grade que é localizada pelo id passado por parametro
rotas.delete('/deletarGrade/:id', async (req, res) => {
  try {
    let data = await readFile(global.fileName, 'utf8');
    let json = JSON.parse(data);
    
    let newGrades = json.grades.filter(grade => grade.id !== parseInt(req.params.id, 10));
    json.grades = newGrades;
   
    await writeFile(global.fileName, JSON.stringify(json));
    res.end();
    logger.info(`DELETE /deletarGrade/:id -  ${JSON.stringify(req.params.id)}`);
  } catch (err) {
    res.status(400).send({ Error: err.message });
    logger.error(err);
  }
});

// Consulta uma grade que é localizada pelo id passado por parametro
rotas.get('/consultarGrade/:id', async (req, res) => {
  try {
    let data = await readFile(global.fileName, 'utf8');
    let json = JSON.parse(data);

    let resultGrades = json.grades.find(grade => grade.id === parseInt(req.params.id, 10));
    
    if (resultGrades.length !== 0) {
      res.send(resultGrades);
      logger.info(`GET /consultarGrade/:id -  ${JSON.stringify(resultGrades)}`);
    } else {
      throw new Error('Id não encontrado');
    }
   
  } catch (err) {
    res.status(400).send({ Error: err.message });
    logger.error(err);
  }
});

/* Retonar a nota total das grades que possuem 
determinado student e subject passados por parametro*/

rotas.get('/consultarNotaTotal/:student/:subject', async (req, res) => {
  try {
    let data = await readFile(global.fileName, 'utf8');
    let json = JSON.parse(data);

    let student = req.params.student;
    let subject = req.params.subject;

    let resultGradesStudent = json.grades.filter(grade =>
      ((grade.student === student) && (grade.subject === subject)));

    if (resultGradesStudent.length !== 0) {

      let notaTotal = resultGradesStudent.reduce((acc, current) => {
        return acc + current.value;
      }, 0);

      res.send(`Student: ${student}<br>
                Disciplina: ${subject}<br>
                Nota total: ${notaTotal}`);

      logger.info(`GET /consultarNotaTotal/:student/:subject -  ${JSON.stringify(notaTotal)}`);
    } else {
      throw new Error('Student ou Subject não encontrados');
    }

  } catch (err) {
    res.status(400).send(`Error: ${err.message}`);
    logger.error(err);
  }
});

/* Retonar a media das grades que possuem
determinado subject e type passados por parametro*/

rotas.get('/consultarMediaGlobal/:subject/:type', async (req, res) => {
  try {
    let data = await readFile(global.fileName, 'utf8');
    let json = JSON.parse(data);

    let subject = req.params.subject;
    let type = req.params.type;

    let resultGradeSubject = json.grades.filter(grade =>
      ((grade.subject === subject) && (grade.type === type)));

    if (resultGradeSubject.length !== 0) {

      let qtd = resultGradeSubject.length;

      let notaTotal = resultGradeSubject.reduce((acc, current) => {
        return acc + current.value;
      }, 0);

      let media = notaTotal / qtd;

      res.send(`Subject: ${subject}<br>
                Type: ${type}<br>
                Total: ${notaTotal}<br>
                Quantidade: ${qtd}<br>
                Média: ${media}`);
      logger.info(`GET /consultarMediaGlobal/:subject/:type -  ${JSON.stringify(media)}`);
    
    } else {
      throw new Error('Subject ou Type não encontrados');
    }

  } catch (err) {
    res.status(400).send(`Error: ${err.message}`);
    logger.error(err);
  }
});

/* Retonar as 3 maiores notas de um determinado 
subject e type passados por parametro*/

rotas.get('/consultar3MaioresValue/:subject/:type', async (req, res) => {
  try {
    let data = await readFile(global.fileName, 'utf8');
    let json = JSON.parse(data);

    let subject = req.params.subject;
    let type = req.params.type;

    let resultGradeSubject = json.grades.filter(grade => {
      return ((grade.subject === subject) && (grade.type === type));
    }).sort((a, b) => {
      return b.value - a.value;
    }).slice(0, 3);

    if (resultGradeSubject.length !== 0) {
      res.send(resultGradeSubject);
      logger.info(`GET /consultar3MaioresValue/:subject/:type -  ${JSON.stringify(resultGradeSubject)}`);
   
    } else {
      throw new Error('Subject ou Type não encontrados');
    }

  } catch (err) {
    res.status(400).send(`Error: ${err.message}`);
    logger.error(err);
  }
});
export default rotas;