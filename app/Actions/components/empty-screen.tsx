import { IconArrowRight } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"

interface EmptyScreenProps {
  submitMessage: (message: string) => Promise<void>
}

export function EmptySwapScreen({ submitMessage }: EmptyScreenProps) {
  const exampleMessages = [
    {
      heading: "Swap 10 SOL to USDC",
      message: "I want to swap 10 SOL to USDC"
    },
    {
      heading: "Exchange 100 USDT for SOL",
      message: "Can you help me exchange 100 USDT for SOL?"
    },
    {
      heading: "Best rate for BONK to USDC",
      message: "What's the best rate for swapping BONK to USDC right now?"
    }
  ]

  return (
    <div className="w-full lg:max-w-3xl mx-auto px-4">
      <div className="py-16 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="jupiter-animation absolute inset-0 opacity-10"></div>
        </div>
        <div className="relative z-10">
          <div className="mb-6 text-center">
            <div className="inline-block">
              <img src="/jupiter-swap.gif" alt="Jupiter Swap" className="w-24 h-24 mx-auto mb-4 bg-transparent" />
            </div>
            <h1 className="mb-2 text-4xl font-bold text-type-600 text-opacity-80">
              Welcome to{" "}
              <span className="text-theme-500 font-bold text-opacity-100">
                OCADA
              </span>{" "}
              Swap Agent!
            </h1>
            <p className="font-normal text-lg leading-relaxed text-type-600 text-opacity-50">
              Powered by Jupiter: The Key Liquidity Aggregator for Solana
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch min-h-40">
            {exampleMessages.map((example, index) => (
              <Button
                key={index}
                variant="link"
                className="bg-[#1a1a1a] border-[0.5px] border-[#292929] shadow-[0_2px_4px_0_#0000001a] h-full px-5 py-6 rounded-xl text-left flex flex-col items-start justify-between hover:no-underline text-type-600 text-opacity-60 transition-all duration-300 hover:scale-105 hover:bg-[#242424]"
                onClick={() => submitMessage(example.message)}
              >
                <span className="text-lg font-semibold mb-2">{example.heading}</span>
                <span className="w-full flex items-center justify-end mt-4">
                  <i className="size-10 rounded-full flex justify-center items-center bg-[#171717] text-type-600">
                    <IconArrowRight className="text-type-600 opacity-60" />
                  </i>
                </span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

