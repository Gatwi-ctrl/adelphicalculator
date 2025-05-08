import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
}

export default function CurrencyInput({
  value,
  onChange,
  placeholder = "0.00",
  className,
}: CurrencyInputProps) {
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
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span className="text-neutral-500">$</span>
      </div>
      <Input
        type="text"
        className={`pl-7 ${className}`}
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
      />
    </div>
  );
}
