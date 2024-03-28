import { format, parseISO } from "date-fns";

interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export function Events({ results }: { results: SearchResult[] }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 overflow-scroll py-4 mt-2 no-scrollbar">
      {results.map((result) => (
        <div
          key={result.url}
          className="flex flex-col items-start gap-2 p-4 bg-[#1a1a1a] rounded-md max-w-96 flex-shrink-0 no-scrollbar"
        >
          <div className="text-base font-semibold text-zinc-200">
            {result.title}
          </div>
          <div className="text-xs bg-theme-500 text-theme-700 bg-opacity-10 py-1 px-3 rounded-full font-semibold">
            Score: {result.score}
          </div>
          <div className="text-zinc-600 no-scrollbar">
            {result.content.slice(0, 70)}...
          </div>
          <a
            href={result.url}
            className="text-zinc-500 text-sm font-base font-gabarito border-b border-zinc-500 border-dotted border-opacity-40 mt-auto"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read More
          </a>
        </div>
      ))}
    </div>
  );
}
