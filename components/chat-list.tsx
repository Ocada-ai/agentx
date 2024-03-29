import { Separator } from "@/components/ui/separator";

export function ChatList({ messages }: { messages: any[] }) {
  if (!messages.length) {
    return null;
  }

  return (
    <div className="lg:max-w-2xl mx-auto no-scrollbar">
      {messages.map((message, index) => (
        <div key={index} className="pb-8">
          {message.display}
        </div>
      ))}
    </div>
  );
}
