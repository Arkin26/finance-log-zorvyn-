"use client";

import Modal from "@/components/modals/Modal";
import type { ReactNode } from "react";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirm",
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-lavender-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-lavender-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => onConfirm()}
            className={
              danger
                ? "rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                : "rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
            }
          >
            {confirmText}
          </button>
        </>
      }
    >
      {description ? (
        <div className="text-sm text-zinc-600">{description}</div>
      ) : null}
    </Modal>
  );
}
