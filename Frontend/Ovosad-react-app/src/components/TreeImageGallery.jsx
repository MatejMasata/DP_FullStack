import React from "react";
import styles from "./TreeImageGallery.module.css";

export function TreeImageGallery({
  files,
  imageSources,
  treeImageLinks,
  onImageClick,
  onUnlinkClick,
  canManage,
}) {
  if (!files || files.length === 0) {
    return (
      <p className={styles.noImagesMessage}>No images found for this tree.</p>
    );
  }

  return (
    <div className={styles.gallery}>
      {files.map((file, index) => {
        const image = imageSources.find((src) => src.fileId === file.id);
        const link = treeImageLinks.find((l) => l.file_id === file.id);

        return (
          <div key={file.id} className={styles.imageCard}>
            <div
              className={styles.imageWrapper}
              onClick={() => onImageClick(index)}
            >
              {image && image.src ? (
                <img src={image.src} alt={file.name} />
              ) : (
                <div className={styles.imageError}>Loading...</div>
              )}
            </div>
            <div className={styles.cardFooter}>
              <div className={styles.cardInfo}>
                <p className={styles.fileName}>{file.name}</p>
                {canManage && link && (
                  <button
                    onClick={() => onUnlinkClick(link)}
                    className={styles.unlinkButton}
                  >
                    Unlink
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
