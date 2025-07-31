import React from "react";
import styles from "./FruitThinningTable.module.css";
import { KebabMenu } from "../KebabMenu";
import { fruitThinningColumns } from "../../config/TablesConfig";

export function FruitThinningTable({
  fruitThinnings,
  canManageFruitThinnings,
  onUpdateFruitThinning,
  onDeleteFruitThinning,
  mutationIsPending,
}) {
  if (!fruitThinnings || fruitThinnings.length === 0) {
    return (
      <p className={styles.noDataMessage}>
        No fruit thinning entries found for this tree.
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
      <table className={styles.fruitThinningTable}>
        <thead>
          <tr>
            {fruitThinningColumns.map((col) => (
              <th key={col.accessor}>{col.header}</th>
            ))}
            {canManageFruitThinnings && (
              <th className={styles.actionsHeader}>Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {fruitThinnings.map((fruitThinning) => (
            <tr key={fruitThinning.id}>
              {fruitThinningColumns.map((col) => (
                <td key={col.accessor}>
                  {formatCellValue(fruitThinning, col)}
                </td>
              ))}
              {canManageFruitThinnings && (
                <td className={styles.actionsCell}>
                  <KebabMenu
                    canUpdate={true}
                    canDelete={true}
                    onUpdateClick={() => onUpdateFruitThinning(fruitThinning)}
                    onDeleteClick={() => onDeleteFruitThinning(fruitThinning)}
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
