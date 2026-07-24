import { useMutation } from "@tanstack/react-query";

import { sendLoginLink, signOut } from "./repository";

export function useSendLoginLink() {
  return useMutation({
    mutationFn: (email: string) => sendLoginLink(email),
  });
}

export function useSignOut() {
  return useMutation({
    mutationFn: () => signOut(),
  });
}
