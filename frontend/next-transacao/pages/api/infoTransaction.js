import AWS from 'aws-sdk';


export default async function handler(req, res) {
  const sqs = new AWS.SQS({ region: 'us-east-1' });

  const params = {
    QueueUrl: 'https://sqs.us-east-1.amazonaws.com/471112524757/payloadAWS',
    MaxNumberOfMessages: 10,
       
  };

  try {
    const data = await sqs.receiveMessage(params).promise();

      if (data.Messages && Array.isArray(data.Messages)) {
      const messages = data.Messages.map(message => ({
        messageId: message.MessageId,
        body: JSON.parse(message.Body),
        attributes: message.MessageAttributes,
        
      }));
      res.status(200).json({ messages });
    } else {
      res.status(200).json({ messages: [] }); // Retorna um array vazio se não houver mensagens
    }
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Error retrieving messages from SQS.');
  }
}

