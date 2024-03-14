export const StocksSkeleton = () => {
  return (
    <div className="flex flex-col sm:flex-row text-sm gap-2 mb-4 overflow-y-scroll pb-4">
      <div className="bg-zinc-900 text-left p-2 rounded-lg flex flex-row gap-2 cursor-pointer hover:bg-zinc-800 h-[60px] sm:w-[208px] w-full"></div>
      <div className="bg-zinc-900 text-left p-2 rounded-lg flex flex-row gap-2 cursor-pointer hover:bg-zinc-800 h-[60px] sm:w-[208px] w-full"></div>
      <div className="bg-zinc-900 text-left p-2 rounded-lg flex flex-row gap-2 cursor-pointer hover:bg-zinc-800 h-[60px] sm:w-[208px] w-full"></div>
    </div>
  );
};


import React from 'react';

// Assuming cryptoList is an array of objects with symbol and price properties
export const StocksSkeleton2 = ({ cryptoList }: { cryptoList: Array<{ symbol: string, price: string }> }) => {
  return (
    <div className="flex flex-col sm:flex-row text-sm gap-2 mb-4 overflow-y-scroll pb-4">
      {cryptoList.map((crypto, index) => (
        <div key={index} className="bg-zinc-900 text-left p-2 rounded-lg flex flex-row gap-2 cursor-pointer hover:bg-zinc-800 h-[60px] sm:w-[208px] w-full">
          <span>{crypto.symbol}, price is {crypto.price}</span>
        </div>
      ))}
    </div>
  );
};

export default StocksSkeleton;
