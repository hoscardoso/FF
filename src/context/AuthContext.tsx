import {
  createContext,
  useContext,
  useState,
  ReactNode
} from 'react';

interface User {
  nome: string;
  usuario: string;
  perfil: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
const [user, setUser] = useState<User | null>(() => {
  const dados = localStorage.getItem('usuario');

  return dados
    ? JSON.parse(dados)
    : null;
});

const [token, setToken] = useState<string | null>(() => {
  return localStorage.getItem('token');
});

  const login = (
    userData: User,
    authToken: string
  ) => {
    setUser(userData);
    setToken(authToken);

    localStorage.setItem(
      'token',
      authToken
    );

    localStorage.setItem(
      'usuario',
      JSON.stringify(userData)
    );
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      'useAuth deve ser usado dentro do AuthProvider'
    );
  }

  return ctx;
}