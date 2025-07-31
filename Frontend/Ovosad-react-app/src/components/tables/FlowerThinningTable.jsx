import React from "react";
import styles from "./FlowerThinningTable.module.css";
import { KebabMenu } from "../KebabMenu";
import { flowerThinningColumns } from "../../config/TablesConfig";

export function FlowerThinningTable({
  flowerThinnings,
  canManageFlowerThinnings,
  onUpdateFlowerThinning,
  onDeleteFlowerThinning,
  mutationIsPending,
}) {
  if (!flowerThinnings || flowerThinnings.length === 0) {
    return (
      <p className={styles.noDataMessage}>
        No flower thinning entries found for this tree.
      </p>
    );
  }

  // Helper to format cell values
  const formatCellValue = (item, column) => {
    if (
      (column.type === "date" || column.type === "datetime-local") &&
      item[column.accessor]
    ) {
      const date = new Date(item[column.accessor]);
      if (item[column.accessor].includes("T")) {
        return date
          .toLocaleDateString(undefined, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
          .replace(",", "");
      }
      return date.toLocaleDateString();
    }
    if (column.type === "boolean") {
      return item[column.accessor] ? "Yes" : "No";
    }
    if (typeof item[column.accessor] === "number") {
      return item[column.accessor].toString();
    }
    return item[column.accessor];
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.flowerThinningTable}>
        <thead>
          <tr>
            {flowerThinningColumns.map((col) => (
              <th key={col.accessor}>{col.header}</th>
            ))}
            {canManageFlowerThinnings && (
              <th className={styles.actionsHeader}>Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {flowerThinnings.map((flowerThinning) => (
            <tr key={flowerThinning.id}>
              {flowerThinningColumns.map((col) => (
                <td key={col.accessor}>
                  {formatCellValue(flowerThinning, col)}
                </td>
              ))}
              {canManageFlowerThinnings && (
                <td className={styles.actionsCell}>
                  <KebabMenu
                    canUpdate={true}
                    canDelete={true}
                    onUpdateClick={() => onUpdateFlowerThinning(flowerThinning)}
                    onDeleteClick={() => onDeleteFlowerThinning(flowerThinning)}
                    mutationIsPending={mutationIsPending}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
