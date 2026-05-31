export default function ToggleSwitch({
  isSolo,
  onToggle,
}: {
  isSolo: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="relative flex h-10 w-52 items-center rounded-full bg-gradient-to-r from-orange-100 to-sky-100 p-1 shadow-inner transition-all duration-300"
      aria-label="Переключить режим"
    >
      <span
        className={`absolute h-8 w-[calc(50%-4px)] rounded-full bg-gradient-to-r from-orange-500 to-amber-400 shadow-lg transition-all duration-300 ease-out ${
          isSolo ? "left-1" : "left-[calc(50%+2px)]"
        }`}
      />
      <span
        className={`relative z-10 flex-1 text-center text-xs font-bold transition-colors duration-300 ${
          isSolo ? "text-white" : "text-stone-500"
        }`}
      >
        Соло
      </span>
      <span
        className={`relative z-10 flex-1 text-center text-xs font-bold transition-colors duration-300 ${
          !isSolo ? "text-white" : "text-stone-500"
        }`}
      >
        С друзьями
      </span>
    </button>
  );
}
