import { User } from "firebase/auth";
import { createContext } from "react";
interface AuthContextType {
    authLoading: boolean;
    user: User | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);