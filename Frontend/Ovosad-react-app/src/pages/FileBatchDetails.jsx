import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useKeycloak } from "../auth/KeycloakProvider";
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

// Hooks, Services, and Components
import { useAuthenticatedImageUrls } from "../hooks/useAuthenticatedImageUrls";
import { fetchFileBatchById } from "../services/fileBatchService";
import { fetchAllFiles } from "../services/fileService";
import { fetchAllTreeImages } from "../services/treeImageService";
import { FileUploadModal } from "../components/modals/FileUploadModal";
import { LinkTreesModal } from "../components/modals/LinkTreesModal";
import styles from "./FileBatchDetails.module.css";
import buttonStyles from "../components/modals/AddFormModal.module.css";

export function FileBatchDetails() {
  const { batchId } = useParams();
  const { getToken, authenticated, isGlobalAdmin, isAnyOrchardAdmin } =
    useKeycloak();
  const queryClient = useQueryClient();

  // States for modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [linkingFile, setLinkingFile] = useState(null);

  const canManage = isGlobalAdmin || isAnyOrchardAdmin;

  // DATA FETCHING
  const { data: batchDetails, isLoading: isLoadingBatch } = useQuery({
    queryKey: ["fileBatch", batchId],
    queryFn: () => fetchFileBatchById(getToken, batchId),
    enabled: authenticated && !!batchId,
  });

  const { data: allFiles, isLoading: isLoadingFiles } = useQuery({
    queryKey: ["allFiles"],
    queryFn: () => fetchAllFiles(getToken),
    enabled: authenticated,
  });

  const { data: allTreeImageLinks } = useQuery({
    queryKey: ["allTreeImageLinks"],
    queryFn: () => fetchAllTreeImages(getToken),
    enabled: authenticated && canManage,
  });

  const filesInBatch = useMemo(() => {
    if (!allFiles || !batchDetails) return [];
    const fileIdsInBatch = new Set(batchDetails.files);
    return allFiles.filter((file) => fileIdsInBatch.has(file.id));
  }, [allFiles, batchDetails]);

  const fileIds = useMemo(() => filesInBatch.map((f) => f.id), [filesInBatch]);
  const { imageSources, isLoading: isLoadingImages } =
    useAuthenticatedImageUrls(fileIds);

  // HANDLERS
  const handleUploadComplete = () => {
    queryClient.invalidateQueries({ queryKey: ["allFiles"] });
    queryClient.invalidateQueries({ queryKey: ["fileBatch", batchId] });
  };

  const handleImageClick = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const openLinkerModal = (file) => {
    setLinkingFile(file);
  };

  const lightboxSlides = imageSources
    .map((img) => ({ src: img.src }))
    .filter((slide) => slide.src);

  if (isLoadingBatch || isLoadingFiles) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <>
      <div className={styles.container}>
        <h1>{batchDetails?.label || "File Batch"}</h1>

        <div className={styles.contentArea}>
          {canManage && (
            <div className={styles.controls}>
              <button
                className={buttonStyles.addEntityButton}
                onClick={() => setIsUploadModalOpen(true)}
              >
                + Upload New File
              </button>
            </div>
          )}

          <div className={styles.gallery}>
            {isLoadingImages ? (
              <p>Loading images...</p>
            ) : filesInBatch.length > 0 ? (
              filesInBatch.map((file, index) => {
                const image = imageSources.find(
                  (src) => src.fileId === file.id
                );
                return (
                  <div key={file.id} className={styles.imageCard}>
                    <div
                      className={styles.imageWrapper}
                      onClick={() => handleImageClick(index)}
                    >
                      {image && image.src ? (
                        <img src={image.src} alt={file.name} />
                      ) : (
                        <div className={styles.imageError}>Failed to load</div>
                      )}
                    </div>
                    <div className={styles.cardFooter}>
                      <div className={styles.cardInfo}>
                        <p className={styles.fileName}>{file.name}</p>
                        {canManage && (
                          <button
                            onClick={() => openLinkerModal(file)}
                            className={styles.linkButton}
                          >
                            Link Trees
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p>No images found in this batch.</p>
            )}
          </div>
        </div>
      </div>

      {canManage && (
        <FileUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          batchId={batchId}
          onUploadComplete={handleUploadComplete}
        />
      )}

      <LinkTreesModal
        isOpen={!!linkingFile}
        onClose={() => setLinkingFile(null)}
        file={linkingFile}
        existingLinks={allTreeImageLinks?.filter(
          (link) => link.file_id === linkingFile?.id
        )}
      />

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
        index={lightboxIndex}
        controller={{ closeOnBackdropClick: true }}
        plugins={[Thumbnails]}
      />
    </>
  );
}
