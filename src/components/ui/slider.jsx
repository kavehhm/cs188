export function Slider({
  value = [0],
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  className = "",
}) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={(event) => onValueChange?.([Number(event.target.value)])}
      className={`h-2 w-full cursor-pointer accent-violet-500 ${className}`}
    />
  );
}
