import { Button } from "@/components/ui/button";
import { ExternalLink } from "@/components/external-link";
import { IconArrowRight } from "@/components/ui/icons";

const exampleMessages = [
  {
    heading: "What are the trending tokens?",
    message: "What are the trending tokens?",
  },
  {
    heading: "What's the stock price of AAPL?",
    message: "What's the stock price of AAPL?",
  },
  {
    heading: "I'd like to buy 10 shares of MSFT",
    message: "I'd like to buy 10 shares of MSFT",
  },
];

export function EmptyScreen({
  submitMessage,
}: {
  submitMessage: (message: string) => void;
}) {
  return (
    <div className="w-full lg:max-w-3xl mx-auto px-4">
      <div className="py-16">
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-semibold text-type-600 text-opacity-80">
            Welcome to{" "}
            <span className="text-theme-500 font-bold text-opacity-100">
              OCADA
            </span>{" "}
            AI Agent!
          </h1>
          <p className="font-normal text-sm leading-normal text-type-600 text-opacity-50">
            You can start a conversation here or try the following examples:
          </p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(198px,1fr))] grid-flow-row auto-rows-fr gap-3 items-start min-h-40">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="bg-[#1a1a1a] border-[0.5px] border-[#292929] shadow-[0_2px_4px_0_#0000001a] h-full px-5 text-sm font-normal py-4 rounded-xl mt-0 text-left flex-col items-start justify-between hover:no-underline text-type-600 text-opacity-60"
              onClick={async () => {
                submitMessage(message.message);
              }}
            >
              {message.heading}
              <span className="w-full flex items-center justify-end">
                <i className="size-9 rounded-full flex justify-center items-center bg-[#171717] text-type-600">
                  <IconArrowRight className="text-muted-foreground" />
                </i>
              </span>
            </Button>
          ))}
        </div>
      </div>
      {/* <p className="leading-normal text-muted-foreground text-[0.8rem] text-center max-w-96 ml-auto mr-auto">
        Note: Data and latency are simulated for illustrative purposes and
        should not be considered as financial advice.
      </p> */}
    </div>
  );
}
