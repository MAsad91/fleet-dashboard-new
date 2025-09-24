"use client";

import { useState } from "react";
import { Calendar, X } from "lucide-react";
import { Button } from "@/components/ui-elements/button";

interface DateRangePickerProps {
  label?: string;
  value?: { start: string; end: string };
  onChange: (range: { start: string; end: string } | null) => void;
  placeholder?: string;
  className?: string;
}

export default function DateRangePicker({
  label,
  value,
  onChange,
  placeholder = "Select date range",
  className = ""
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleStartDateChange = (startDate: string) => {
    if (value) {
      onChange({ ...value, start: startDate });
    } else {
      onChange({ start: startDate, end: "" });
    }
  };

  const handleEndDateChange = (endDate: string) => {
    if (value) {
      onChange({ ...value, end: endDate });
    }
  };

  const handleClear = () => {
    onChange(null);
    setIsOpen(false);
  };

  const handleApply = () => {
    setIsOpen(false);
  };

  const formatDateRange = () => {
    if (!value?.start && !value?.end) return placeholder;
    if (value.start && value.end) {
      return `${new Date(value.start).toLocaleDateString()} - ${new Date(value.end).toLocaleDateString()}`;
    }
    if (value.start) return `From ${new Date(value.start).toLocaleDateString()}`;
    if (value.end) return `Until ${new Date(value.end).toLocaleDateString()}`;
    return placeholder;
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
      >
        <span className="text-sm">{formatDateRange()}</span>
        <div className="flex items-center space-x-2">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <Calendar className="h-4 w-4 text-gray-400" />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg p-4 min-w-[320px]">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={value?.start || ""}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={value?.end || ""}
                onChange={(e) => handleEndDateChange(e.target.value)}
                min={value?.start || ""}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="flex justify-between space-x-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <Button
                label="Clear"
                variant="outlineDark"
                size="small"
                onClick={handleClear}
                className="flex-1"
              />
              <Button
                label="Apply"
                variant="primary"
                size="small"
                onClick={handleApply}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
