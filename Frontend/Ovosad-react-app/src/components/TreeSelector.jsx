import React from "react";
import Select from "react-select";
import { useQuery } from "@tanstack/react-query";
import { useKeycloak } from "../auth/KeycloakProvider";
import { fetchOrchards } from "../services/orchardService";

export function TreeSelector({ value, onChange, isDisabled = false }) {
  const { getToken, authenticated, isGlobalAdmin, adminOrchardIds } =
    useKeycloak();

  const { data: orchards, isLoading } = useQuery({
    queryKey: ["allOrchards"],
    queryFn: () => fetchOrchards(getToken),
    enabled: authenticated,
  });

  const options = React.useMemo(() => {
    if (!orchards) return [];
    const manageableOrchards = isGlobalAdmin
      ? orchards
      : orchards.filter((orchard) => adminOrchardIds.has(orchard.id));
    const allManageableTrees = manageableOrchards.flatMap((orchard) =>
      orchard.trees.map((treeId) => ({
        value: treeId,
        label: `Tree ${treeId} (Orchard: ${orchard.name})`,
      }))
    );
    return allManageableTrees.sort((a, b) => a.value - b.value);
  }, [orchards, isGlobalAdmin, adminOrchardIds]);

  const selectedOptions =
    options.filter((opt) => value?.includes(opt.value)) || [];

  const handleChange = (selected) => {
    const newValues = selected ? selected.map((opt) => opt.value) : [];
    onChange(newValues);
  };

  const portalStyles = {
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  return (
    <Select
      isMulti
      options={options}
      value={selectedOptions}
      onChange={handleChange}
      isLoading={isLoading}
      isDisabled={isDisabled}
      placeholder="Select trees to link..."
      closeMenuOnSelect={false}
      menuPortalTarget={document.body}
      styles={portalStyles}
      menuPosition="fixed"
      menuPlacement="bottom"
    />
  );
}
