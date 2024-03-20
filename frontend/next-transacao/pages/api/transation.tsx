"use client"
import React, { useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';

interface TransactionData {
  dataRecebimento: string | number | Date;
  idempotencyId: number;
  amount: number;
  type: 'credit' | 'debit';
}
interface ApiResponse {
  Messages?: {
    Body: string;
  }[];
}

export default function Home() {
  const [amount, setAmount] = useState<number>(0);
  const [type, setType] = useState<'credit' | 'debit'>('credit');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
    
  const generateIdempotencyId = () => {
    return Math.floor(Math.random() * 1000000); // Gerando um idempotencyId de 0 a 999999
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(e.target.value));
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setType(e.target.value as 'credit' | 'debit');
  };

  const formatCurrency = (value: string | number) => {
    if (typeof value === 'number') {
      return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    } else {
      return ''; // Retorna uma string vazia se o valor não for numérico
    }
  };

  const postDataToBackend = async () => {
    const data: TransactionData = {
      idempotencyId: generateIdempotencyId(), // Gerando um idempotencyId automático
      amount,
      type,
      dataRecebimento: ''
    };

    try {
      const response: AxiosResponse<string> = await axios.post('http://localhost:3001/transacoes', data);
      setMessage(response.data);
      // Atualizar as transações após o envio bem-sucedido
      setAmount(0);
    } catch (error) {
      setMessage('Error sending data to backend');
      console.error('Error sending data to backend:', error);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await axios.get<ApiResponse>('http://localhost:3001/api/infoTransacoes');
      const data = response.data;
  
      // Verifica se a resposta possui uma lista de mensagens válida
      if (data.Messages && Array.isArray(data.Messages)) {
        const parsedTransactions = data.Messages
          .map(message => JSON.parse(message.Body))
          .filter((transaction: TransactionData) => {
            return transaction.idempotencyId && transaction.amount && transaction.type;
          });
  
        setTransactions(parsedTransactions); // Define todas as transações disponíveis
      } else {
        console.error('Resposta inválida da API:', data);
      }
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    }, []);

  return (
    <div className="max-w-lg mx-auto mt-10">
      <div className="bg-white p-6 shadow-md rounded-lg">
        <h2 className="text-xl font-bold mb-4">Transação</h2>
        <form className="space-y-4">
          <label htmlFor="amount">Valor:</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={handleAmountChange}
            className="w-full border border-gray-300 rounded px-4 py-2"
          />
          <br />
          <label htmlFor="type">Tipo:</label>
          <select
            id="type"
            value={type}
            onChange={handleTypeChange}
            className="w-full border border-gray-300 rounded px-4 py-2"
          >
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
          <br />
          <button
            type="button"
            onClick={postDataToBackend}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2"
          >
            Enviar para o Backend
          </button>
          <button
            type="button"
            onClick={fetchTransactions}
            className="bg-green-500 hover:bg-green-600 text-white rounded px-4 py-2"
          >
            Carregar Transações
          </button>
        </form>
        <p className={`mt-4 ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
          {message}
        </p>
        <p className="text-gray-700 mt-2">Valor: {formatCurrency(amount)}</p>
      </div>

      <div className="mt-8">
        <h1 className="text-black">Transações Recentes</h1>
        {loading ? (
          <p>Carregando transações...</p>
        ) : (
          <ul className="text-black">
            {transactions.map((transaction, index) => (
              <li key={index}>
                ID: {transaction.idempotencyId}, Valor: {transaction.amount}, Tipo: {transaction.type}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

