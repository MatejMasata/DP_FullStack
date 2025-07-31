import React from "react";
import { useNavigate } from "react-router-dom";
import { KebabMenu } from "../KebabMenu";
import styles from "./TreeTable.module.css";

export function TreeTable({
  trees,
  canManageTrees,
  onUpdateTree,
  onDeleteTree,
  mutationIsPending,
}) {
  const navigate = useNavigate();

  if (!trees || trees.length === 0) {
    return <p className={styles.noTreesMessage}>No trees to display.</p>;
  }

  const handleRowClick = (treeId) => {
    // Only navigate if no mutation is pending
    if (!mutationIsPending) {
      navigate(`/tree/${treeId}`);
    }
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.treeTable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Row</th>
            <th>Field</th>
            <th>Number</th>
            <th>Growth Type</th>
            <th>Training Shape</th>
            <th>Planting Date</th>
            <th>Initial Age</th>
            <th>Nursery Tree Type</th>
            {canManageTrees && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {trees.map((tree) => (
            <tr key={tree.id} onClick={() => handleRowClick(tree.id)}>
              <td>{tree.id}</td>
              <td>{tree.row}</td>
              <td>{tree.field}</td>
              <td>{tree.number}</td>
              <td>{tree.growth_type}</td>
              <td>{tree.training_shape}</td>
              <td>{tree.planting_date}</td>
              <td>{tree.initial_age}</td>
              <td>{tree.nursery_tree_type}</td>
              {canManageTrees && (
                <td>
                  <KebabMenu
                    canUpdate={canManageTrees} // Can update if canManageTrees is true
                    canDelete={canManageTrees} // Can delete if canManageTrees is true
                    onUpdateClick={() => onUpdateTree(tree)}
                    onDeleteClick={() => onDeleteTree(tree)}
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
