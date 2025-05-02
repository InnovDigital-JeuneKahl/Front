"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface PriceRangeSliderProps {
  value: [number, number]
  onChange: (value: [number, number] | undefined) => void
  min?: number
  max?: number
  step?: number
}

export function PriceRangeSlider({ value, onChange, min = 0, max = 10000, step = 10 }: PriceRangeSliderProps) {
  const [localValue, setLocalValue] = React.useState<[number, number]>(value)
  const [minInput, setMinInput] = React.useState<string>(value[0].toString())
  const [maxInput, setMaxInput] = React.useState<string>(value[1].toString())

  React.useEffect(() => {
    setLocalValue(value)
    setMinInput(value[0].toString())
    setMaxInput(value[1].toString())
  }, [value])

  const handleSliderChange = (newValue: number[]) => {
    const typedValue = newValue as [number, number]
    setLocalValue(typedValue)
    setMinInput(typedValue[0].toString())
    setMaxInput(typedValue[1].toString())
    onChange(typedValue)
  }

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinInput(e.target.value)
    const newMin = Number.parseInt(e.target.value) || 0
    if (!isNaN(newMin) && newMin >= min && newMin <= localValue[1]) {
      const newValue: [number, number] = [newMin, localValue[1]]
      setLocalValue(newValue)
      onChange(newValue)
    }
  }

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxInput(e.target.value)
    const newMax = Number.parseInt(e.target.value) || 0
    if (!isNaN(newMax) && newMax <= max && newMax >= localValue[0]) {
      const newValue: [number, number] = [localValue[0], newMax]
      setLocalValue(newValue)
      onChange(newValue)
    }
  }

  const handleMinInputBlur = () => {
    const newMin = Number.parseInt(minInput) || 0
    if (isNaN(newMin) || newMin < min) {
      setMinInput(min.toString())
      const newValue: [number, number] = [min, localValue[1]]
      setLocalValue(newValue)
      onChange(newValue)
    } else if (newMin > localValue[1]) {
      setMinInput(localValue[1].toString())
      const newValue: [number, number] = [localValue[1], localValue[1]]
      setLocalValue(newValue)
      onChange(newValue)
    }
  }

  const handleMaxInputBlur = () => {
    const newMax = Number.parseInt(maxInput) || 0
    if (isNaN(newMax) || newMax > max) {
      setMaxInput(max.toString())
      const newValue: [number, number] = [localValue[0], max]
      setLocalValue(newValue)
      onChange(newValue)
    } else if (newMax < localValue[0]) {
      setMaxInput(localValue[0].toString())
      const newValue: [number, number] = [localValue[0], localValue[0]]
      setLocalValue(newValue)
      onChange(newValue)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="grid gap-1">
          <Label htmlFor="min-price">Min (€)</Label>
          <Input
            id="min-price"
            type="number"
            min={min}
            max={localValue[1]}
            value={minInput}
            onChange={handleMinInputChange}
            onBlur={handleMinInputBlur}
            className="w-24"
          />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="max-price">Max (€)</Label>
          <Input
            id="max-price"
            type="number"
            min={localValue[0]}
            max={max}
            value={maxInput}
            onChange={handleMaxInputChange}
            onBlur={handleMaxInputBlur}
            className="w-24"
          />
        </div>
      </div>
      <SliderPrimitive.Root
        className="relative flex w-full touch-none select-none items-center"
        value={localValue}
        onValueChange={handleSliderChange}
        min={min}
        max={max}
        step={step}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
    </div>
  )
}
