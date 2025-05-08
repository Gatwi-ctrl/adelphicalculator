import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

interface PercentageInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
}

export default function PercentageInput({
  value,
  onChange,
  placeholder = "0.00",
  className,
}: PercentageInputProps) {
  const [displayValue, setDisplayValue] = useState<string>("");

  // Update display value when value prop changes
  useEffect(() => {
    setDisplayValue(value !== 0 ? value.toString() : "");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow only numbers and decimal point
    if (inputValue === "" || /^[0-9]*\.?[0-9]*$/.test(inputValue)) {
      setDisplayValue(inputValue);
      
      // Convert to number for the onChange callback
      const numericValue = inputValue === "" ? 0 : parseFloat(inputValue);
      onChange(!isNaN(numericValue) ? numericValue : 0);
    }
  };

  return (
    <div className="relative">
      <Input
        type="text"
        className={`pr-7 ${className}`}
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <span className="text-neutral-500">%</span>
      </div>
    </div>
  );
}
