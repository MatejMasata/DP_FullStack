import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import styles from "./KebabMenu.module.css";

export function KebabMenu({
  canUpdate = false,
  canDelete = false,
  onUpdateClick,
  onDeleteClick,
  mutationIsPending = false,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Toggles the visibility of the dropdown menu
  const handleToggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu((prev) => !prev);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showMenu &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target) &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  // Update click
  const handleUpdate = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onUpdateClick) {
      onUpdateClick();
    }
  };

  // Delete click
  const handleDelete = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onDeleteClick) {
      onDeleteClick();
    }
  };

  // Only render the kebab menu button if there's at least one action possible
  if (!canUpdate && !canDelete) {
    return null;
  }

  // The Portal component for the dropdown menu
  const MenuDropdownPortal = () => {
    if (!showMenu) return null;

    // Calculate position of the button to position the dropdown next to it
    const buttonRect = buttonRef.current?.getBoundingClientRect();
    if (!buttonRect) return null;

    const dropdownStyle = {
      position: "absolute",
      top: buttonRect.bottom + window.scrollY + 5,
      left: buttonRect.left + window.scrollX,
      zIndex: 1000,
    };

    const estimatedDropdownWidth = 120;
    if (buttonRect.left + estimatedDropdownWidth > window.innerWidth) {
      dropdownStyle.left = buttonRect.right - estimatedDropdownWidth;
    }

    return ReactDOM.createPortal(
      <div
        ref={menuRef}
        className={styles.kebabMenuDropdown}
        style={dropdownStyle}
      >
        {canUpdate && (
          <button
            onClick={handleUpdate}
            className={styles.menuItem}
            disabled={mutationIsPending}
          >
            Update
          </button>
        )}
        {canDelete && (
          <button
            onClick={handleDelete}
            className={`${styles.menuItem} ${styles.deleteMenuItem}`}
            disabled={mutationIsPending}
          >
            Delete
          </button>
        )}
      </div>,
      document.body
    );
  };

  return (
    <div className={styles.kebabMenuWrapper}>
      <button
        ref={buttonRef}
        className={styles.kebabMenuButton}
        onClick={handleToggleMenu}
      >
        &#x22EE;{" "}
        {/* Unicode character for vertical ellipsis (kebab menu icon) */}
      </button>
      <MenuDropdownPortal />
    </div>
  );
}
