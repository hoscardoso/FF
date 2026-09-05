import { useState } from 'react';

export function Users() {
  const [usuarios] = useState([
    {
      id: 1,
      nome: 'Oscar Cardoso',
      usuario: 'oscardoso',
      perfil: 'MASTER',
      ativo: true,
    },
    {
      id: 2,
      nome: 'Tamara Cardoso',
      usuario: 'tsales',
      perfil: 'ADMIN',
      ativo: true,
    },
    {
      id: 3,
      nome: 'Wandrecreia Botelho',
      usuario: 'secretariace',
      perfil: 'USER',
      ativo: true,
    },
    {
      id: 4,
      nome: 'Bp. Fernando Souza',
      usuario: 'hfsouza',
      perfil: 'USER',
      ativo: true,
    },
  ]);

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Usuários
          </h1>

          <p className="text-slate-500">
            Administração de usuários do sistema
          </p>
        </div>

        <button className="btn-primary">
          Novo Usuário
        </button>
      </div>

      <div className="card-base p-6 overflow-x-auto">
        <table className="w-full">

          <thead>
            <tr className="border-b">
              <th className="text-left p-3">
                Nome
              </th>

              <th className="text-left p-3">
                Usuário
              </th>

              <th className="text-left p-3">
                Perfil
              </th>

              <th className="text-left p-3">
                Status
              </th>

              <th className="text-left p-3">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {usuarios.map((usuario) => (
              <tr
                key={usuario.id}
                className="border-b"
              >
                <td className="p-3">
                  {usuario.nome}
                </td>

                <td className="p-3">
                  {usuario.usuario}
                </td>

                <td className="p-3">
                  {usuario.perfil}
                </td>

                <td className="p-3">
                  {usuario.ativo
                    ? 'Ativo'
                    : 'Bloqueado'}
                </td>

                <td className="p-3">
                  <div className="flex gap-2">

                    <button className="btn-secondary">
                      Editar
                    </button>

                    <button className="btn-secondary">
                      Senha
                    </button>

                    <button className="btn-danger">
                      Bloquear
                    </button>

                  </div>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
}