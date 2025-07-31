import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Leaflet
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayersControl,
  LayerGroup,
} from "react-leaflet";
import { createLayerComponent } from "@react-leaflet/core";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import treeIcon from "../assets/apple-tree.png";
import { TileLayerHeaders } from "leaflet-custom-headers";

// Token
import { useKeycloak } from "../auth/KeycloakProvider";

// CSS
import styles from "./TreeMap.module.css";

// React-Leaflet component
const AuthenticatedTileLayer = createLayerComponent(function createTileLayer(
  props,
  context
) {
  const instance = new TileLayerHeaders(props.url, { ...props });
  return { instance, context };
});

export function MapDisplay({ trees }) {
  const navigate = useNavigate();
  const [hoveredTree, setHoveredTree] = useState(null);
  const { getToken } = useKeycloak();
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      const token = await getToken();
      setAuthToken(token);
    };
    fetchToken();
  }, [getToken]);

  if (!trees || trees.length === 0) {
    return (
      <div className={styles.noMapDataMessage}>
        No tree data available for the map.
      </div>
    );
  }

  const markers = trees.map((tree) => ({
    id: tree.id,
    geocode: [tree.latitude, tree.longitude],
    popUpContent: (
      <>
        <span className={styles.greenText}>Tree ID:</span> {tree.id}
      </>
    ),
    data: tree,
  }));

  const customIcon = new Icon({
    iconUrl: treeIcon,
    iconSize: [15, 15],
  });

  const initialCenter =
    trees.length > 0
      ? [trees[0].latitude, trees[0].longitude]
      : [50.3700367, 15.5677933];

  const handleMarkerClick = (treeId) => {
    navigate(`/tree/${treeId}`);
  };

  const handleMarkerMouseOver = (treeData) => {
    setHoveredTree(treeData);
  };

  const handleMarkerMouseOut = () => {
    setHoveredTree(null);
  };

  const excludedKeys = [
    "note",
    "tree_images",
    "tree_data",
    "harvests",
    "flower_thinnings",
    "fruit_thinnings",
    "sprayings",
  ];

  const formatKey = (key) => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className={styles.mapContainerWrapper}>
      <MapContainer
        center={initialCenter}
        zoom={20}
        scrollWheelZoom={true}
        className={styles.leafletContainer}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer name="OpenStreetMap">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={20}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer checked name="Mapy.cz (Aerial)">
            {authToken && (
              <AuthenticatedTileLayer
                key={authToken}
                attribution='<a href="https://api.mapy.cz/copyright" target="_blank">&copy; Seznam.cz a.s. a další</a>'
                url="/api/v1/map-tiles/{z}/{x}/{y}"
                maxZoom={20}
                customHeaders={{
                  Authorization: `Bearer ${authToken}`,
                }}
              />
            )}
          </LayersControl.BaseLayer>

          <LayersControl.Overlay checked name="Tree Markers">
            <LayerGroup>
              {markers.map((marker) => (
                <Marker
                  key={marker.id}
                  position={marker.geocode}
                  icon={customIcon}
                  eventHandlers={{
                    click: () => handleMarkerClick(marker.id),
                    mouseover: (e) => {
                      e.target.openPopup();
                      handleMarkerMouseOver(marker.data);
                    },
                    mouseout: (e) => {
                      e.target.closePopup();
                      handleMarkerMouseOut();
                    },
                  }}
                >
                  <Popup>
                    <strong>{marker.popUpContent}</strong>
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>
      </MapContainer>

      <div className={styles.hoverInfoPanel}>
        {hoveredTree ? (
          <>
            <h3>Tree Details</h3>
            {Object.keys(hoveredTree).map((key) => {
              if (excludedKeys.includes(key)) return null;
              const value = hoveredTree[key];
              if (
                value === null ||
                value === undefined ||
                String(value).trim() === ""
              )
                return null;
              return (
                <p key={key} className={styles.detailRow}>
                  <strong>{formatKey(key)}:</strong>{" "}
                  <span>{String(value)}</span>
                </p>
              );
            })}
          </>
        ) : (
          <p className={styles.noHoverMessage}>
            Hover over a tree marker to see tree details.
          </p>
        )}
      </div>
    </div>
  );
}
