import { useMutation } from "@tanstack/react-query";

import { sendLoginCode, signOut, verifyLoginCode } from "./repository";

export function useSendLoginCode() {
  return useMutation({
    mutationFn: (email: string) => sendLoginCode(email),
  });
}

export function useVerifyLoginCode() {
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) => verifyLoginCode(email, code),
  });
}

export function useSignOut() {
  return useMutation({
    mutationFn: () => signOut(),
  });
}
