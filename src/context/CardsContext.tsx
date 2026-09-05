import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export interface Card {
  id: number;
  responsavel: string;
  conta: string;
  ativo: number;
}

interface CardsContextType {
  cards: Card[];
  carregarCards: () => Promise<void>;
}

const CardsContext =
  createContext<CardsContextType | null>(null);

export function CardsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    carregarCards();
  }, []);

  async function carregarCards() {
    try {
      const response = await fetch(
        'http://localhost:3001/api/cards'
      );

      const data = await response.json();

      setCards(data);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <CardsContext.Provider
      value={{
        cards,
        carregarCards,
      }}
    >
      {children}
    </CardsContext.Provider>
  );
}

export function useCards() {
  const ctx = useContext(CardsContext);

  if (!ctx) {
    throw new Error(
      'useCards deve ser usado dentro do CardsProvider'
    );
  }

  return ctx;
}