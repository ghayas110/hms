"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Loader2, Pill } from "lucide-react"
import { doctorService } from "@/lib/api/doctor"
import { InventoryItem } from "@/lib/api/types"

export interface MedicineAutocompleteProps {
    value: string
    onChange: (value: string) => void
    onSelect?: (item: InventoryItem) => void
    placeholder?: string
    className?: string
}

export function MedicineAutocomplete({ value, onChange, onSelect, placeholder = "Search medicine...", className = "" }: MedicineAutocompleteProps) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState(value)
    const [options, setOptions] = useState<InventoryItem[]>([])
    const [loading, setLoading] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    
    // Update local query when prop value changes externally
    useEffect(() => {
        setQuery(value)
    }, [value])

    // Debounced Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length < 2) {
                setOptions([])
                return
            }
            
            setLoading(true)
            try {
                const results = await doctorService.getInventory(query)
                setOptions(results)
                if(results.length > 0) setOpen(true)
            } catch (e) {
                console.error("Search failed", e)
            } finally {
                setLoading(false)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    // Handle outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                <input
                    className="w-full pl-8 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-900 dark:border-slate-800"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        onChange(e.target.value)
                        setOpen(true)
                    }}
                    onFocus={() => {
                        if (options.length > 0) setOpen(true)
                    }}
                />
                {loading && (
                    <div className="absolute right-2 top-2.5">
                        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                    </div>
                )}
            </div>

            {open && options.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md shadow-lg max-h-60 overflow-auto">
                    {options.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer text-sm"
                            onClick={() => {
                                setQuery(item.medicine_name)
                                onChange(item.medicine_name)
                                if (onSelect) onSelect(item)
                                setOpen(false)
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <Pill className="h-3 w-3 text-teal-600" />
                                <span className="font-medium">{item.medicine_name}</span>
                            </div>
                            <div className="text-xs text-slate-500">
                                Stock: {item.stock}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
