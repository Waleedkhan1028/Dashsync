import Modal from "@/components/ui/Modal";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useEffect } from "react";

const projectSchema = yup.object({
    projectName: yup.string().required("Project name is required"),
});

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (projectName: string) => Promise<void>;
    isLoading: boolean;
    error: Error | null;
    workspaceName?: string;
}

export function CreateProjectModal({ isOpen, onClose, onSubmit, isLoading, error, workspaceName }: CreateProjectModalProps) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(projectSchema),
    });

    useEffect(() => {
        if (isOpen) reset();
    }, [isOpen, reset]);

    if (!isOpen) return null;

    return (
        <Modal title="Launch Project" onClose={onClose}>
            <p className="text-gray-500 mb-8 font-bold text-sm tracking-wide lowercase first-letter:uppercase">
                Creating in <span className="text-blue-600 px-2 py-1 bg-blue-50 rounded-lg">{workspaceName}</span>
            </p>
            <form onSubmit={handleSubmit((data) => onSubmit(data.projectName))}>
                <input
                    {...register("projectName")}
                    placeholder="e.g., Marketing Revamp"
                    className="w-full px-6 py-5 rounded-xl sm:rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none mb-4 transition-all font-bold text-gray-900 placeholder:text-gray-300"
                    autoFocus
                />
                {errors.projectName && <p className="text-red-500 text-xs mb-4 font-black uppercase tracking-widest px-1">{errors.projectName.message as string}</p>}
                {error && <p className="text-red-500 text-xs mb-4 font-black uppercase tracking-widest px-1">{error.message}</p>}
                <div className="flex gap-4 mt-8">
                    <button type="button" onClick={onClose} className="flex-1 py-4 sm:py-5 px-6 rounded-xl sm:rounded-2xl border border-gray-100 text-gray-400 font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all">Cancel</button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 py-4 sm:py-5 px-6 rounded-xl sm:rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 disabled:opacity-50 transition-all shadow-premium"
                    >
                        {isLoading ? "Launching..." : "Launch Project"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
