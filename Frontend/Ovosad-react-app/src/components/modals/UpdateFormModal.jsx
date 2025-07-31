import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "react-modal";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import styles from "./AddFormModal.module.css"; // Reusing existing modal CSS

export function UpdateFormModal({
  modalTitle,
  mutationFn, // (getToken, id, data)
  itemData, // Object to be edited
  formFieldsConfig, // Field definitions
  onSuccessMessage,
  isOpen: propIsOpen,
  onClose: propOnClose,
  additionalMutationParams = {},
  onSuccessCallback,
}) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(propIsOpen || false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: itemData, // Set initial form values
  });

  useEffect(() => {
    setIsOpen(propIsOpen);
    if (propIsOpen) {
      reset(itemData);
    }
  }, [propIsOpen, itemData, reset]);

  const mutation = useMutation({
    mutationFn: (payload) =>
      mutationFn(additionalMutationParams.getToken, payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success(onSuccessMessage); // Show success toast
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error) => {
      console.error(`Error updating ${modalTitle.toLowerCase()}:`, error);
      toast.error(
        error.message || `Failed to update ${modalTitle.toLowerCase()}.`
      ); // Show error toast
    },
  });

  const onSubmit = (data) => {
    const dataToSubmit = { ...data, ...additionalMutationParams.body };
    mutation.mutate({ id: itemData.id, data: dataToSubmit });
  };

  const closeModal = () => {
    setIsOpen(false);
    reset(itemData);
    if (propOnClose) propOnClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal} // Handles closing - overlay click or escape key
      className={styles.modalContent}
      overlayClassName={styles.modalOverlay}
      closeTimeoutMS={0}
    >
      <h2 className={styles.modalTitle}>{modalTitle}</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.formGrid}>
          {formFieldsConfig.map((field) =>
            field.hidden ? null : (
              <React.Fragment key={field.name}>
                <label>
                  {field.label}
                  {field.required && <span className={styles.required}>*</span>}
                </label>
                {field.type === "select" ? (
                  <select
                    {...register(field.name, {
                      required: field.required
                        ? `${field.label} is required.`
                        : false,
                    })}
                    disabled={mutation.isPending || isSubmitting}
                    className={errors[field.name] ? styles.inputError : ""}
                  >
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    {...register(field.name, {
                      required: field.required
                        ? `${field.label} is required.`
                        : false,
                    })}
                    disabled={mutation.isPending || isSubmitting}
                    step={field.step}
                    className={errors[field.name] ? styles.inputError : ""}
                  />
                )}
                {errors[field.name] && (
                  <p className={styles.fieldErrorMessage}>
                    {errors[field.name].message}
                  </p>
                )}
              </React.Fragment>
            )
          )}
        </div>

        <div className={styles.formButtons}>
          <button
            type="submit"
            disabled={mutation.isPending || isSubmitting}
            className={styles.createButton}
          >
            {mutation.isPending ? "Updating..." : "Update"}
          </button>
          <button
            type="button"
            onClick={closeModal}
            disabled={mutation.isPending || isSubmitting}
            className={styles.cancelButton}
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
