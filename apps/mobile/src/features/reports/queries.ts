import { useMutation, useQuery } from "@tanstack/react-query";

import { shareGeneratedFile } from "../../services/fileExport";
import { printReportToPdf } from "../../services/print";
import { listReportTransactions } from "./repository";
import { buildReportHtml, computeReportTotals, type ReportHtmlOptions } from "./pdf";
import type { ReportFilters } from "./types";

export function useReportTransactions(profileId: string | null, filters: ReportFilters) {
  return useQuery({
    queryKey: ["transactions", profileId ?? "", "report", filters],
    queryFn: () => listReportTransactions(profileId as string, filters),
    enabled: profileId !== null,
  });
}

export function useGenerateReportPdf() {
  return useMutation({
    mutationFn: async ({
      rows,
      options,
      fileName,
    }: {
      rows: Parameters<typeof buildReportHtml>[0];
      options: ReportHtmlOptions;
      fileName: string;
    }) => {
      const totals = computeReportTotals(rows);
      const html = buildReportHtml(rows, totals, options);
      const pdfUri = await printReportToPdf(html);
      await shareGeneratedFile(pdfUri, fileName, "application/pdf");
    },
  });
}
