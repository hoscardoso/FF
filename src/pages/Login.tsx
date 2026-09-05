import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export function Login() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const { login } = useAuth();

  async function entrar() {
    try {
      setErro('');

      const response = await fetch(
        'http://localhost:3001/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            usuario,
            senha,
          }),
        }
      );

      const data = await response.json();

      if (!data.sucesso) {
        setErro(data.mensagem);
        return;
      }

      login(data.usuario, data.token);
    } catch (error) {
      setErro('Não foi possível conectar ao servidor.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">
          Fundo Fixo CE
        </h1>

        <p className="text-sm text-slate-500 mb-6">
          Acesso ao sistema
        </p>

        {erro && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm">
            {erro}
          </div>
        )}

        <div className="space-y-4">
          <input
            className="input-base"
            placeholder="Usuário"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />

          <input
            type="password"
            className="input-base"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          <button
            onClick={entrar}
            className="btn-primary w-full justify-center"
          >
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
}