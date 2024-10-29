// utils/positionStyles.js
const positionStyles = {
    QB: { text: "text-[#FC2B6D]", bg: "bg-[#252942]", border: "rounded-md" },
    RB: { text: "text-[#20CEB8]", bg: "bg-[#252942]", border: "rounded-md" },
    WR: { text: "text-[#56C9F8]", bg: "bg-[#252942]", border: "rounded-md" },
    TE: { text: "text-[#FEAE58]", bg: "bg-[#252942]", border: "rounded-md" },
    K: { text: "text-[#C96CFF]", bg: "bg-[#252942]", border: "rounded-md" },
    DEF: { text: "text-[#BF755D]", bg: "bg-[#252942]", border: "rounded-md" },
    FLEX: { text: "text-pink-900", bg: "bg-[#252942]", border: "rounded-md" },
  };
  
  const getPositionStyles = (position) =>
    positionStyles[position] || {
      text: "text-gray-900",
      bg: "bg-gray-300",
      border: "rounded",
    };
  
  export { getPositionStyles };
  