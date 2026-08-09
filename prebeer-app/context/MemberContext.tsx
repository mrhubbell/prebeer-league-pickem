"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { createClient } from "@supabase/supabase-js";

interface CurrentMember {
  memberId: number | null;
  displayName: string;
  teamName: string;
  email: string;
  role: "MEMBER" | "COMMISSIONER";
}

interface MemberContextType {
  currentMember: CurrentMember;
  loading: boolean;
}

const MemberContext = createContext<MemberContextType | undefined>(
  undefined
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const emptyMember: CurrentMember = {
  memberId: null,
  displayName: "",
  teamName: "",
  email: "",
  role: "MEMBER",
};

export function MemberProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [currentMember, setCurrentMember] =
    useState<CurrentMember>(emptyMember);

  const [loading, setLoading] = useState(true);

  async function loadCurrentMember(accessToken: string) {
    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setCurrentMember({
  memberId: result.member.member_id,
  displayName:
    result.member.display_name ||
    `${result.member.first_name} ${result.member.last_name}`,
  teamName: result.member.team_name || "",
  email: result.member.email || "",
  role:
    result.member.role === "COMMISSIONER"
      ? "COMMISSIONER"
      : "MEMBER",
});
      } else {
        setCurrentMember(emptyMember);
      }
    } catch (error) {
      console.error(
        "Unable to load current member:",
        error
      );

      setCurrentMember(emptyMember);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function initialize() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token) {
        await loadCurrentMember(session.access_token);
      } else {
        setCurrentMember(emptyMember);
        setLoading(false);
      }
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          setCurrentMember(emptyMember);
          setLoading(false);
          return;
        }

        if (
          (event === "SIGNED_IN" ||
            event === "TOKEN_REFRESHED") &&
          session?.access_token
        ) {
          void loadCurrentMember(session.access_token);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <MemberContext.Provider
      value={{
        currentMember,
        loading,
      }}
    >
      {children}
    </MemberContext.Provider>
  );
}

export function useMember() {
  const context = useContext(MemberContext);

  if (!context) {
    throw new Error(
      "useMember must be used inside MemberProvider."
    );
  }

  return context;
}