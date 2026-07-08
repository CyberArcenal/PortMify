// src/pages/profile/components/ChangePasswordDialog.tsx
import React from "react";
import { useForm } from "react-hook-form";
import Modal from "../../../components/UI/Modal";
import Button from "../../../components/UI/Button";
import { dialogs } from "../../../utils/dialogs";
import userAPI from "@/api/core/user";

interface Props {
  isOpen: boolean;
  userId?: number;
  isAdmin?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type FormData = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

const ChangePasswordDialog: React.FC<Props> = ({
  isOpen,
  userId,
  isAdmin = false,
  onClose,
  onSuccess,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    }
  }, [isOpen, reset]);

  const newPassword = watch("new_password");

  const onSubmit = async (data: FormData) => {
    try {
      if (isAdmin && userId) {
        // Admin changing password for another user
        await userAPI.changePassword(userId, {
          new_password: data.new_password,
        });
        dialogs.success("Password changed successfully for this user.");
      } else {
        // User changing their own password
        await userAPI.changePassword(undefined, {
          current_password: data.current_password,
          new_password: data.new_password,
        });
        dialogs.success("Password changed successfully.");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      dialogs.error(err.message || "Failed to change password.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Password" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {!isAdmin && (
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">
              Current Password *
            </label>
            <input
              type="password"
              {...register("current_password", {
                required: "Current password is required",
              })}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--input-text)",
              }}
              placeholder="Enter current password"
            />
            {errors.current_password && (
              <p className="text-xs text-[var(--danger-color)] mt-1">
                {errors.current_password.message}
              </p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">
            New Password *
          </label>
          <input
            type="password"
            {...register("new_password", {
              required: "New password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{
              backgroundColor: "var(--input-bg)",
              borderColor: "var(--input-border)",
              color: "var(--input-text)",
            }}
            placeholder="Enter new password (min 8 chars)"
          />
          {errors.new_password && (
            <p className="text-xs text-[var(--danger-color)] mt-1">
              {errors.new_password.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">
            Confirm Password *
          </label>
          <input
            type="password"
            {...register("confirm_password", {
              required: "Please confirm your password",
              validate: (value) =>
                value === newPassword || "Passwords do not match",
            })}
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{
              backgroundColor: "var(--input-bg)",
              borderColor: "var(--input-border)",
              color: "var(--input-text)",
            }}
            placeholder="Confirm new password"
          />
          {errors.confirm_password && (
            <p className="text-xs text-[var(--danger-color)] mt-1">
              {errors.confirm_password.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-color)]">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Changing..." : "Change Password"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ChangePasswordDialog;