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
        'http://10.19.20.170:3001/api/auth/login',
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
    } catch {
      setErro('Não foi possível conectar ao servidor.');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D4FD7] via-[#8B1FFF] to-[#D31145] relative overflow-hidden">

      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute w-[800px] h-[800px] border border-white rounded-full -left-40 top-10" />
        <div className="absolute w-[500px] h-[500px] border border-white rounded-full left-0 top-60" />
      </div>

      <header className="flex items-center justify-between px-8 py-5 relative z-10">
        <div className="flex items-center gap-3 text-white">
          <div className="w-10 h-10 rounded-xl border border-white/30 bg-white/10" />

          <span className="font-bold text-2xl">
            Fundo Fixo CE
          </span>
        </div>

        <div className="bg-black/20 text-white px-5 py-2 rounded-full text-sm font-medium">
          Portal de Acesso
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 min-h-[80vh] items-center">

        <div className="text-white relative z-10">

          <div className="inline-flex items-center gap-2 bg-white/15 px-5 py-2 rounded-full text-sm font-semibold mb-8">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            PRESTAÇÃO DE CONTAS CORPORATIVAS
          </div>

          <h1 className="text-7xl font-extrabold leading-none mb-6">
            Incorpore
            <br />
            o futuro
          </h1>

          <p className="text-2xl text-white/80 max-w-xl mb-12">
            Gerencie fundo fixo, extratos,
            comprovantes e prestação de contas
            com segurança total.
          </p>

          <div className="relative w-[420px] h-[280px] mt-8">

            <div
  className="
    absolute
    left-0
    bottom-0
    w-[320px]
    h-[300px]
    bg-slate-900
    rounded-[36px]
    rotate-[-4deg]
    shadow-2xl
    border-[6px]
    border-slate-800
    overflow-hidden
  "
>

              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-14 h-2 rounded-full bg-slate-800" />

<div className="bg-white rounded-[28px] h-[260px] m-2 p-3">

  <div className="flex items-center gap-2 mb-3">
    <div className="w-5 h-5 bg-blue-600 rounded-md flex items-center justify-center text-white text-[9px] font-bold">
      FF
    </div>

    <span className="text-[11px] font-bold text-slate-700">
      Fundo Fixo CE
    </span>
  </div>

  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-3 text-white mb-3">
    <div className="text-[9px] opacity-80">
      SALDO DISPONÍVEL
    </div>

    <div className="text-2xl font-extrabold">
      R$ 15.480,00
    </div>
  </div>

  <div className="flex justify-between text-[10px] mb-2">
    <span className="text-slate-400">
      Lançamentos
    </span>

    <span className="text-blue-600 font-semibold">
      Ver todos
    </span>
  </div>

  <div className="flex justify-between items-center bg-slate-50 rounded-xl p-2">

    <div className="flex gap-2">
      <div className="w-6 h-6 rounded-md bg-green-100" />

      <div>
        <div className="text-[10px] font-bold text-slate-700">
          Prestação de Contas
        </div>

        <div className="text-[8px] text-slate-400">
          Hoje, 10:42
        </div>
      </div>
    </div>

    <div className="text-green-600 font-bold text-sm">
      + R$ 350,00
    </div>

  </div>

</div>
            </div>

            <div
  className="
    absolute
    right-0
    top-0
    w-[210px]
    h-[120px]
    rounded-[24px]
    bg-gradient-to-br
    from-violet-800
    via-purple-700
    to-indigo-900
    shadow-2xl
    border border-white/20
    p-5
    text-white
  "
>
             <div className="text-right text-yellow-300 text-[11px] font-bold mb-4">
  CORPORATE
</div>

              <div className="font-bold tracking-[4px]">
                •••• 8824
              </div>
              <div className="flex justify-between items-end mt-4 text-[10px]">

  <span className="opacity-80">
    FUNDO FIXO CE
  </span>

  <span className="opacity-80 font-medium">
    10/28
  </span>

</div>

              <div className="text-xs mt-5">
                
              </div>
            </div>

          </div>
        </div>

        <div className="flex justify-center relative z-20">

          <div className="relative z-20 bg-white rounded-[36px] p-10 w-full max-w-lg shadow-2xl">

            <div className="flex items-center gap-4 mb-8">

              <div className="w-14 h-14 bg-blue-600 rounded-2xl" />

              <div>
                <h2 className="text-4xl font-bold text-slate-800">
                  Fundo Fixo CE
                </h2>

                <p className="text-slate-500">
                  Digite sua conta para continuar
                </p>
              </div>
            </div>

            {erro && (
              <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm">
                {erro}
              </div>
            )}

            <div className="space-y-5">

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">
                  USUÁRIO / CONTA
                </label>

                <input
                  className="w-full h-14 px-5 rounded-2xl border border-slate-200 bg-slate-50 relative z-30"
                  placeholder="Digite seu usuário ou conta"
                  value={usuario}
                  onChange={(e) =>
                    setUsuario(e.target.value)
                  }
                />
              </div>

              <div>

                <div className="flex justify-between mb-2">

                  <label className="text-xs font-bold text-slate-600">
                    SENHA
                  </label>

                </div>

                <input
                  type="password"
                  className="w-full h-14 px-5 rounded-2xl border border-slate-200 bg-slate-50 relative z-30"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) =>
                    setSenha(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      entrar();
                    }
                  }}
                />
              </div>

            <button
  onClick={entrar}
  disabled={!usuario || !senha}
  className={`
    w-full
    h-14
    rounded-2xl
    text-white
    font-bold
    transition-all
    ${
      usuario && senha
        ? 'bg-blue-600 hover:bg-blue-700'
        : 'bg-slate-300 cursor-not-allowed'
    }
  `}
>
  CONTINUAR
</button>

            </div>

            <div className="border-t mt-8 pt-6 text-center text-slate-400 text-sm">
              Versão 2.1.0
            </div>

          </div>
        </div>
      </div>

      <footer className="absolute bottom-3 left-0 right-0 text-center text-white/70 text-sm">
        © 2026 Fundo Fixo CE - Todos os direitos reservados.
      </footer>
    </div>
  );
}