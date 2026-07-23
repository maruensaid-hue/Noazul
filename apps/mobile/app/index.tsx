import { Redirect } from "expo-router";

import { currentYearMonth } from "../src/lib/dates";
import { useProfileStore } from "../src/stores/profileStore";

export default function Index() {
  const activeProfileId = useProfileStore((state) => state.activeProfileId);

  if (!activeProfileId) {
    return <Redirect href="/(onboarding)" />;
  }

  return <Redirect href={`/month/${currentYearMonth()}`} />;
}
