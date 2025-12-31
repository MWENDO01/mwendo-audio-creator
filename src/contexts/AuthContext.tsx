import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionInfo {
  subscribed: boolean;
  plan: "free" | "pro" | "enterprise";
  productId: string | null;
  subscriptionEnd: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscription: SubscriptionInfo;
  subscriptionLoading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const defaultSubscription: SubscriptionInfo = {
  subscribed: false,
  plan: "free",
  productId: null,
  subscriptionEnd: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionInfo>(defaultSubscription);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  const checkSubscription = useCallback(async (currentSession: Session | null) => {
    if (!currentSession?.user) {
      setSubscription(defaultSubscription);
      return;
    }

    setSubscriptionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) {
        console.error("Error checking subscription:", error);
        setSubscription(defaultSubscription);
        return;
      }

      setSubscription({
        subscribed: data.subscribed || false,
        plan: data.plan || "free",
        productId: data.product_id || null,
        subscriptionEnd: data.subscription_end || null,
      });
    } catch (error) {
      console.error("Error checking subscription:", error);
      setSubscription(defaultSubscription);
    } finally {
      setSubscriptionLoading(false);
    }
  }, []);

  const refreshSubscription = useCallback(async () => {
    await checkSubscription(session);
  }, [session, checkSubscription]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Check subscription on auth state change (deferred to avoid deadlock)
        if (session?.user) {
          setTimeout(() => {
            checkSubscription(session);
          }, 0);
        } else {
          setSubscription(defaultSubscription);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        checkSubscription(session);
      }
    });

    return () => authSubscription.unsubscribe();
  }, [checkSubscription]);

  // Periodic subscription check every 60 seconds
  useEffect(() => {
    if (!session?.user) return;

    const interval = setInterval(() => {
      checkSubscription(session);
    }, 60000);

    return () => clearInterval(interval);
  }, [session, checkSubscription]);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSubscription(defaultSubscription);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      subscription,
      subscriptionLoading,
      signUp, 
      signIn, 
      signOut,
      refreshSubscription
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
