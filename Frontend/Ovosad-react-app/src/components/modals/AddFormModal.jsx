import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "react-modal";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import styles from "./AddFormModal.module.css";

Modal.setAppElement("#root");

export function AddFormModal({
  buttonText,
  modalTitle,
  mutationFn,
  initialFormData,
  formFieldsConfig,
  onSuccessMessage,
  canOpenModal,
  onSuccessCallback,
  additionalMutationParams = {},
}) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: initialFormData,
  });

  useEffect(() => {
    if (!Modal.defaultStyles.content.appElement) {
      Modal.setAppElement("#root");
    }
  }, []);

  const mutation = useMutation({
    mutationFn: (data) => mutationFn(additionalMutationParams.getToken, data),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setIsOpen(false);
      reset(initialFormData);
      toast.success(onSuccessMessage);
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error) => {
      console.error(`Error creating ${modalTitle.toLowerCase()}:`, error);
      toast.error(
        error.message || `Failed to create ${modalTitle.toLowerCase()}.`
      );
    },
  });

  const onSubmit = (data) => {
    const dataToSubmit = { ...data, ...additionalMutationParams.body };
    mutation.mutate(dataToSubmit);
  };

  const closeModal = () => {
    setIsOpen(false);
    reset(initialFormData);
  };

  const openModal = () => {
    setIsOpen(true);
    reset(initialFormData);
  };

  if (!canOpenModal) {
    return null;
  }

  return (
    <div className={styles.addFormModalSection}>
      <button
        type="button"
        onClick={openModal}
        className={styles.addEntityButton}
      >
        {buttonText}
      </button>

      <Modal
        isOpen={isOpen}
        onRequestClose={closeModal}
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
                    {field.required && (
                      <span className={styles.required}>*</span>
                    )}
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
                      <option value="" disabled>
                        Select an option...
                      </option>
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
              {mutation.isPending ? "Adding..." : "Create"}
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
    </div>
  );
}
