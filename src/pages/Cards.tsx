import { useEffect, useState } from 'react';

interface Card {
  id: number;
  responsavel: string;
  conta: string;
  ativo: number;
}

export function Cards() {
  const [cards, setCards] = useState<Card[]>([]);

  const [responsavel, setResponsavel] =
    useState('');

  const [conta, setConta] =
    useState('');

  const [modalOpen, setModalOpen] =
    useState(false);

  useEffect(() => {
    carregarCards();
  }, []);

  async function carregarCards() {
    const response = await fetch(
      'http://localhost:3001/api/cards'
    );

    const data = await response.json();

    setCards(data);
  }

  async function criarCard() {
    await fetch(
      'http://localhost:3001/api/cards',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify({
          responsavel,
          conta,
        }),
      }
    );

    setResponsavel('');
    setConta('');
    setModalOpen(false);

    carregarCards();
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Cartões
          </h1>

          <p className="text-slate-500">
            Cadastro de cartões
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={() =>
            setModalOpen(true)
          }
        >
          Novo Cartão
        </button>
      </div>

      <div className="card-base p-6">

        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-3">
                Responsável
              </th>

              <th className="text-left p-3">
                Conta
              </th>

              <th className="text-left p-3">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {cards.map((card) => (
              <tr
                key={card.id}
                className="border-b"
              >
                <td className="p-3">
                  {card.responsavel}
                </td>

                <td className="p-3">
                  {card.conta}
                </td>

                <td className="p-3">
                  {card.ativo
                    ? 'Ativo'
                    : 'Inativo'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl p-6 w-full max-w-md">

            <h2 className="text-xl font-bold mb-4">
              Novo Cartão
            </h2>

            <div className="space-y-3">

              <input
                className="input-base"
                placeholder="Responsável"
                value={responsavel}
                onChange={(e) =>
                  setResponsavel(
                    e.target.value
                  )
                }
              />

              <input
                className="input-base"
                placeholder="Conta"
                value={conta}
                onChange={(e) =>
                  setConta(
                    e.target.value
                  )
                }
              />

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
                onClick={criarCard}
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