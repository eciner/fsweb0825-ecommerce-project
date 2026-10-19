// Shared button utility classes for consistent styling

export const interactiveButton =
  "cursor-pointer transition-colors duration-150 shadow-sm hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60";

export const primaryButton =
  "cursor-pointer bg-action text-white px-6 py-3 rounded-md font-semibold transition-all duration-200 hover:bg-ink focus:outline-none focus:ring-2 focus:ring-[#23A6F0] focus:ring-offset-2";

export const secondaryButton =
  "cursor-pointer bg-success text-white px-6 py-3 rounded-md font-semibold transition-all duration-200 hover:bg-[#1f755f] focus:outline-none focus:ring-2 focus:ring-[#2DC071] focus:ring-offset-2";

export const outlineButton =
  "cursor-pointer border-2 border-[#23A6F0] text-action bg-transparent px-6 py-3 rounded-md font-semibold transition-all duration-200 hover:bg-action hover:text-white focus:outline-none focus:ring-2 focus:ring-[#23A6F0] focus:ring-offset-2";

export const textButton =
  "cursor-pointer text-action font-semibold transition-colors duration-200 hover:text-[#1B8FD8] focus:outline-none focus:underline";

export const dangerButton =
  "cursor-pointer bg-danger-text text-white px-6 py-3 rounded-md font-semibold transition-all duration-200 hover:bg-[#D13030] focus:outline-none focus:ring-2 focus:ring-[#E74040] focus:ring-offset-2";
