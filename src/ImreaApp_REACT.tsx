import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Outlet,
  useNavigate,
  useParams
} from 'react-router-dom';

// --- CONFIGURAÇÃO DA API ---
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/imrea-api'; // <-- CORRIGIDO: /imrea-api foi re-adicionado

// --- INTERFACES ---
interface ICuidador {
  idCuidador: number;
  nome: string;
  telefone: string;
  email: string;
}

type CuidadorFormTO = Omit<ICuidador, 'idCuidador'>;

interface IPaciente {
  idPaciente: number;
  nome: string;
  cpf: string;
  email: string;
  dataNascimento: string; 
  tipoDeficiencia: string;
  idCuidador: number;
  cuidador?: ICuidador; 
}

type PacienteFormTO = Omit<IPaciente, 'idPaciente' | 'cuidador'>;

interface IConsulta {
  idConsulta: number;
  especialidade: string;
  dataConsulta: string; 
  detalhes: string;
  idPaciente: number;
  paciente?: IPaciente; 
}

type ConsultaFormTO = Omit<IConsulta, 'idConsulta' | 'paciente'>;


// --- COMPONENTE PRINCIPAL  ---

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          
          <Route path="pacientes" element={<GestaoPacientes />} />
          <Route path="pacientes/novo" element={<PacienteForm />} />
          <Route path="pacientes/editar/:id" element={<PacienteForm />} /> 

          <Route path="cuidadores" element={<GestaoCuidadores />} />
          <Route path="cuidadores/novo" element={<CuidadorForm />} />
          <Route path="cuidadores/editar/:id" element={<CuidadorForm />} /> 

          <Route path="consultas" element={<GestaoConsultas />} />
          <Route path="consultas/novo" element={<ConsultaForm />} />
          <Route path="consultas/editar/:id" element={<ConsultaForm />} /> 

          <Route path="*" element={<PaginaNaoEncontrada />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

// --- COMPONENTES DE LAYOUT E UTILS ---

const Layout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-gray-100 text-gray-900">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:px-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const Header: React.FC = () => {
  return (
    <header className="bg-blue-700 text-white shadow-md">
      <nav className="container mx-auto p-4 flex flex-col md:flex-row justify-between items-center">
        <Link to="/" className="text-3xl font-bold mb-4 md:mb-0 hover:text-blue-100 transition-colors">
          IMREA
        </Link>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/pacientes">Pacientes</NavLink>
          <NavLink to="/cuidadores">Cuidadores</NavLink>
          <NavLink to="/consultas">Consultas</NavLink>
        </div>
      </nav>
    </header>
  );
};

const NavLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <Link
    to={to}
    className="text-lg font-medium text-white/90 hover:text-white hover:underline underline-offset-4 transition-all duration-200"
  >
    {children}
  </Link>
);

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 text-center p-4 mt-8">
      <p>&copy; {new Date().getFullYear()} IMREA - Sprint 4 (Front-End)</p>
    </footer>
  );
};

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center p-10">
    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-5 py-3 rounded-lg my-6 font-medium">
    <strong className="font-bold">Erro: </strong>
    <span className="block sm:inline">{message}</span>
  </div>
);

const PageTitle: React.FC<{ title: string }> = ({ title }) => (
  <h1 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-gray-300">
    {title}
  </h1>
);

// --- PÁGINA INICIAL ---

const HomePage: React.FC = () => (
  <div className="bg-white p-8 rounded-xl shadow-lg">
    <PageTitle title="Sistema de Gestão IMREA" />
    <p className="text-xl text-gray-800 mb-6 leading-relaxed">
      Bem-vindo ao sistema auxiliar de cadastro de pacientes, cuidadores e consultas do IMREA.
    </p>
    <p className="text-gray-600 text-lg">
      Utilize o menu de navegação acima para gerenciar os dados.
    </p>
  </div>
);

// --- PÁGINA 404 ---

const PaginaNaoEncontrada: React.FC = () => (
  <div className="bg-white p-8 rounded-xl shadow-lg text-center">
    <PageTitle title="404 - Página Não Encontrada" />
    <p className="text-xl text-gray-800 mb-6 leading-relaxed">
      A página que você está procurando não existe.
    </p>
    <Link to="/" className="text-blue-600 hover:text-blue-800 font-semibold text-lg underline-offset-4 hover:underline transition-colors">
      Voltar para a Página Inicial
    </Link>
  </div>
);

// --- GESTÃO DE PACIENTES (CRUD) ---

const GestaoPacientes: React.FC = () => {
  const [pacientes, setPacientes] = useState<IPaciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPacientes();
  }, []);

  const fetchPacientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/pacientes`);
      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}: Falha ao buscar pacientes.`);
      }
      const data: IPaciente[] = await response.json();
      setPacientes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este paciente?')) {
      try {
        const response = await fetch(`${API_URL}/pacientes/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Falha ao excluir paciente. Verifique se ele não está associado a uma consulta.');
        }
        setPacientes(pacientes.filter((p) => p.idPaciente !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      }
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <PageTitle title="Gestão de Pacientes" />
        <Link
          to="/pacientes/novo"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md text-base"
        >
          + Novo Paciente
        </Link>
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}
      
      {!loading && !error && pacientes.length === 0 && (
        <p className="text-gray-600 text-center text-lg mt-8">Nenhum paciente cadastrado.</p>
      )}

      {pacientes.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nome</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">CPF</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Deficiência</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pacientes.map((paciente) => (
                <tr key={paciente.idPaciente} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{paciente.idPaciente}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{paciente.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{paciente.cpf}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{paciente.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{paciente.tipoDeficiencia}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-4">
                      <Link
                        to={`/pacientes/editar/${paciente.idPaciente}`}
                        className="text-yellow-500 hover:text-yellow-700 font-medium transition-colors"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(paciente.idPaciente)}
                        className="text-red-600 hover:text-red-800 font-medium transition-colors"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const PacienteForm: React.FC = () => {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate(); 
  
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [tipoDeficiencia, setTipoDeficiencia] = useState('');
  const [idCuidador, setIdCuidador] = useState<number | ''>('');
  
  const [cuidadores, setCuidadores] = useState<ICuidador[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(id);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const cuidadoresRes = await fetch(`${API_URL}/cuidadores`);
        if (!cuidadoresRes.ok) throw new Error('Falha ao carregar cuidadores.');
        const cuidadoresData: ICuidador[] = await cuidadoresRes.json();
        setCuidadores(cuidadoresData);

        if (isEditing) {
          const pacienteRes = await fetch(`${API_URL}/pacientes/${id}`);
          if (!pacienteRes.ok) throw new Error('Falha ao carregar dados do paciente.');
          const p: IPaciente = await pacienteRes.json();
          setNome(p.nome);
          setCpf(p.cpf);
          setEmail(p.email);
          setDataNascimento(p.dataNascimento);
          setTipoDeficiencia(p.tipoDeficiencia);
          setIdCuidador(p.idCuidador);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (idCuidador === '') {
      setError('Por favor, selecione um cuidador.');
      return;
    }
    
    setLoading(true);
    setError(null);

    const pacienteData: PacienteFormTO = {
      nome,
      cpf,
      email,
      dataNascimento,
      tipoDeficiencia,
      idCuidador: Number(idCuidador),
    };

    const url = isEditing ? `${API_URL}/pacientes/${id}` : `${API_URL}/pacientes`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pacienteData),
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: Falha ao salvar paciente.`);
      }

      navigate('/pacientes'); 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setLoading(false);
    }
  };

  if (loading && !isEditing) return <LoadingSpinner />;

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-3xl mx-auto">
      <PageTitle title={isEditing ? 'Editar Paciente' : 'Novo Paciente'} />
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <ErrorMessage message={error} />}
        
        <FormInput label="Nome Completo" value={nome} onChange={(e) => setNome(e.target.value)} required />
        <FormInput label="CPF" value={cpf} onChange={(e) => setCpf(e.target.value)} required />
        <FormInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <FormInput label="Data de Nascimento" type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} required />
        <FormInput label="Tipo de Deficiência" value={tipoDeficiencia} onChange={(e) => setTipoDeficiencia(e.target.value)} required />
        
        <div>
          <label className="block text-base font-medium text-gray-800 mb-2">Cuidador Principal</label>
          <select
            value={idCuidador}
            onChange={(e) => setIdCuidador(Number(e.target.value))}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base bg-white"
            required
          >
            <option value="" disabled>Selecione um cuidador...</option>
            {cuidadores.map((c) => (
              <option key={c.idCuidador} value={c.idCuidador}>
                {c.nome} (ID: {c.idCuidador})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
          <Link to="/pacientes" className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors shadow-md text-center"
          >
            {loading ? 'Salvando...' : 'Salvar Paciente'}
          </button>
        </div>
      </form>
    </div>
  );
};


// --- GESTÃO DE CUIDADORES (CRUD) ---

const GestaoCuidadores: React.FC = () => {
  const [cuidadores, setCuidadores] = useState<ICuidador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCuidadores();
  }, []);

  const fetchCuidadores = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/cuidadores`);
      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}: Falha ao buscar cuidadores.`);
      }
      const data: ICuidador[] = await response.json();
      setCuidadores(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este cuidador?')) {
      try {
        const response = await fetch(`${API_URL}/cuidadores/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Falha ao excluir cuidador. Verifique se ele não está associado a um paciente.');
        }
        setCuidadores(cuidadores.filter((c) => c.idCuidador !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      }
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <PageTitle title="Gestão de Cuidadores" />
        <Link
          to="/cuidadores/novo"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md text-base"
        >
          + Novo Cuidador
        </Link>
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}
      
      {!loading && !error && cuidadores.length === 0 && (
        <p className="text-gray-600 text-center text-lg mt-8">Nenhum cuidador cadastrado.</p>
      )}

      {cuidadores.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nome</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Telefone</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cuidadores.map((cuidador) => (
                <tr key={cuidador.idCuidador} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cuidador.idCuidador}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{cuidador.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{cuidador.telefone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{cuidador.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-4">
                      <Link
                        to={`/cuidadores/editar/${cuidador.idCuidador}`}
                        className="text-yellow-500 hover:text-yellow-700 font-medium transition-colors"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(cuidador.idCuidador)}
                        className="text-red-600 hover:text-red-800 font-medium transition-colors"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const CuidadorForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      const fetchCuidador = async () => {
        try {
          const response = await fetch(`${API_URL}/cuidadores/${id}`);
          if (!response.ok) throw new Error('Falha ao carregar dados do cuidador.');
          const c: ICuidador = await response.json();
          setNome(c.nome);
          setTelefone(c.telefone);
          setEmail(c.email);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
          setLoading(false);
        }
      };
      fetchCuidador();
    }
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cuidadorData: CuidadorFormTO = { nome, telefone, email };
    const url = isEditing ? `${API_URL}/cuidadores/${id}` : `${API_URL}/cuidadores`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cuidadorData),
      });

      if (!response.ok) {
        try {
          const erroData = await response.json();
          const mensagem = erroData.message || `Erro ${response.status}: Falha ao salvar cuidador.`;
          throw new Error(mensagem);
        } catch (parseError) {
          throw new Error(`Erro ${response.status}: Falha ao salvar cuidador.`);
        }
      }

      navigate('/cuidadores');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setLoading(false);
    }
  };

  if (loading && isEditing) return <LoadingSpinner />;

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-3xl mx-auto">
      <PageTitle title={isEditing ? 'Editar Cuidador' : 'Novo Cuidador'} />
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <ErrorMessage message={error} />}
        
        <FormInput label="Nome Completo" value={nome} onChange={(e) => setNome(e.target.value)} required />
        <FormInput label="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} required />
        <FormInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
          <Link to="/cuidadores" className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors shadow-md text-center"
          >
            {loading ? 'Salvando...' : 'Salvar Cuidador'}
          </button>
        </div>
      </form>
    </div>
  );
};

// --- GESTÃO DE CONSULTAS (CRUD) ---

const GestaoConsultas: React.FC = () => {
  const [consultas, setConsultas] = useState<IConsulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConsultas();
  }, []);

  const fetchConsultas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/consultas`);
      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}: Falha ao buscar consultas.`);
      }
      const data: IConsulta[] = await response.json();
      setConsultas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta consulta?')) {
      try {
        const response = await fetch(`${API_URL}/consultas/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Falha ao excluir consulta.');
        }
        setConsultas(consultas.filter((c) => c.idConsulta !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      }
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <PageTitle title="Gestão de Consultas" />
        <Link
          to="/consultas/novo"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md text-base"
        >
          + Nova Consulta
        </Link>
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}
      
      {!loading && !error && consultas.length === 0 && (
        <p className="text-gray-600 text-center text-lg mt-8">Nenhuma consulta cadastrada.</p>
      )}

      {consultas.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Especialidade</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Data</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID Paciente</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {consultas.map((consulta) => (
                <tr key={consulta.idConsulta} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{consulta.idConsulta}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{consulta.especialidade}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(consulta.dataConsulta + 'T00:00:00').toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{consulta.idPaciente}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-4">
                      <Link
                        to={`/consultas/editar/${consulta.idConsulta}`}
                        className="text-yellow-500 hover:text-yellow-700 font-medium transition-colors"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(consulta.idConsulta)}
                        className="text-red-600 hover:text-red-800 font-medium transition-colors"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};


const ConsultaForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [especialidade, setEspecialidade] = useState('');
  const [dataConsulta, setDataConsulta] = useState('');
  const [detalhes, setDetalhes] = useState('');
  const [idPaciente, setIdPaciente] = useState<number | ''>('');
  
  const [pacientes, setPacientes] = useState<IPaciente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(id);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const pacientesRes = await fetch(`${API_URL}/pacientes`);
        if (!pacientesRes.ok) throw new Error('Falha ao carregar pacientes.');
        const pacientesData: IPaciente[] = await pacientesRes.json();
        setPacientes(pacientesData);

        if (isEditing) {
          const consultaRes = await fetch(`${API_URL}/consultas/${id}`);
          if (!consultaRes.ok) throw new Error('Falha ao carregar dados da consulta.');
          const c: IConsulta = await consultaRes.json();
          setEspecialidade(c.especialidade);
          setDataConsulta(c.dataConsulta);
          setDetalhes(c.detalhes);
          setIdPaciente(c.idPaciente);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (idPaciente === '') {
      setError('Por favor, selecione um paciente.');
      return;
    }
    
    setLoading(true);
    setError(null);

    const consultaData: ConsultaFormTO = {
      especialidade,
      dataConsulta,
      detalhes,
      idPaciente: Number(idPaciente),
    };

    const url = isEditing ? `${API_URL}/consultas/${id}` : `${API_URL}/consultas`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(consultaData),
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: Falha ao salvar consulta.`);
      }

      navigate('/consultas');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setLoading(false);
    }
  };

  if (loading && !isEditing) return <LoadingSpinner />;

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-3xl mx-auto">
      <PageTitle title={isEditing ? 'Editar Consulta' : 'Nova Consulta'} />
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <ErrorMessage message={error} />}
        
        <FormInput label="Especialidade da Consulta" value={especialidade} onChange={(e) => setEspecialidade(e.target.value)} required />
        <FormInput label="Data da Consulta" type="date" value={dataConsulta} onChange={(e) => setDataConsulta(e.target.value)} required />
        
        <div>
          <label className="block text-base font-medium text-gray-800 mb-2">Detalhes Adicionais</label>
          <textarea
            value={detalhes}
            onChange={(e) => setDetalhes(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base bg-white"
            rows={4} 
          />
        </div>
        
        <div>
          <label className="block text-base font-medium text-gray-800 mb-2">Paciente Associado</label>
          <select
            value={idPaciente}
            onChange={(e) => setIdPaciente(Number(e.target.value))}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base bg-white"
            required
          >
            <option value="" disabled>Selecione um paciente...</option>
            {pacientes.map((p) => (
              <option key={p.idPaciente} value={p.idPaciente}>
                {p.nome} (ID: {p.idPaciente})
              </option> 
            ))}
          </select>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
          <Link to="/consultas" className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors shadow-md text-center"
          >
            {loading ? 'Salvando...' : 'Salvar Consulta'}
          </button>
        </div>
      </form>
    </div>
  );
};


// --- COMPONENTES AUXILIARES ---

interface FormInputProps {
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({ label, value, onChange, type = 'text', required = false }) => (
  <div>
    <label className="block text-base font-medium text-gray-800 mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base bg-white"
    />
  </div>
);