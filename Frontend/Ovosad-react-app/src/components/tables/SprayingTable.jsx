import React from "react";
import styles from "./SprayingTable.module.css";
import { KebabMenu } from "../KebabMenu";
import { sprayingColumns } from "../../config/TablesConfig";

export function SprayingTable({
  sprayings,
  canManageSprayings,
  onUpdateSpraying,
  onDeleteSpraying,
  mutationIsPending,
}) {
  if (!sprayings || sprayings.length === 0) {
    return (
      <p className={styles.noDataMessage}>No sprayings found for this tree.</p>
    );
  }

  // Helper to format date-time if the accessor type is 'date' or 'datetime-local'
  const formatCellValue = (item, column) => {
    if (
      (column.type === "date" || column.type === "datetime-local") &&
      item[column.accessor]
    ) {
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
    // For agent_name, we assume it's directly available in the item for display
    if (column.accessor === "agent_name") {
      return item[column.accessor] || "N/A";
    }
    if (typeof item[column.accessor] === "number") {
      return item[column.accessor].toString();
    }
    return item[column.accessor];
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.sprayingTable}>
        <thead>
          <tr>
            {sprayingColumns.map((col) => (
              <th key={col.accessor}>{col.header}</th>
            ))}
            {canManageSprayings && (
              <th className={styles.actionsHeader}>Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {sprayings.map((spraying) => (
            <tr key={spraying.id}>
              {sprayingColumns.map((col) => (
                <td key={col.accessor}>{formatCellValue(spraying, col)}</td>
              ))}
              {canManageSprayings && (
                <td className={styles.actionsCell}>
                  <KebabMenu
                    canUpdate={true} // Can update if canManageSprayings is true
                    canDelete={true} // Can delete if canManageSprayings is true
                    onUpdateClick={() => onUpdateSpraying(spraying)}
                    onDeleteClick={() => onDeleteSpraying(spraying)}
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
