/** A file the console has prepared (or will prepare) for download. */
export interface PreparedExport {
  fileName: string;
  /** "1,333 bookings × 11 columns" */
  summary: string;
  /** "219 KB" */
  sizeLabel: string;
}
