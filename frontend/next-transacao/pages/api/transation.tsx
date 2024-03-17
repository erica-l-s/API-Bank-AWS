"use client"
import axios, { AxiosResponse } from 'axios';
import { useState } from 'react';

interface TransactionData {
  idempotencyId: number;
  amount: number;
  type: 'credit' | 'debit';
}

export default function Home() {
  
  const [amount, setAmount] = useState<number>(0);
  const [type, setType] = useState<'credit' | 'debit'>('credit');
  const [message, setMessage] = useState<string>('');

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
    };

    try {
      const response: AxiosResponse<string> = await axios.post('http://localhost:3001/transacoes', data);
      setMessage(response.data);
    } catch (error) {
      setMessage('Error sending data to backend');
      console.error('Error sending data to backend:', error);
    }
  };

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
        <select id="type" value={type} onChange={handleTypeChange} className="w-full border border-gray-300 rounded px-4 py-2">
          <option value="credit">Credit</option>
          <option value="debit">Debit</option>
        </select>
        <br />
        <button type="button" onClick={postDataToBackend} className="bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2">
          Send Data to Backend
        </button>
      </form>
      <p className={`mt-4 ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
        {message}
      </p>
      <p className="text-gray-700 mt-2">Valor: {formatCurrency(amount)}</p>
      </div>
    </div>
  );
}