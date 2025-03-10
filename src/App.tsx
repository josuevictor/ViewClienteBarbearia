import React, { useEffect, useState } from 'react';
import { Calendar, Scissors, Users } from 'lucide-react';
import { fetchBarbeiros } from './apiService';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// Tipos
type Servico = {
  id: number;
  nome: string;
  preco: number;
  duracao: string;
};

type Barbeiro = {
  funcionario_id: number;
  nome: string;
  foto: string;
};

type Agendamento = {
  cliente: string;
  horario: string;
  servico: string;
  barbeiro: string;
  status: string;
};

const MySwal = withReactContent(Swal);

function App() {
  const [servicoSelecionado, setServicoSelecionado] = useState<number | null>(null);
  const [barbeiroSelecionado, setBarbeiroSelecionado] = useState<number | null>(null);
  const [dataSelecionada, setDataSelecionada] = useState<string>(new Date().toISOString().split('T')[0]);
  const [horaSelecionada, setHoraSelecionada] = useState<string>('');
  const [funcionarios, setFuncionarios] = useState<Barbeiro[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingHorarios, setLoadingHorarios] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  const servicos: Servico[] = [
    { id: 1, nome: 'Corte de Cabelo', preco: 45, duracao: '30min' },
    { id: 2, nome: 'Barba', preco: 35, duracao: '20min' },
    { id: 3, nome: 'Corte + Barba', preco: 70, duracao: '50min' },
    { id: 4, nome: 'Sobrancelha', preco: 20, duracao: '15min' },
  ];

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      const barbeiros = await fetchBarbeiros();
      const barbeirosComFotos = barbeiros.map((barbeiro: any, index: number) => ({
        ...barbeiro,
        foto: `https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=150&h=150&fit=crop`
      }));
      setFuncionarios(barbeirosComFotos);

      const response = await fetch('https://backendbarbearia-2.onrender.com/api/agendamento');
      const data = await response.json();
      setAgendamentos(data.object.original);

      setLoading(false);
    };

    getData();

    // Log the cliente_id to the console
    const cliente_id = localStorage.getItem('cliente_id');
    console.log('cliente_id:', cliente_id);
  }, []);

  useEffect(() => {
    const fetchHorariosDisponiveis = async () => {
      if (barbeiroSelecionado && dataSelecionada) {
        setLoadingHorarios(true);
        try {
          const response = await fetch(
            `https://backendbarbearia-2.onrender.com/api/horariosDisponiveis?data=${dataSelecionada}&barbeiro_id=${barbeiroSelecionado}`
          );
          const data = await response.json();
          setHorariosDisponiveis(data);
        } catch (error) {
          console.error('Erro ao buscar horários disponíveis:', error);
        } finally {
          setLoadingHorarios(false);
        }
      }
    };

    fetchHorariosDisponiveis();
  }, [barbeiroSelecionado, dataSelecionada]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const cliente_id = localStorage.getItem('cliente_id'); // Recupera o cliente_id
    const cpf_cliente = localStorage.getItem('cpf_cliente'); // Recupera o cpf_cliente
    console.log('cpf_cliente:', cpf_cliente); // Imprime o CPF do cliente no console

    // Verifica se o usuário já tem um agendamento no mesmo dia
    const hasAgendamentoNoMesmoDia = agendamentos.some(
      (agendamento) =>
        agendamento.cliente === cliente_id &&
        agendamento.horario.split(' ')[0] === dataSelecionada
    );

    if (hasAgendamentoNoMesmoDia) {
      MySwal.fire({
        title: 'Erro ao Realizar Agendamento',
        text: 'Você já tem um agendamento neste dia.',
        icon: 'error',
        confirmButtonText: 'Fechar'
      });
      setIsSubmitting(false);
      return;
    }

    if (servicoSelecionado && barbeiroSelecionado && dataSelecionada && horaSelecionada && cliente_id && cpf_cliente) {
      const servico = servicos.find(s => s.id === servicoSelecionado);
      const barbeiro = funcionarios.find(b => b.funcionario_id === barbeiroSelecionado);

      //Objeto com os dados do agendamento que serão enviados para a API
      const agendamento = {
        servico: servicoSelecionado,
        cliente_id: parseInt(cliente_id),
        cpf_cliente: cpf_cliente,
        data_hora: dataSelecionada + ' ' + horaSelecionada,
        barbeiro: barbeiroSelecionado,
      };

      //Envia requisição para a API
      try {
        const response = await fetch('https://backendbarbearia-2.onrender.com/api/agendar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(agendamento)
        });

        const data = await response.json();

        if (response.ok && data.response !== 'error') {
          MySwal.fire({
            title: 'Agendamento Realizado com Sucesso!',
            html: `
              <p><strong>Serviço:</strong> ${servico?.nome}</p>
              <p><strong>Barbeiro:</strong> ${barbeiro?.nome}</p>
              <p><strong>Data:</strong> ${dataSelecionada}</p>
              <p><strong>Horário:</strong> ${horaSelecionada}</p>
            `,
            icon: 'success',
            confirmButtonText: 'Fechar'
          });
        } else if (data.response === 'error' && data.error_code === 409) {
          MySwal.fire({
            title: 'Erro ao Realizar Agendamento',
            text: data.message,
            icon: 'error',
            confirmButtonText: 'Fechar'
          });
        } else {
          MySwal.fire({
            title: 'Erro ao Realizar Agendamento',
            text: data.message || 'Erro desconhecido',
            icon: 'error',
            confirmButtonText: 'Fechar'
          });
        }
      } catch (error) {
        console.error('Erro:', error);
        MySwal.fire({
          title: 'Erro ao Realizar Agendamento',
          text: 'Tente novamente.',
          icon: 'error',
          confirmButtonText: 'Fechar'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('cliente_id'); // Remove o cliente_id ao deslogar
    localStorage.removeItem('cpf_cliente'); // Remove o cpf_cliente ao deslogar
    navigate('/login');
  };

  const handleMenuClick = () => {
    const cliente_id = localStorage.getItem('cliente_id');
    MySwal.fire({
      title: 'Informações do Agendamento',
      html: (
        <div>
          <p><strong>Cliente ID:</strong> {cliente_id}</p>
          <p><strong>Serviço:</strong> {servicoSelecionado ? servicos.find(s => s.id === servicoSelecionado)?.nome : 'Nenhum'}</p>
          <p><strong>Barbeiro:</strong> {barbeiroSelecionado ? funcionarios.find(b => b.funcionario_id === barbeiroSelecionado)?.nome : 'Nenhum'}</p>
          <p><strong>Data:</strong> {dataSelecionada}</p>
          <p><strong>Horário:</strong> {horaSelecionada}</p>
        </div>
      ),
      icon: 'info',
      confirmButtonText: 'Fechar'
    });
  };

  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 45);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(e.target.value);
    if (selectedDate < today) {
      setDataSelecionada(today.toISOString().split('T')[0]);
      MySwal.fire({
        title: 'Data Inválida',
        text: 'Não é possível agendar para uma data anterior a hoje.',
        icon: 'error',
        confirmButtonText: 'Fechar'
      });
    } else if (selectedDate > maxDate) {
      setDataSelecionada(maxDate.toISOString().split('T')[0]);
      MySwal.fire({
        title: 'Data Inválida',
        text: 'Não é possível agendar para uma data além dos próximos 45 dias.',
        icon: 'error',
        confirmButtonText: 'Fechar'
      });
    } else {
      setDataSelecionada(e.target.value);
    }
  };

  const isHorarioDisponivel = (horario: string) => {
    return horariosDisponiveis.includes(horario) && !agendamentos.some(
      (agendamento) =>
        agendamento.barbeiro === barbeiroSelecionado?.toString() &&
        agendamento.horario === `${dataSelecionada} ${horario}`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white py-6">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <button
            onClick={handleMenuClick}
            className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded"
          >
            <Calendar className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Scissors className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Barbearia</h1>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Agende seu horário</h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Serviços */}
            <section className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Scissors className="w-5 h-5" />
                Escolha o serviço
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {servicos.map((servico) => (
                  <div
                    key={servico.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${servicoSelecionado === servico.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                      }`}
                    onClick={() => setServicoSelecionado(servico.id)}
                  >
                    <h4 className="font-medium">{servico.nome}</h4>
                    <div className="flex justify-between mt-2 text-sm text-gray-600">
                      <span>R$ {servico.preco}</span>
                      <span>{servico.duracao}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Barbeiros */}
            <section className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Escolha o barbeiro
              </h3>
              {loading ? (
                <div className="flex justify-center items-center">
                  <svg
                    className="animate-spin h-8 w-8 text-gray-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {funcionarios.map((barbeiro) => (
                    <div
                      key={barbeiro.funcionario_id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all text-center ${barbeiroSelecionado === barbeiro.funcionario_id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                        }`}
                      onClick={() => setBarbeiroSelecionado(barbeiro.funcionario_id)}
                    >
                      <img
                        src={barbeiro.foto}
                        alt={barbeiro.nome}
                        className="w-24 h-24 rounded-full mx-auto mb-3 object-cover"
                      />
                      <h4 className="font-medium">{barbeiro.nome}</h4>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Data e Hora */}
            <section className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Escolha a data e horário
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data
                  </label>
                  <input
                    type="date"
                    value={dataSelecionada}
                    onChange={handleDateChange}
                    min={today.toISOString().split('T')[0]}
                    max={maxDate.toISOString().split('T')[0]}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horário
                  </label>
                  {loadingHorarios ? (
                    <div className="flex justify-center items-center">
                      <svg
                        className="animate-spin h-8 w-8 text-gray-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        ></path>
                      </svg>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {horariosDisponiveis.map((horario) => (
                        <button
                          key={horario}
                          type="button"
                          className={`p-2 text-sm border rounded-md transition-all
                            ${horaSelecionada === horario
                              ? 'bg-blue-500 text-white border-blue-500'
                              : isHorarioDisponivel(horario)
                              ? 'bg-white text-gray-700 border-gray-300 hover:bg-blue-100'
                              : 'bg-red-500 text-white border-red-500 cursor-not-allowed'}`}
                          disabled={!isHorarioDisponivel(horario)}
                          onClick={() => isHorarioDisponivel(horario) && setHoraSelecionada(horario)}
                        >
                          {horario}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Botão de Agendamento */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              disabled={!servicoSelecionado || !barbeiroSelecionado || !dataSelecionada || !horaSelecionada || isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-3 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  Carregando...
                </div>
              ) : (
                'Confirmar Agendamento'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default App;