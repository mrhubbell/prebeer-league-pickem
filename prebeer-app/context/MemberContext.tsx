"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

interface CurrentMember {
  memberId: number | null;
  displayName: string;
}

interface MemberContextType {
  currentMember: CurrentMember;
  setCurrentMember: (
    memberId: number,
    displayName: string
  ) => void;
}

const MemberContext = createContext<MemberContextType | undefined>(
  undefined
);

export function MemberProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [currentMember, setCurrentMemberState] =
    useState<CurrentMember>(() => {
      if (typeof window === "undefined") {
        return {
          memberId: null,
          displayName: "",
        };
      }

      return {
        memberId: Number(
          localStorage.getItem("memberId")
        ) || null,
        displayName:
          localStorage.getItem("memberName") || "",
      };
    });

  function setCurrentMember(
    memberId: number,
    displayName: string
  ) {
    setCurrentMemberState({
      memberId,
      displayName,
    });

    localStorage.setItem(
      "memberId",
      memberId.toString()
    );

    localStorage.setItem(
      "memberName",
      displayName
    );
  }

  return (
    <MemberContext.Provider
      value={{
        currentMember,
        setCurrentMember,
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