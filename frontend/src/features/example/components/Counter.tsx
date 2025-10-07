"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/Button";

interface CounterProps {
  initialCount?: number;
  onCountChange?: (count: number) => void;
}

export function Counter({ initialCount = 0, onCountChange }: CounterProps) {
  const [count, setCount] = useState(initialCount);

  const increment = () => {
    const newCount = count + 1;
    setCount(newCount);
    onCountChange?.(newCount);
  };

  const decrement = () => {
    const newCount = count - 1;
    setCount(newCount);
    onCountChange?.(newCount);
  };

  const reset = () => {
    setCount(initialCount);
    onCountChange?.(initialCount);
  };

  return (
    <div className="flex flex-col items-center space-y-4 rounded-lg bg-gray-50 p-6">
      <h2 className="text-xl font-semibold">Counter Example</h2>

      <div className="text-4xl font-bold" data-testid="count-display">
        {count}
      </div>

      <div className="flex space-x-2">
        <Button
          onClick={decrement}
          variant="outline"
          size="sm"
          aria-label="Decrement count"
        >
          -
        </Button>

        <Button
          onClick={increment}
          variant="outline"
          size="sm"
          aria-label="Increment count"
        >
          +
        </Button>
      </div>

      <Button
        onClick={reset}
        variant="secondary"
        size="sm"
        disabled={count === initialCount}
      >
        Reset
      </Button>
    </div>
  );
}
