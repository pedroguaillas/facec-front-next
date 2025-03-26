import { axiosAuth } from "@/lib/axios";

interface Props {
    isOpen: boolean;
    index: number;
    order: OrderProps;
    setIsOpen: (index: number) => void;
}

export const Dropdown = ({ isOpen, index, order, setIsOpen }: Props) => {

    const options = [
        { label: "Ver Pdf", onClick: () => showOrderPdf() },
        { label: "Anular", onClick: () => console.log("Option 2 clicked") },
        { label: "Descargar Xml", onClick: () => console.log("Option 3 clicked") },
        { label: "Enviar correo", onClick: () => console.log("Option 3 clicked") },
        { label: "Imprimir", onClick: () => console.log("Option 3 clicked") },
    ];

    const showOrderPdf = async () => {
        try {
            await axiosAuth.get(`orders/${order.id}/pdf`, { responseType: 'blob' }).then(res => {
                //Create a Blob from the PDF Stream
                const file = new Blob([res.data], { type: 'application/pdf' })
                //Build a URL from the file
                const fileURL = URL.createObjectURL(file)
                //Open the URL on new Window
                window.open(fileURL)
            })
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="relative inline-block text-left min-w-[40px]">

            {/* Dropdown Button */}
            <button onClick={() => setIsOpen(index)} className="rounded-full text-white bg-blue-700 px-3 py-1 my-auto font-bold cursor-pointer">&#60;</button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 z-1000 w-40 mt-2 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg dark:bg-gray-800 dark:border-gray-700">
                    <div className="py-1">
                        {options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setIsOpen(index); // Close dropdown after selection
                                    option.onClick();
                                }}
                                className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white text-left"
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};