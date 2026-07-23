import * as Print from "expo-print";

/** Renders an HTML string to a PDF file and returns its (opaquely-named) file:// URI. */
export async function printReportToPdf(html: string): Promise<string> {
  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}
