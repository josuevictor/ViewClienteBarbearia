import React, { useState } from 'react';
import Swal from 'sweetalert2';
import InputMask from 'react-input-mask';

const Cadastro = ({ onClose }: { onClose: () => void }) => {
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isFormValid = nome && sobrenome && email && telefone && cpf && senha;

  const removeMask = (value: string) => {
    return value.replace(/\D/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const cpfSemMascara = removeMask(cpf);
    const telefoneSemMascara = removeMask(telefone);
    try {
      const response = await fetch('https://backendbarbearia-2.onrender.com/api/CadastrarCliente', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nome, sobrenome, cpf: cpfSemMascara, email, telefone: telefoneSemMascara, senha })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Cadastro bem-sucedido:', data);
        Swal.fire({
          title: 'Sucesso!',
          text: data.msg || 'Cadastro realizado com sucesso!',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          onClose();
        });
      } else {
        console.error('Erro ao fazer cadastro:', data.msg);
        setErrorMessage(data.msg || 'Erro ao fazer cadastro');
      }
    } catch (error) {
      console.error('Erro ao fazer cadastro:', error);
      setErrorMessage('Erro ao fazer cadastro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg relative" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">Cadastro de Novo Usuário</h2>
        {errorMessage && (
          <div className="mb-4 text-red-500 text-center">
            {errorMessage}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
              Nome
            </label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="sobrenome" className="block text-sm font-medium text-gray-700">
              Sobrenome
            </label>
            <input
              type="text"
              id="sobrenome"
              value={sobrenome}
              onChange={(e) => setSobrenome(e.target.value)}
              required
              className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">
              Telefone
            </label>
            <InputMask
              mask="(99) 99999-9999"
              id="telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              required
              className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">
              CPF
            </label>
            <InputMask
              mask="999.999.999-99"
              id="cpf"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              required
              className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-2 py-1 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
              isFormValid && !isLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-400 text-gray-700 cursor-not-allowed'
            }`}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Cadastro;