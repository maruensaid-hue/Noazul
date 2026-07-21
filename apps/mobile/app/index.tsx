import { Redirect } from "expo-router";

import { currentYearMonth } from "../src/lib/dates";

export default function Index() {
  return <Redirect href={`/month/${currentYearMonth()}`} />;
}
