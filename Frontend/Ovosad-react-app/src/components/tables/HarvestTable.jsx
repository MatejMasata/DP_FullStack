import React from "react";
import styles from "./HarvestTable.module.css";
import { KebabMenu } from "../KebabMenu";
import { harvestColumns } from "../../config/TablesConfig";

export function HarvestTable({
  harvests,
  canManageHarvests,
  onUpdateHarvest,
  onDeleteHarvest,
  mutationIsPending,
}) {
  if (!harvests || harvests.length === 0) {
    return (
      <p className={styles.noDataMessage}>No harvests found for this tree.</p>
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
    return item[column.accessor];
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.harvestTable}>
        <thead>
          <tr>
            {harvestColumns.map((col) => (
              <th key={col.accessor}>{col.header}</th>
            ))}
            {canManageHarvests && (
              <th className={styles.actionsHeader}>Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {harvests.map((harvest) => (
            <tr key={harvest.id}>
              {harvestColumns.map((col) => (
                <td key={col.accessor}>{formatCellValue(harvest, col)}</td>
              ))}
              {canManageHarvests && (
                <td className={styles.actionsCell}>
                  <KebabMenu
                    canUpdate={true} // Can update if canManageHarvests is true
                    canDelete={true} // Can delete if canManageHarvests is true
                    onUpdateClick={() => onUpdateHarvest(harvest)}
                    onDeleteClick={() => onDeleteHarvest(harvest)}
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
