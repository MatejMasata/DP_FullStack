import React from "react";
import styles from "./AgentTable.module.css";
import { KebabMenu } from "../KebabMenu";
import { agentColumns } from "../../config/TablesConfig";

export function AgentTable({
  agents,
  canManageAgents,
  onUpdateAgent,
  onDeleteAgent,
  mutationIsPending,
}) {
  if (!agents || agents.length === 0) {
    return <p className={styles.noDataMessage}>No agents found.</p>;
  }

  // Helper to format cell values for sprayings (total quantity instead of IDs)
  const formatCellValue = (item, column) => {
    if (
      column.accessor === "sprayings" &&
      Array.isArray(item[column.accessor])
    ) {
      return item[column.accessor].length.toString();
    }
    // Other column types, return as is
    return item[column.accessor];
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.agentTable}>
        <thead>
          <tr>
            {agentColumns.map((col) => (
              <th key={col.accessor}>{col.header}</th>
            ))}
            {canManageAgents && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {agents.map((agent) => (
            <tr key={agent.id}>
              {agentColumns.map((col) => (
                <td key={col.accessor}>{formatCellValue(agent, col)}</td>
              ))}
              {canManageAgents && (
                <td>
                  <KebabMenu
                    canUpdate={true}
                    canDelete={true}
                    onUpdateClick={() => onUpdateAgent(agent)}
                    onDeleteClick={() => onDeleteAgent(agent)}
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
