import { format, parseISO } from 'date-fns';

interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export function Events({ results }: { results: SearchResult[] }) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 overflow-scroll py-4 -mt-2">
      {results.map(result => (
        <div
          key={result.url}
          className="flex flex-col p-4 bg-zinc-900 rounded-md max-w-96 flex-shrink-0"
        >
          <div className="text-base font-bold text-zinc-200">
            {result.title}
          </div>
          <div className="text-zinc-400 text-sm">
            Score: {result.score}
          </div>
          <div className="text-zinc-500">
            {result.content.slice(0, 70)}...
          </div>
          <a href={result.url} className="text-blue-500 mt-2" target="_blank" rel="noopener noreferrer">
            Read More
          </a>
        </div>
      ))}
    </div>
  );
}
