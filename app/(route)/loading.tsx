import { FaSpinner } from "react-icons/fa";

export default function Loading() {
    // You can add any UI inside Loading, including a Skeleton.
    return (
        <div className="flex justify-center items-center h-screen w-full bg-gray-100"
            style={{ minHeight: "100vh" } /* full height */}
        >
            <div className="flex flex-col items-center">
                <div className="text-2xl font-bold mb-4">
                    <FaSpinner className="animate-spin" />
                </div>
            </div>
        </div>
    )
}