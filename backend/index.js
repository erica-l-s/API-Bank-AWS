const express = require('express');
const { SQS } = require('aws-sdk');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const sqs = new SQS({ region: 'us-east-1' });

app.post('/transacoes', async (req, res) => {
  const { idempotencyId, amount, type } = req.body;
  
  const params = {
    MessageBody: JSON.stringify({ idempotencyId, amount, type }),
    QueueUrl: 'https://sqs.us-east-1.amazonaws.com/471112524757/payloadAWS',
  };
  
  try {
    await sqs.sendMessage(params).promise();
    res.status(200).send('Transaction sent to SQS.');
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Error sending transaction to SQS.');
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// const express = require('express');
// const bodyParser = require('body-parser');
// const AWS = require('aws-sdk');

// const app = express();
// app.use(bodyParser.json());
// const { sendTransactions } = require('./teste');

// // Configurações da AWS
// AWS.config.update({
//   region: 'us-east-1', // Substitua pelo nome da região da sua AWS
//   accessKeyId: process.env.ACCESS_KEY_ID, // Substitua pelo seu Access Key ID da AWS
//   secretAccessKey: process.env.SECRET_ACCESS_KEY // Substitua pelo seu Secret Access Key da AWS
// });

// const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
// const queueUrl = 'https://sqs.us-east-1.amazonaws.com/471112524757/payloadAWS'; // Substitua pela URL da sua fila SQS

// // Rota POST para receber transações
// app.post('/transacoes', async (req, res) => {
//   try {
//     const { idempotencyId, amount, type } = req.body;

//     // Validar o payload da transação

//     const params = {
//       MessageBody: JSON.stringify({ idempotencyId, amount, type }),
//       QueueUrl: queueUrl
//     };

//     await sqs.sendMessage(params).promise();

//     res.status(201).json({ message: 'Transaction queued successfully' });
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
// sendTransactions();