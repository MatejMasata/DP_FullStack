import React from "react";
import styles from "./TreeDataTable.module.css";
import { KebabMenu } from "../KebabMenu";
import { treeDataColumns } from "../../config/TablesConfig";

export function TreeDataTable({
  treeDataEntries,
  canManageTreeData,
  onUpdateTreeData,
  onDeleteTreeData,
  mutationIsPending,
}) {
  if (!treeDataEntries || treeDataEntries.length === 0) {
    return (
      <p className={styles.noDataMessage}>
        No tree data entries found for this tree.
      </p>
    );
  }

  // Helper to format date-time if the accessor type is 'date' or 'datetime'
  const formatCellValue = (item, column) => {
    if (column.type === "date" && item[column.accessor]) {
      const date = new Date(item[column.accessor]);
      // Format as YYYY-MM-DD HH:MM if it includes time, otherwise just date
      if (item[column.accessor].includes("T")) {
        return date
          .toLocaleDateString(undefined, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false, // Use 24-hour format
          })
          .replace(",", "");
      }
      return date.toLocaleDateString();
    }

    if (typeof item[column.accessor] === "number") {
      return item[column.accessor].toString();
    }
    return item[column.accessor];
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.treeDataTable}>
        <thead>
          <tr>
            {treeDataColumns.map((col) => (
              <th key={col.accessor}>{col.header}</th>
            ))}
            {canManageTreeData && (
              <th className={styles.actionsHeader}>Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {treeDataEntries.map((treeDataEntry) => (
            <tr key={treeDataEntry.id}>
              {treeDataColumns.map((col) => (
                <td key={col.accessor}>
                  {formatCellValue(treeDataEntry, col)}
                </td>
              ))}
              {canManageTreeData && (
                <td className={styles.actionsCell}>
                  <KebabMenu
                    canUpdate={true}
                    canDelete={true}
                    onUpdateClick={() => onUpdateTreeData(treeDataEntry)}
                    onDeleteClick={() => onDeleteTreeData(treeDataEntry)}
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
