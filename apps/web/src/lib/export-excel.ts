/**
 * 엑셀(CSV) 내보내기 유틸리티
 * 외부 라이브러리 없이 CSV 형식으로 데이터를 내보냅니다.
 * BOM을 추가하여 한글이 깨지지 않도록 합니다.
 */

interface ExportColumn<T> {
  header: string;
  accessor: (row: T) => string | number;
}

export function exportToCSV<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string,
): void {
  if (data.length === 0) return;

  const headers = columns.map((col) => `"${col.header}"`).join(",");
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = col.accessor(row);
        if (typeof value === "string") {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(","),
  );

  const BOM = "\uFEFF";
  const csvContent = BOM + [headers, ...rows].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
