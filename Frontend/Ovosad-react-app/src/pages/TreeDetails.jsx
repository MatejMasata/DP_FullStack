import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useKeycloak } from "../auth/KeycloakProvider";
import toast from "react-hot-toast";
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

// SERVICES
import { useAuthenticatedImageUrls } from "../hooks/useAuthenticatedImageUrls";
import { fetchTreeById, updateTree, deleteTree } from "../services/treeService";
import {
  fetchHarvestsByIds,
  createHarvest,
  updateHarvest,
  deleteHarvest,
} from "../services/harvestService";
import {
  fetchTreeDataEntriesByIds,
  createTreeDataEntry,
  updateTreeDataEntry,
  deleteTreeDataEntry,
} from "../services/treeDataService";
import {
  fetchSprayingsByIds,
  createSpraying,
  updateSpraying,
  deleteSpraying,
} from "../services/sprayingService";
import {
  fetchFruitThinningsByIds,
  createFruitThinning,
  updateFruitThinning,
  deleteFruitThinning,
} from "../services/fruitThinningService";
import {
  fetchFlowerThinningsByIds,
  createFlowerThinning,
  updateFlowerThinning,
  deleteFlowerThinning,
} from "../services/flowerThinningService";
import { fetchAllAgents } from "../services/agentService";
import {
  fetchTreeImagesByIds,
  deleteTreeImage,
} from "../services/treeImageService";
import { fetchFilesByIds } from "../services/fileService";

// COMPONENTS
import { UpdateFormModal } from "../components/modals/UpdateFormModal";
import { AddFormModal } from "../components/modals/AddFormModal";
import { KebabMenu } from "../components/KebabMenu";
import { HarvestTable } from "../components/tables/HarvestTable";
import { TreeDataTable } from "../components/tables/TreeDataTable";
import { SprayingTable } from "../components/tables/SprayingTable";
import { FruitThinningTable } from "../components/tables/FruitThinningTable";
import { FlowerThinningTable } from "../components/tables/FlowerThinningTable";
import { TreeImageGallery } from "../components/TreeImageGallery";
import { UploadTreeImageModal } from "../components/modals/UploadTreeImageModal";
import { LinkExistingImageModal } from "../components/modals/LinkExistingImageModal";

// CONFIGS
import {
  TreeFormConfig,
  harvestFormConfig,
  treeDataFormConfig,
  sprayingFormConfig,
  fruitThinningFormConfig,
  flowerThinningFormConfig,
  initialHarvestData,
  initialTreeData,
  initialSprayingData,
  initialFruitThinningData,
  initialFlowerThinningData,
} from "../config/TablesConfig";

import styles from "./TreeDetails.module.css";
import kebabMenuStyles from "../components/KebabMenu.module.css";
import buttonStyles from "../components/modals/AddFormModal.module.css";

export function TreeDetails() {
  const { treeId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { authenticated, getToken, isGlobalAdmin, isOrchardAdmin } =
    useKeycloak();

  const parsedTreeId = parseInt(treeId, 10);

  const [selectedDataType, setSelectedDataType] = useState("harvests");

  const [activeModal, setActiveModal] = useState({ type: null, data: null });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  // FETCHING TREE AND AUTHORIZING USER
  const {
    data: treeDetails,
    isLoading: isLoadingTreeDetails,
    error: treeDetailsError,
  } = useQuery({
    queryKey: ["tree", String(parsedTreeId)],
    queryFn: () => fetchTreeById(getToken, parsedTreeId),
    enabled: authenticated && !isNaN(parsedTreeId),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const canManageTree =
    isGlobalAdmin ||
    (treeDetails?.orchard_id && isOrchardAdmin(treeDetails.orchard_id));
  const canManageHarvests = canManageTree;
  const canManageTreeData = canManageTree;
  const canManageSprayings = canManageTree;
  const canManageFruitThinnings = canManageTree;
  const canManageFlowerThinnings = canManageTree;

  // FETCHING ALL THE RELATED DATA
  const {
    data: harvests,
    isLoading: isLoadingHarvests,
    error: harvestsError,
  } = useQuery({
    queryKey: ["treeHarvests", String(parsedTreeId)],
    queryFn: () => fetchHarvestsByIds(getToken, treeDetails?.harvests || []),
    enabled: authenticated && !!treeDetails && !isNaN(parsedTreeId),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // FETCHING TREE IMAGES
  const {
    data: treeImageLinks,
    isLoading: isLoadingTreeImageLinks,
    error: treeImageLinksError,
  } = useQuery({
    queryKey: ["treeImageLinks", String(parsedTreeId)],
    queryFn: () =>
      fetchTreeImagesByIds(getToken, treeDetails?.tree_images || []),
    enabled:
      authenticated &&
      !!treeDetails?.tree_images &&
      treeDetails.tree_images.length > 0,
  });

  const imageFileIds = useMemo(() => {
    return treeImageLinks ? treeImageLinks.map((link) => link.file_id) : [];
  }, [treeImageLinks]);

  const { data: imageFiles, isLoading: isLoadingImageFiles } = useQuery({
    queryKey: ["treeImageFiles", imageFileIds],
    queryFn: () => fetchFilesByIds(getToken, imageFileIds),
    enabled: imageFileIds.length > 0,
  });

  const { imageSources, isLoading: isLoadingImageSources } =
    useAuthenticatedImageUrls(imageFileIds);

  const {
    data: treeDataEntries,
    isLoading: isLoadingTreeDataEntries,
    error: treeDataEntriesError,
  } = useQuery({
    queryKey: ["treeDataEntries", String(parsedTreeId)],
    queryFn: () =>
      fetchTreeDataEntriesByIds(getToken, treeDetails?.tree_data || []),
    enabled: authenticated && !!treeDetails && !isNaN(parsedTreeId),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const {
    data: sprayings,
    isLoading: isLoadingSprayings,
    error: sprayingsError,
  } = useQuery({
    queryKey: ["treeSprayings", String(parsedTreeId)],
    queryFn: async () => {
      const fetchedSprayings = await fetchSprayingsByIds(
        getToken,
        treeDetails?.sprayings || []
      );
      if (fetchedSprayings && agents) {
        return fetchedSprayings.map((spraying) => ({
          ...spraying,
          agent_name:
            agents.find((agent) => agent.id === spraying.agent_id)?.name ||
            "Unknown Agent",
        }));
      }
      return fetchedSprayings;
    },
    enabled: authenticated && !!treeDetails && !isNaN(parsedTreeId),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const {
    data: fruitThinnings,
    isLoading: isLoadingFruitThinnings,
    error: fruitThinningsError,
  } = useQuery({
    queryKey: ["treeFruitThinnings", String(parsedTreeId)],
    queryFn: async () => {
      const fetchedFruitThinnings = await fetchFruitThinningsByIds(
        getToken,
        treeDetails?.fruit_thinnings || []
      );
      return fetchedFruitThinnings;
    },
    enabled: authenticated && !!treeDetails && !isNaN(parsedTreeId),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const {
    data: flowerThinnings,
    isLoading: isLoadingFlowerThinnings,
    error: flowerThinningsError,
  } = useQuery({
    queryKey: ["treeFlowerThinnings", String(parsedTreeId)],
    queryFn: async () => {
      const fetchedFlowerThinnings = await fetchFlowerThinningsByIds(
        getToken,
        treeDetails?.flower_thinnings || []
      );
      return fetchedFlowerThinnings;
    },
    enabled: authenticated && !!treeDetails && !isNaN(parsedTreeId),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const {
    data: agents,
    isLoading: isLoadingAgents,
    error: agentsError,
  } = useQuery({
    queryKey: ["agents"],
    queryFn: () => fetchAllAgents(getToken),
    enabled: authenticated,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const {
    data: treeSprayingsForFruitThinningDropdown,
    isLoading: isLoadingTreeSprayingsForFruitThinningDropdown,
    error: treeSprayingsForFruitThinningDropdownError,
  } = useQuery({
    queryKey: ["treeSprayingsForThinningDropdown", String(parsedTreeId)],
    queryFn: () => fetchSprayingsByIds(getToken, treeDetails?.sprayings || []),
    enabled: authenticated && !!treeDetails && !isNaN(parsedTreeId),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const sprayingFormConfigWithAgents = useMemo(() => {
    const config = JSON.parse(JSON.stringify(sprayingFormConfig));
    const agentField = config.find((field) => field.name === "agent_id");
    if (agentField && agents) {
      agentField.options = agents.map((agent) => ({
        value: agent.id,
        label: agent.name,
      }));
    }
    return config;
  }, [agents, sprayingFormConfig]);

  const fruitThinningFormConfigWithSprayingOptions = useMemo(() => {
    const config = JSON.parse(JSON.stringify(fruitThinningFormConfig));
    const sprayingField = config.find((field) => field.name === "spraying_id");
    if (sprayingField && treeSprayingsForFruitThinningDropdown) {
      sprayingField.options = treeSprayingsForFruitThinningDropdown.map(
        (spraying) => ({
          value: spraying.id,
          label: `Spraying ID: ${spraying.id} on ${new Date(
            spraying.datetime
          ).toLocaleDateString()}`,
        })
      );
    }
    return config;
  }, [treeSprayingsForFruitThinningDropdown, fruitThinningFormConfig]);

  const flowerThinningFormConfigWithSprayingOptions = useMemo(() => {
    const config = JSON.parse(JSON.stringify(flowerThinningFormConfig));
    const sprayingField = config.find((field) => field.name === "spraying_id");
    if (sprayingField && treeSprayingsForFruitThinningDropdown) {
      sprayingField.options = treeSprayingsForFruitThinningDropdown.map(
        (spraying) => ({
          value: spraying.id,
          label: `Spraying ID: ${spraying.id} on ${new Date(
            spraying.datetime
          ).toLocaleDateString()}`,
        })
      );
    }
    return config;
  }, [treeSprayingsForFruitThinningDropdown, flowerThinningFormConfig]);

  // MUTATIONS FOR UPDATING AND DELETING
  const updateTreeMutation = useMutation({
    mutationFn: (payload) => updateTree(getToken, payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tree", String(parsedTreeId)],
      });
      setActiveModal({ type: null, data: null });
      toast.success("Tree updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update tree.");
    },
  });

  const deleteTreeMutation = useMutation({
    mutationFn: (id) => deleteTree(getToken, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trees"] });
      toast.success("Tree deleted successfully!");
      navigate(`/orchard/${treeDetails?.orchard_id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete tree.");
    },
  });

  const updateHarvestMutation = useMutation({
    mutationFn: (payload) => updateHarvest(getToken, payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["treeHarvests", String(parsedTreeId)],
      });
      setActiveModal({ type: null, data: null });
      toast.success("Harvest updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update harvest.");
    },
  });

  const deleteHarvestMutation = useMutation({
    mutationFn: (id) => deleteHarvest(getToken, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["treeHarvests", String(parsedTreeId)],
      });
      queryClient.invalidateQueries({
        queryKey: ["tree", String(parsedTreeId)],
      });
      toast.success("Harvest deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete harvest.");
    },
  });

  const updateTreeDataMutation = useMutation({
    mutationFn: (payload) =>
      updateTreeDataEntry(getToken, payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["treeDataEntries", String(parsedTreeId)],
      });
      setActiveModal({ type: null, data: null });
      toast.success("Tree data entry updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update tree data entry.");
    },
  });

  const deleteTreeDataMutation = useMutation({
    mutationFn: (id) => deleteTreeDataEntry(getToken, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["treeDataEntries", String(parsedTreeId)],
      });
      queryClient.invalidateQueries({
        queryKey: ["tree", String(parsedTreeId)],
      });
      toast.success("Tree data entry deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete tree data entry.");
    },
  });

  const updateSprayingMutation = useMutation({
    mutationFn: (payload) => updateSpraying(getToken, payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["treeSprayings", String(parsedTreeId)],
      });
      setActiveModal({ type: null, data: null });
      queryClient.invalidateQueries({
        queryKey: ["treeSprayingsForThinningDropdown", String(parsedTreeId)],
      });
      toast.success("Spraying updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update spraying.");
    },
  });

  const deleteSprayingMutation = useMutation({
    mutationFn: (id) => deleteSpraying(getToken, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["treeSprayings", String(parsedTreeId)],
      });
      queryClient.invalidateQueries({
        queryKey: ["tree", String(parsedTreeId)],
      });
      queryClient.invalidateQueries({
        queryKey: ["treeSprayingsForThinningDropdown", String(parsedTreeId)],
      });
      toast.success("Spraying deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete spraying.");
    },
  });

  const updateFruitThinningMutation = useMutation({
    mutationFn: (payload) =>
      updateFruitThinning(getToken, payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["treeFruitThinnings", String(parsedTreeId)],
      });
      setActiveModal({ type: null, data: null });
      toast.success("Fruit thinning entry updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update fruit thinning entry.");
    },
  });

  const deleteFruitThinningMutation = useMutation({
    mutationFn: (id) => deleteFruitThinning(getToken, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["treeFruitThinnings", String(parsedTreeId)],
      });
      queryClient.invalidateQueries({
        queryKey: ["tree", String(parsedTreeId)],
      });
      toast.success("Fruit thinning entry deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete fruit thinning entry.");
    },
  });

  const updateFlowerThinningMutation = useMutation({
    mutationFn: (payload) =>
      updateFlowerThinning(getToken, payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["treeFlowerThinnings", String(parsedTreeId)],
      });
      setActiveModal({ type: null, data: null });
      toast.success("Flower thinning entry updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update flower thinning entry.");
    },
  });

  const deleteFlowerThinningMutation = useMutation({
    mutationFn: (id) => deleteFlowerThinning(getToken, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["treeFlowerThinnings", String(parsedTreeId)],
      });
      queryClient.invalidateQueries({
        queryKey: ["tree", String(parsedTreeId)],
      });
      toast.success("Flower thinning entry deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete flower thinning entry.");
    },
  });

  const deleteTreeImageMutation = useMutation({
    mutationFn: (id) => deleteTreeImage(getToken, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tree", String(parsedTreeId)],
      });
      queryClient.invalidateQueries({
        queryKey: ["treeImageLinks", String(parsedTreeId)],
      });
      toast.success("Image unlinked successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to unlink image.");
    },
  });

  // HANDLE UPDATE AND DELETE CLICKS
  const handleUpdateTreeClick = () => {
    setActiveModal({ type: "updateTree", data: treeDetails });
  };

  const handleDeleteTreeClick = () => {
    toast.custom(
      (t) => (
        <div
          className={`${kebabMenuStyles.toastContainer} ${
            t.visible ? kebabMenuStyles.toastEnter : kebabMenuStyles.toastExit
          }`}
        >
          <p className={kebabMenuStyles.toastMessage}>
            Are you sure you want to delete tree "{treeDetails.id}" (Row:{" "}
            {treeDetails.row}, Field: {treeDetails.field}, Number:{" "}
            {treeDetails.number})? This action cannot be undone.
          </p>
          <div className={kebabMenuStyles.toastButtons}>
            <button
              onClick={() => {
                deleteTreeMutation.mutate(parsedTreeId);
                toast.dismiss(t.id);
              }}
              className={kebabMenuStyles.toastConfirmButton}
            >
              Confirm Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className={kebabMenuStyles.toastCancelButton}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const handleUpdateHarvestClick = (harvest) => {
    setActiveModal({ type: "updateHarvest", data: harvest });
  };

  const handleDeleteHarvestClick = (harvest) => {
    toast.custom(
      (t) => (
        <div
          className={`${kebabMenuStyles.toastContainer} ${
            t.visible ? kebabMenuStyles.toastEnter : kebabMenuStyles.toastExit
          }`}
        >
          <p className={kebabMenuStyles.toastMessage}>
            Are you sure you want to delete Harvest ID "{harvest.id}"?
          </p>
          <div className={kebabMenuStyles.toastButtons}>
            <button
              onClick={() => {
                deleteHarvestMutation.mutate(harvest.id);
                toast.dismiss(t.id);
              }}
              className={kebabMenuStyles.toastConfirmButton}
            >
              Confirm
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className={kebabMenuStyles.toastCancelButton}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const handleUpdateTreeDataClick = (treeDataEntry) => {
    setActiveModal({ type: "updateTreeData", data: treeDataEntry });
  };

  const handleDeleteTreeDataClick = (treeDataEntry) => {
    toast.custom(
      (t) => (
        <div
          className={`${kebabMenuStyles.toastContainer} ${
            t.visible ? kebabMenuStyles.toastEnter : kebabMenuStyles.toastExit
          }`}
        >
          <p className={kebabMenuStyles.toastMessage}>
            Are you sure you want to delete Tree Data Entry ID "
            {treeDataEntry.id}"?
          </p>
          <div className={kebabMenuStyles.toastButtons}>
            <button
              onClick={() => {
                deleteTreeDataMutation.mutate(treeDataEntry.id);
                toast.dismiss(t.id);
              }}
              className={kebabMenuStyles.toastConfirmButton}
            >
              Confirm
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className={kebabMenuStyles.toastCancelButton}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const handleUpdateSprayingClick = (spraying) => {
    setActiveModal({ type: "updateSpraying", data: spraying });
  };

  const handleDeleteSprayingClick = (spraying) => {
    toast.custom(
      (t) => (
        <div
          className={`${kebabMenuStyles.toastContainer} ${
            t.visible ? kebabMenuStyles.toastEnter : kebabMenuStyles.toastExit
          }`}
        >
          <p className={kebabMenuStyles.toastMessage}>
            Are you sure you want to delete Spraying ID "{spraying.id}"?
          </p>
          <div className={kebabMenuStyles.toastButtons}>
            <button
              onClick={() => {
                deleteSprayingMutation.mutate(spraying.id);
                toast.dismiss(t.id);
              }}
              className={kebabMenuStyles.toastConfirmButton}
            >
              Confirm
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className={kebabMenuStyles.toastCancelButton}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const handleUpdateFruitThinningClick = (fruitThinning) => {
    setActiveModal({ type: "updateFruitThinning", data: fruitThinning });
  };

  const handleDeleteFruitThinningClick = (fruitThinning) => {
    toast.custom(
      (t) => (
        <div
          className={`${kebabMenuStyles.toastContainer} ${
            t.visible ? kebabMenuStyles.toastEnter : kebabMenuStyles.toastExit
          }`}
        >
          <p className={kebabMenuStyles.toastMessage}>
            Are you sure you want to delete Fruit Thinning ID "
            {fruitThinning.id}"?
          </p>
          <div className={kebabMenuStyles.toastButtons}>
            <button
              onClick={() => {
                deleteFruitThinningMutation.mutate(fruitThinning.id);
                toast.dismiss(t.id);
              }}
              className={kebabMenuStyles.toastConfirmButton}
            >
              Confirm
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className={kebabMenuStyles.toastCancelButton}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const handleUpdateFlowerThinningClick = (flowerThinning) => {
    setActiveModal({ type: "updateFlowerThinning", data: flowerThinning });
  };

  const handleDeleteFlowerThinningClick = (flowerThinning) => {
    toast.custom(
      (t) => (
        <div
          className={`${kebabMenuStyles.toastContainer} ${
            t.visible ? kebabMenuStyles.toastEnter : kebabMenuStyles.toastExit
          }`}
        >
          <p className={kebabMenuStyles.toastMessage}>
            Are you sure you want to delete Flower Thinning ID "
            {flowerThinning.id}"?
          </p>
          <div className={kebabMenuStyles.toastButtons}>
            <button
              onClick={() => {
                deleteFlowerThinningMutation.mutate(flowerThinning.id);
                toast.dismiss(t.id);
              }}
              className={kebabMenuStyles.toastConfirmButton}
            >
              Confirm
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className={kebabMenuStyles.toastCancelButton}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const handleImageClick = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const lightboxSlides = useMemo(
    () =>
      imageSources
        .map((img) => ({ src: img.src }))
        .filter((slide) => slide.src),
    [imageSources]
  );

  const handleUnlinkImageClick = (treeImageLink) => {
    toast.custom(
      (t) => (
        <div
          className={`${kebabMenuStyles.toastContainer} ${
            t.visible ? kebabMenuStyles.toastEnter : kebabMenuStyles.toastExit
          }`}
        >
          <p className={kebabMenuStyles.toastMessage}>
            Are you sure you want to unlink this image from this tree? This will
            not delete the original file from the file batch.
          </p>
          <div className={kebabMenuStyles.toastButtons}>
            <button
              onClick={() => {
                deleteTreeImageMutation.mutate(treeImageLink.id);
                toast.dismiss(t.id);
              }}
              className={kebabMenuStyles.toastConfirmButton}
            >
              Confirm
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className={kebabMenuStyles.toastCancelButton}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const handleUploadComplete = () => {
    queryClient.invalidateQueries({
      queryKey: ["tree", String(parsedTreeId)],
    });
    queryClient.invalidateQueries({
      queryKey: ["treeImageLinks", String(parsedTreeId)],
    });
    queryClient.invalidateQueries({ queryKey: ["treeImageFiles"] });
  };

  // INITIAL FORM DATA
  const initialHarvestFormData = useMemo(
    () => initialHarvestData(parsedTreeId),
    [parsedTreeId]
  );

  const initialTreeDataFormData = useMemo(
    () => initialTreeData(parsedTreeId),
    [parsedTreeId]
  );

  const initialSprayingFormData = useMemo(
    () => initialSprayingData(parsedTreeId, agents),
    [parsedTreeId, agents]
  );

  const initialFruitThinningFormData = useMemo(
    () =>
      initialFruitThinningData(
        parsedTreeId,
        treeSprayingsForFruitThinningDropdown
      ),
    [parsedTreeId, treeSprayingsForFruitThinningDropdown]
  );

  const initialFlowerThinningFormData = useMemo(
    () =>
      initialFlowerThinningData(
        parsedTreeId,
        treeSprayingsForFruitThinningDropdown
      ),
    [parsedTreeId, treeSprayingsForFruitThinningDropdown]
  );

  const handleLinkComplete = () => {
    queryClient.invalidateQueries({
      queryKey: ["tree", String(parsedTreeId)],
    });
    queryClient.invalidateQueries({
      queryKey: ["treeImageLinks", String(parsedTreeId)],
    });
    queryClient.invalidateQueries({ queryKey: ["treeImageFiles"] });
  };

  // IS AUTHENTICATED?
  if (!authenticated) {
    return (
      <div className={styles.container}>
        <h1>Access Denied</h1>
        <p>Please log in to view tree details.</p>
      </div>
    );
  }

  // LOADING
  if (
    isLoadingTreeDetails ||
    isLoadingAgents ||
    isLoadingFruitThinnings ||
    isLoadingFlowerThinnings ||
    isLoadingTreeSprayingsForFruitThinningDropdown ||
    isLoadingTreeImageLinks ||
    isLoadingImageFiles
  ) {
    return (
      <div className={styles.container}>
        <h1>Loading Tree Details...</h1>
      </div>
    );
  }

  // ERROR
  if (
    treeDetailsError ||
    agentsError ||
    fruitThinningsError ||
    flowerThinningsError ||
    treeSprayingsForFruitThinningDropdownError
  ) {
    return (
      <div className={styles.container}>
        <h1>Error</h1>
        <p>
          Error fetching data:{" "}
          {(
            treeDetailsError ||
            agentsError ||
            fruitThinningsError ||
            flowerThinningsError ||
            treeSprayingsForFruitThinningDropdownError
          )?.message || "Unknown error"}
        </p>
      </div>
    );
  }

  // NOT FOUND
  if (!treeDetails) {
    return (
      <div className={styles.container}>
        <h1>Tree Not Found</h1>
        <p>
          The tree with ID "{treeId}" could not be found or you do not have
          access.
        </p>
      </div>
    );
  }

  // TREE INFO BLOCK (api/tree{id})
  const renderTreeInfo = () => (
    <div className={styles.treeInfoColumn}>
      <h2>Tree Details</h2>
      <div className={styles.treeKebabMenuWrapper}>
        <KebabMenu
          canUpdate={canManageTree}
          canDelete={canManageTree}
          onUpdateClick={handleUpdateTreeClick}
          onDeleteClick={handleDeleteTreeClick}
          mutationIsPending={
            updateTreeMutation.isPending || deleteTreeMutation.isPending
          }
        />
      </div>
      {TreeFormConfig.map((field) => (
        <div key={field.name} className={styles.detailItem}>
          <strong>{field.label}:</strong>{" "}
          {treeDetails[field.name] !== undefined &&
          treeDetails[field.name] !== null
            ? field.type === "date" || field.type === "datetime-local"
              ? new Date(treeDetails[field.name]).toLocaleString()
              : String(treeDetails[field.name])
            : "N/A"}
        </div>
      ))}
    </div>
  );

  // FINAL RETURN
  return (
    <div className={styles.container}>
      <h1>Tree ID: {treeDetails.id}</h1>
      <div className={styles.treeDetailsLayout}>
        {renderTreeInfo()}

        <div className={styles.dynamicDataColumn}>
          <div className={styles.displayOptions}>
            {/* SELECT BUTTONS*/}
            <button
              onClick={() => setSelectedDataType("harvests")}
              className={
                selectedDataType === "harvests" ? styles.activeButton : ""
              }
              disabled={isLoadingHarvests}
            >
              Harvests
            </button>
            <button
              onClick={() => setSelectedDataType("treeData")}
              className={
                selectedDataType === "treeData" ? styles.activeButton : ""
              }
              disabled={isLoadingTreeDataEntries}
            >
              Tree Data
            </button>

            <button
              onClick={() => setSelectedDataType("sprayings")}
              className={
                selectedDataType === "sprayings" ? styles.activeButton : ""
              }
              disabled={isLoadingSprayings}
            >
              Sprayings
            </button>
            <button
              onClick={() => setSelectedDataType("fruitThinnings")}
              className={
                selectedDataType === "fruitThinnings" ? styles.activeButton : ""
              }
              disabled={isLoadingFruitThinnings}
            >
              Fruit thinnings
            </button>
            <button
              onClick={() => setSelectedDataType("flowerThinnings")}
              className={
                selectedDataType === "flowerThinnings"
                  ? styles.activeButton
                  : ""
              }
              disabled={isLoadingFlowerThinnings}
            >
              Flower thinnings
            </button>
            <button
              onClick={() => setSelectedDataType("treeImages")}
              className={
                selectedDataType === "treeImages" ? styles.activeButton : ""
              }
            >
              Tree Images
            </button>
          </div>

          {/* TABLES AND MODALS*/}
          <div className={styles.contentArea}>
            {selectedDataType === "harvests" && (
              <>
                <div className={styles.createButtonRow}>
                  {canManageHarvests && (
                    <AddFormModal
                      buttonText="+ Add New Harvest"
                      modalTitle="Add New Harvest"
                      mutationFn={createHarvest}
                      initialFormData={initialHarvestFormData}
                      formFieldsConfig={harvestFormConfig}
                      onSuccessMessage="Harvest added successfully!"
                      canOpenModal={canManageHarvests}
                      additionalMutationParams={{
                        getToken: getToken,
                        body: { tree_id: parsedTreeId },
                      }}
                      queryKeysToInvalidate={[
                        ["tree", String(parsedTreeId)],
                        ["treeHarvests", String(parsedTreeId)],
                      ]}
                    />
                  )}
                </div>
                {isLoadingHarvests ? (
                  <p className={styles.noDataMessage}>Loading Harvests...</p>
                ) : harvestsError ? (
                  <p className={styles.noDataMessage}>
                    Error loading harvests: {harvestsError.message}
                  </p>
                ) : (
                  <HarvestTable
                    harvests={harvests}
                    canManageHarvests={canManageHarvests}
                    onUpdateHarvest={handleUpdateHarvestClick}
                    onDeleteHarvest={handleDeleteHarvestClick}
                    mutationIsPending={
                      updateHarvestMutation.isPending ||
                      deleteHarvestMutation.isPending
                    }
                  />
                )}
              </>
            )}

            {selectedDataType === "treeData" && (
              <>
                <div className={styles.createButtonRow}>
                  {canManageTreeData && (
                    <AddFormModal
                      buttonText="+ Add New Tree Data"
                      modalTitle="Add New Tree Data Entry"
                      mutationFn={createTreeDataEntry}
                      initialFormData={initialTreeDataFormData}
                      formFieldsConfig={treeDataFormConfig}
                      onSuccessMessage="Tree data entry added successfully!"
                      canOpenModal={canManageTreeData}
                      additionalMutationParams={{
                        getToken: getToken,
                        body: { tree_id: parsedTreeId },
                      }}
                      queryKeysToInvalidate={[
                        ["tree", String(parsedTreeId)],
                        ["treeDataEntries", String(parsedTreeId)],
                      ]}
                    />
                  )}
                </div>
                {isLoadingTreeDataEntries ? (
                  <p className={styles.noDataMessage}>Loading Tree Data...</p>
                ) : treeDataEntriesError ? (
                  <p className={styles.noDataMessage}>
                    Error loading tree data: {treeDataEntriesError.message}
                  </p>
                ) : (
                  <TreeDataTable
                    treeDataEntries={treeDataEntries}
                    canManageTreeData={canManageTreeData}
                    onUpdateTreeData={handleUpdateTreeDataClick}
                    onDeleteTreeData={handleDeleteTreeDataClick}
                    mutationIsPending={
                      updateTreeDataMutation.isPending ||
                      deleteTreeDataMutation.isPending
                    }
                  />
                )}
              </>
            )}

            {selectedDataType === "sprayings" && (
              <>
                <div className={styles.createButtonRow}>
                  {canManageSprayings && (
                    <AddFormModal
                      buttonText="+ Add New Spraying"
                      modalTitle="Add New Spraying"
                      mutationFn={createSpraying}
                      initialFormData={initialSprayingFormData}
                      formFieldsConfig={sprayingFormConfigWithAgents}
                      onSuccessMessage="Spraying added successfully!"
                      canOpenModal={canManageSprayings}
                      additionalMutationParams={{
                        getToken: getToken,
                        body: { tree_id: parsedTreeId },
                      }}
                      queryKeysToInvalidate={[
                        ["tree", String(parsedTreeId)],
                        ["treeSprayings", String(parsedTreeId)],
                      ]}
                    />
                  )}
                </div>
                {isLoadingSprayings ? (
                  <p className={styles.noDataMessage}>Loading Sprayings...</p>
                ) : sprayingsError ? (
                  <p className={styles.noDataMessage}>
                    Error loading sprayings: {sprayingsError.message}
                  </p>
                ) : (
                  <SprayingTable
                    sprayings={sprayings}
                    canManageSprayings={canManageSprayings}
                    onUpdateSpraying={handleUpdateSprayingClick}
                    onDeleteSpraying={handleDeleteSprayingClick}
                    mutationIsPending={
                      updateSprayingMutation.isPending ||
                      deleteSprayingMutation.isPending
                    }
                  />
                )}
              </>
            )}

            {selectedDataType === "fruitThinnings" && (
              <>
                <div className={styles.createButtonRow}>
                  {canManageFruitThinnings && (
                    <AddFormModal
                      buttonText="+ Add New Fruit Thinning"
                      modalTitle="Add New Fruit Thinning Entry"
                      mutationFn={createFruitThinning}
                      initialFormData={initialFruitThinningFormData}
                      formFieldsConfig={
                        fruitThinningFormConfigWithSprayingOptions
                      }
                      onSuccessMessage="Fruit thinning entry added successfully!"
                      canOpenModal={canManageFruitThinnings}
                      additionalMutationParams={{
                        getToken: getToken,
                        body: { tree_id: parsedTreeId },
                      }}
                      queryKeysToInvalidate={[
                        ["tree", String(parsedTreeId)],
                        ["treeFruitThinnings", String(parsedTreeId)],
                      ]}
                    />
                  )}
                </div>
                {isLoadingFruitThinnings ? (
                  <p className={styles.noDataMessage}>
                    Loading Fruit Thinnings...
                  </p>
                ) : fruitThinningsError ? (
                  <p className={styles.noDataMessage}>
                    Error loading fruit thinnings: {fruitThinningsError.message}
                  </p>
                ) : (
                  <FruitThinningTable
                    fruitThinnings={fruitThinnings}
                    canManageFruitThinnings={canManageFruitThinnings}
                    onUpdateFruitThinning={handleUpdateFruitThinningClick}
                    onDeleteFruitThinning={handleDeleteFruitThinningClick}
                    mutationIsPending={
                      updateFruitThinningMutation.isPending ||
                      deleteFruitThinningMutation.isPending
                    }
                  />
                )}
              </>
            )}

            {selectedDataType === "flowerThinnings" && (
              <>
                <div className={styles.createButtonRow}>
                  {canManageFlowerThinnings && (
                    <AddFormModal
                      buttonText="+ Add New Flower Thinning"
                      modalTitle="Add New Flower Thinning Entry"
                      mutationFn={createFlowerThinning}
                      initialFormData={initialFlowerThinningFormData}
                      formFieldsConfig={
                        flowerThinningFormConfigWithSprayingOptions
                      }
                      onSuccessMessage="Flower thinning entry added successfully!"
                      canOpenModal={canManageFlowerThinnings}
                      additionalMutationParams={{
                        getToken: getToken,
                        body: { tree_id: parsedTreeId },
                      }}
                      queryKeysToInvalidate={[
                        ["tree", String(parsedTreeId)],
                        ["treeFlowerThinnings", String(parsedTreeId)],
                      ]}
                    />
                  )}
                </div>
                {isLoadingFlowerThinnings ? (
                  <p className={styles.noDataMessage}>
                    Loading Flower Thinnings...
                  </p>
                ) : flowerThinningsError ? (
                  <p className={styles.noDataMessage}>
                    Error loading flower thinnings:{" "}
                    {flowerThinningsError.message}
                  </p>
                ) : (
                  <FlowerThinningTable
                    flowerThinnings={flowerThinnings}
                    canManageFlowerThinnings={canManageFlowerThinnings}
                    onUpdateFlowerThinning={handleUpdateFlowerThinningClick}
                    onDeleteFlowerThinning={handleDeleteFlowerThinningClick}
                    mutationIsPending={
                      updateFlowerThinningMutation.isPending ||
                      deleteFlowerThinningMutation.isPending
                    }
                  />
                )}
              </>
            )}

            {selectedDataType === "treeImages" && (
              <>
                <div
                  className={`${styles.createButtonRow} ${styles.galleryControls}`}
                >
                  {canManageTree && (
                    <>
                      <button
                        onClick={() => setIsLinkModalOpen(true)}
                        className={buttonStyles.addEntityButton}
                      >
                        + Link Existing Image
                      </button>
                      <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className={buttonStyles.addEntityButton}
                      >
                        + Upload New Image
                      </button>
                    </>
                  )}
                </div>
                {isLoadingImageSources || isLoadingImageFiles ? (
                  <p className={styles.noDataMessage}>Loading images...</p>
                ) : treeImageLinksError ? (
                  <p className={styles.noDataMessage}>
                    Error loading images: {treeImageLinksError.message}
                  </p>
                ) : (
                  <TreeImageGallery
                    treeImageLinks={treeImageLinks}
                    files={imageFiles}
                    imageSources={imageSources}
                    onImageClick={handleImageClick}
                    onUnlinkClick={handleUnlinkImageClick}
                    canManage={canManageTree}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
        index={lightboxIndex}
        controller={{ closeOnBackdropClick: true }}
        plugins={[Thumbnails]}
      />

      {activeModal.type === "updateTree" && treeDetails && (
        <UpdateFormModal
          modalTitle="Update Tree"
          mutationFn={updateTree}
          itemData={activeModal.data}
          formFieldsConfig={TreeFormConfig}
          onSuccessMessage="Tree updated successfully!"
          isOpen={activeModal.type === "updateTree"}
          onClose={() => setActiveModal({ type: null, data: null })}
          additionalMutationParams={{
            getToken: getToken,
            id: parsedTreeId,
          }}
        />
      )}

      {activeModal.type === "updateHarvest" && activeModal.data && (
        <UpdateFormModal
          modalTitle="Update Harvest"
          mutationFn={updateHarvest}
          itemData={activeModal.data}
          formFieldsConfig={harvestFormConfig}
          onSuccessMessage="Harvest updated successfully!"
          isOpen={activeModal.type === "updateHarvest"}
          onClose={() => setActiveModal({ type: null, data: null })}
          additionalMutationParams={{ getToken: getToken }}
        />
      )}

      {activeModal.type === "updateTreeData" && activeModal.data && (
        <UpdateFormModal
          modalTitle="Update Tree Data Entry"
          mutationFn={updateTreeDataEntry}
          itemData={activeModal.data}
          formFieldsConfig={treeDataFormConfig}
          onSuccessMessage="Tree data entry updated successfully!"
          isOpen={activeModal.type === "updateTreeData"}
          onClose={() => setActiveModal({ type: null, data: null })}
          additionalMutationParams={{ getToken: getToken }}
        />
      )}

      {activeModal.type === "updateSpraying" && activeModal.data && (
        <UpdateFormModal
          modalTitle="Update Spraying"
          mutationFn={updateSpraying}
          itemData={activeModal.data}
          formFieldsConfig={sprayingFormConfigWithAgents}
          onSuccessMessage="Spraying updated successfully!"
          isOpen={activeModal.type === "updateSpraying"}
          onClose={() => setActiveModal({ type: null, data: null })}
          additionalMutationParams={{ getToken: getToken }}
        />
      )}

      {activeModal.type === "updateFruitThinning" && activeModal.data && (
        <UpdateFormModal
          modalTitle="Update Fruit Thinning Entry"
          mutationFn={updateFruitThinning}
          itemData={activeModal.data}
          formFieldsConfig={fruitThinningFormConfigWithSprayingOptions}
          onSuccessMessage="Fruit thinning entry updated successfully!"
          isOpen={activeModal.type === "updateFruitThinning"}
          onClose={() => setActiveModal({ type: null, data: null })}
          additionalMutationParams={{ getToken: getToken }}
        />
      )}

      {activeModal.type === "updateFlowerThinning" && activeModal.data && (
        <UpdateFormModal
          modalTitle="Update Flower Thinning Entry"
          mutationFn={updateFlowerThinning}
          itemData={activeModal.data}
          formFieldsConfig={flowerThinningFormConfigWithSprayingOptions}
          onSuccessMessage="Flower thinning entry updated successfully!"
          isOpen={activeModal.type === "updateFlowerThinning"}
          onClose={() => setActiveModal({ type: null, data: null })}
          additionalMutationParams={{ getToken: getToken }}
        />
      )}

      <LinkExistingImageModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        treeId={parsedTreeId}
        existingFileIds={imageFileIds}
        onLinkComplete={handleLinkComplete}
      />

      <UploadTreeImageModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        treeId={parsedTreeId}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}
