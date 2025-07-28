"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";

interface UserContextType {
  isPremium: boolean;
  setIsPremium: (isPremium: boolean) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserSubscription = async () => {
      if (session?.user?.email) {
        try {
          // TODO: Replace with actual API call to check user subscription
          // For now, we'll check localStorage for demo purposes
          const premiumStatus = localStorage.getItem(
            `premium_${session.user.email}`
          );
          setIsPremium(premiumStatus === "true");
        } catch (error) {
          console.error("Error checking subscription:", error);
          setIsPremium(false);
        }
      } else {
        setIsPremium(false);
      }
      setIsLoading(false);
    };

    checkUserSubscription();
  }, [session]);

  const updatePremiumStatus = (status: boolean) => {
    setIsPremium(status);
    if (session?.user?.email) {
      localStorage.setItem(`premium_${session.user.email}`, status.toString());
    }
  };

  return (
    <UserContext.Provider
      value={{
        isPremium,
        setIsPremium: updatePremiumStatus,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
