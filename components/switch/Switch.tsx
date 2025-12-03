interface SwitchProps {
    name: string;
    label: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({
    name,
    label,
    checked,
    onChange,
    disabled = false
}) => {
    return (
        <label className="flex items-center cursor-pointer group">
            <div className="relative">
                <input
                    type="checkbox"
                    name={name}
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    className="sr-only peer"
                />
                <div className={`
          w-11 h-6 rounded-full transition-colors duration-200 ease-in-out
          ${disabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-300'}
          peer-checked:bg-blue-600
          peer-focus:ring-2 peer-focus:ring-blue-300
        `}></div>
                <div className={`
          absolute left-1 top-1 bg-white w-4 h-4 rounded-full 
          transition-transform duration-200 ease-in-out
          peer-checked:translate-x-5
          ${disabled ? 'cursor-not-allowed' : ''}
        `}></div>
            </div>
            <span className={`
        ml-3 text-sm font-medium
        ${disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 dark:text-gray-100'}
        group-hover:text-gray-900 dark:group-hover:text-gray-500
      `}>
                {label}
            </span>
        </label>
    );
};