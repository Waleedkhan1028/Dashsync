import Modal from "@/components/ui/Modal";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useEffect } from "react";

const workspaceSchema = yup.object({
    workspaceName: yup.string().required("Workspace name is required"),
});

interface CreateWorkspaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (workspaceName: string) => Promise<void>;
    isLoading: boolean;
    error: any;
}

export function CreateWorkspaceModal({ isOpen, onClose, onSubmit, isLoading, error }: CreateWorkspaceModalProps) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(workspaceSchema),
    });

    useEffect(() => {
        if (isOpen) reset();
    }, [isOpen, reset]);

    if (!isOpen) return null;

    return (
        <Modal title="New Workspace" onClose={onClose}>
            <p className="text-gray-500 mb-8 font-medium">Give your workspace a distinctive name.</p>
            <form onSubmit={handleSubmit((data) => onSubmit(data.workspaceName))}>
                <input
                    {...register("workspaceName")}
                    placeholder="e.g., Creative Labs"
                    className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none mb-4 transition-all font-semibold text-gray-900"
                    autoFocus
                />
                {errors.workspaceName && <p className="text-red-500 text-sm mb-4 font-bold px-1">{errors.workspaceName.message as string}</p>}
                {error && <p className="text-red-500 text-sm mb-4 font-bold px-1">{error.message}</p>}
                <div className="flex gap-4 mt-6">
                    <button type="button" onClick={onClose} className="flex-1 py-4 px-6 rounded-2xl border border-gray-100 text-gray-600 font-bold hover:bg-gray-50 transition-colors">Cancel</button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 py-4 px-6 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 disabled:opacity-50 transition-all shadow-xl shadow-blue-200"
                    >
                        {isLoading ? "Creating..." : "Launch"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
