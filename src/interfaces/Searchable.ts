/**
 * Interface untuk object yang bisa dicari berdasarkan keyword.
 * Diimplementasikan oleh entity yang perlu fitur pencarian.
 */
export interface Searchable {
  /**
   * Cek apakah object ini cocok dengan keyword yang diberikan.
   * @param keyword - kata kunci pencarian (case-insensitive)
   * @returns true jika cocok, false jika tidak
   */
  matches(keyword: string): boolean;
}
