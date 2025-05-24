interface MultiSelectInputProps {
    label: string;
    options: string[];
    selectedValues: string[];
    onChange: (selectedValues: string[]) => void;
  }
  
 export const MultiSelectInput: React.FC<MultiSelectInputProps> = ({
    label,
    options,
    selectedValues,
    onChange,
  }) => {
    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedOption = e.target.value;
      if (selectedOption && !selectedValues.includes(selectedOption)) {
        onChange([...selectedValues, selectedOption]);
      }
    };
  
    const handleRemove = (value: string) => {
      onChange(selectedValues.filter((v) => v !== value));
    };
  
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <select
          onChange={handleSelect}
          className="w-full p-2 border rounded-md mt-2"
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
  
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedValues.map((value) => (
            <div
              key={value}
              className="flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm"
            >
              {value}
              <button
                type="button"
                onClick={() => handleRemove(value)}
                className="ml-2 text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };