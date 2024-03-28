"use client";

import { useActions, useUIState } from "ai/rsc";

import type { AI } from "../../app/action";

export function Stocks({ stocks }: { stocks: any[] }) {
  const [, setMessages] = useUIState<typeof AI>();
  const { submitUserMessage } = useActions<typeof AI>();

  return (
    <div className="flex flex-wrap gap-4 justify-start pb-4 mb-4 overflow-y-auto text-sm">
      {stocks.map((stock) => (
        <button
          key={stock.name}
          className="flex flex-row items-center gap-2 p-2 text-left bg-[#1a1a1a] hover:bg-zinc-800 rounded-lg w-full sm:w-auto"
          style={{ flex: "1 0 30%" }} // Ensures flex items are allowed to grow and wrap, with a basis of 30%
          onClick={async () => {
            const response = await submitUserMessage(
              `View ${stock.name}`,
              null
            );
            setMessages((currentMessages) => [...currentMessages, response]);
          }}
        >
          <div
            className={`text-xl ${stock.priceChangePercentage > 0 ? "text-green-600" : "text-red-600"} p-2 w-11 bg-[#1a1a1a] flex justify-center items-center rounded-md`}
          >
            {stock.priceChangePercentage > 0 ? "↑" : "↓"}
          </div>
          <div className="flex flex-col gap-1">
            <div className="uppercase text-zinc-300 font-medium font-gabarito text-xs">
              {stock.name}
            </div>
            <div className="text-sm font-gabarito text-zinc-500">
              ${stock.price}
            </div>
          </div>
          <div className="flex flex-col ml-auto">
            {/* <div className={`${stock.priceChangePercentage > 0 ? 'text-yellow-600' : 'text-red-600'} font-bold uppercase text-right`}>
            {
    typeof stock.priceChangePercentage === 'number'
    ? `${parseFloat(stock.priceChangePercentage).toFixed(2)}%`
    : 'N/A'
}
            </div> */}
            <div
              className={`${stock.priceChangePercentage > 0 ? "text-green-600" : "text-red-700"} text-base text-right`}
            >
              {stock.priceChangePercentage}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
