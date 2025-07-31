import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./FileBatchTable.module.css";
import { KebabMenu } from "../KebabMenu";
import { fileBatchColumns } from "../../config/TablesConfig";

export function FileBatchTable({
  fileBatches,
  canManage,
  onUpdate,
  onDelete,
  mutationIsPending,
}) {
  const navigate = useNavigate();

  if (!fileBatches || fileBatches.length === 0) {
    return <p className={styles.noDataMessage}>No file batches found.</p>;
  }

  const handleRowClick = (id) => {
    navigate(`/filebatch/${id}`);
  };

  // Format the 'File Count' column to show the number of files
  const formatCellValue = (item, column) => {
    if (column.accessor === "files" && Array.isArray(item[column.accessor])) {
      return item[column.accessor].length;
    }
    return item[column.accessor];
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.fileBatchTable}>
        <thead>
          <tr>
            {fileBatchColumns.map((col) => (
              <th key={col.accessor}>{col.header}</th>
            ))}
            {canManage && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {fileBatches.map((batch) => (
            <tr key={batch.id} onClick={() => handleRowClick(batch.id)}>
              {fileBatchColumns.map((col) => (
                <td key={col.accessor}>{formatCellValue(batch, col)}</td>
              ))}
              {canManage && (
                <td onClick={(e) => e.stopPropagation()}>
                  <KebabMenu
                    canUpdate={true}
                    canDelete={true}
                    onUpdateClick={() => onUpdate(batch)}
                    onDeleteClick={() => onDelete(batch)}
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
