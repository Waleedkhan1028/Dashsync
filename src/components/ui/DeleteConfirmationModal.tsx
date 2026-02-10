"use client";

import Modal from "./Modal";

type DeleteConfirmationModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    itemName: string;
    itemType: "workspace" | "project" | "task";
    isDeleting?: boolean;
    cascadeWarning?: string;
};

export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    itemName,
    itemType,
    isDeleting = false,
    cascadeWarning
}: DeleteConfirmationModalProps) {
    const getCascadeMessage = () => {
        if (cascadeWarning) return cascadeWarning;
        
        if (itemType === "workspace") {
            return "This will permanently delete the workspace and all its projects and tasks.";
        } else if (itemType === "project") {
            return "This will permanently delete the project and all its tasks.";
        }
        return "This action cannot be undone.";
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
            <div className="space-y-6">
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="text-3xl">⚠️</div>
                        <div className="flex-1">
                            <p className="font-bold text-gray-900 mb-2">
                                Are you sure you want to delete{" "}
                                <span className="text-red-600">&quot;{itemName}&quot;</span>?
                            </p>
                            <p className="text-sm text-gray-600 font-medium">
                                {getCascadeMessage()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-1 py-4 px-6 rounded-2xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 py-4 px-6 rounded-2xl bg-red-600 text-white font-black hover:bg-red-700 disabled:opacity-50 transition-all shadow-xl shadow-red-200 active:scale-95"
                    >
                        {isDeleting ? "Deleting..." : "Delete Permanently"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
