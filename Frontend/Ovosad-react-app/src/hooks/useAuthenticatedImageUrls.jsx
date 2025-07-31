import { useState, useEffect } from "react";
import { useKeycloak } from "../auth/KeycloakProvider";
import { fetchImageBlob } from "../services/fileService";

export function useAuthenticatedImageUrls(fileIds = []) {
  const { getToken } = useKeycloak();
  const [imageSources, setImageSources] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const sources = {};

    const fetchAllImages = async () => {
      setIsLoading(true);

      await Promise.all(
        fileIds.map(async (id) => {
          try {
            const blob = await fetchImageBlob(getToken, id);
            const localUrl = URL.createObjectURL(blob);
            sources[id] = localUrl;
          } catch (error) {
            console.error(`Failed to load image for file ID ${id}:`, error);
            sources[id] = null;
          }
        })
      );

      if (isMounted) {
        const finalSources = fileIds.map((id) => ({
          fileId: id,
          src: sources[id],
        }));
        setImageSources(finalSources);
        setIsLoading(false);
      }
    };

    if (fileIds.length > 0) {
      fetchAllImages();
    } else {
      setImageSources([]);
    }

    // Cleanup function to remove the blob URLs from memory
    return () => {
      isMounted = false;
      Object.values(sources).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [fileIds, getToken]);

  return { imageSources, isLoading };
}
