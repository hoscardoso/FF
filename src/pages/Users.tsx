import { useEffect, useState } from 'react';
import type { User, UserRole } from '@/types';

export function Users() {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);

const [usuarioSelecionado, setUsuarioSelecionado] =
  useState<User | null>(null);

const [novaSenha, setNovaSenha] = useState('');

  const [nome, setNome] = useState('');
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] =
    useState<UserRole>('USER');

  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function carregarUsuarios() {
    try {
      const response = await fetch(
        'http://localhost:3001/api/users'
      );

      const data = await response.json();

      setUsuarios(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function criarUsuario() {
    try {
      const response = await fetch(
        'http://localhost:3001/api/users',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            nome,
            usuario,
            senha,
            perfil,
          }),
        }
      );

      const data = await response.json();

      if (data.sucesso) {
        setModalOpen(false);

        setNome('');
        setUsuario('');
        setSenha('');
        setPerfil('USER');

        carregarUsuarios();
      }
    } catch (error) {
      console.error(error);
    }
  }
  async function alterarSenha() {
  if (!usuarioSelecionado) return;

  try {
    await fetch(
      `http://localhost:3001/api/users/${usuarioSelecionado.id}/password`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senha: novaSenha,
        }),
      }
    );

    setNovaSenha('');
    setPasswordModal(false);

    alert('Senha alterada com sucesso!');
  } catch (error) {
    console.error(error);
  }
}

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Usuários
          </h1>

          <p className="text-slate-500">
            Administração de usuários
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={() =>
            setModalOpen(true)
          }
        >
          Novo Usuário
        </button>
      </div>

      <div className="card-base p-6 overflow-x-auto">

        {loading ? (
          <p>
            Carregando usuários...
          </p>
        ) : (
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
              {usuarios.map((u) => (
                <tr
                  key={u.id}
                  className="border-b"
                >
                  <td className="p-3">
                    {u.nome}
                  </td>

                  <td className="p-3">
                    {u.usuario}
                  </td>

                  <td className="p-3">
                    {u.perfil}
                  </td>

                  <td className="p-3">
                    {u.ativo
                      ? 'Ativo'
                      : 'Bloqueado'}
                  </td>

                  <td className="p-3">
                    <div className="flex gap-2">
                      <button className="btn-secondary">
                        Editar
                      </button>

                      <button
                      className="btn-secondary"
                      onClick={() => {
                        setUsuarioSelecionado(u);
                        setPasswordModal(true);
                        }}
                        >
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
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl p-6 w-full max-w-md">

            <h2 className="text-xl font-bold mb-4">
              Novo Usuário
            </h2>

            <div className="space-y-3">

              <input
                className="input-base"
                placeholder="Nome"
                value={nome}
                onChange={(e) =>
                  setNome(e.target.value)
                }
              />

              <input
                className="input-base"
                placeholder="Usuário"
                value={usuario}
                onChange={(e) =>
                  setUsuario(
                    e.target.value
                  )
                }
              />

              <input
                type="password"
                className="input-base"
                placeholder="Senha"
                value={senha}
                onChange={(e) =>
                  setSenha(e.target.value)
                }
              />

              <select
                className="input-base"
                value={perfil}
                onChange={(e) =>
                  setPerfil(
                    e.target
                      .value as UserRole
                  )
                }
              >
                <option value="MASTER">
                  MASTER
                </option>

                <option value="ADMIN">
                  ADMIN
                </option>

                <option value="USER">
                  USER
                </option>
              </select>

            </div>

            <div className="flex justify-end gap-2 mt-6">

              <button
                className="btn-secondary"
                onClick={() =>
                  setModalOpen(false)
                }
              >
                Cancelar
              </button>

              <button
                className="btn-primary"
                onClick={criarUsuario}
              >
                Salvar
              </button>

            </div>
          </div>
        </div>
      )}
          {passwordModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl p-6 w-full max-w-md">

            <h2 className="text-xl font-bold mb-4">
              Alterar Senha
            </h2>

            <p className="text-sm text-slate-500 mb-4">
              {usuarioSelecionado?.nome}
            </p>

            <input
              type="password"
              className="input-base"
              placeholder="Nova senha"
              value={novaSenha}
              onChange={(e) =>
                setNovaSenha(e.target.value)
              }
            />

            <div className="flex justify-end gap-2 mt-6">

              <button
                className="btn-secondary"
                onClick={() => {
                  setPasswordModal(false);
                  setNovaSenha('');
                }}
              >
                Cancelar
              </button>

              <button
                className="btn-primary"
                onClick={alterarSenha}
              >
                Salvar
              </button>

            </div>

          </div>

        </div>
      )}
    </div>
  );
}