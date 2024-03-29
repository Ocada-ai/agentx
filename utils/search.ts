interface SearchResponse {
    answer: string;
    query: string;
    response_time: string;
    follow_up_questions: string[];
    images: string[];
    results: SearchResult[];
}

interface SearchResult {
    title: string;
    url: string;
    content: string;
    raw_content: string;
    score: string;
}

export default async function searchTavily( query: string): Promise<SearchResponse> {
    const url = "https://api.tavily.com/search";
    const requestBody = {
        api_key: process.env.TAVILY_API_KEY,
        query
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch data from Tavily Search API: ${response.statusText}`);
    }

    const responseData = await response.json() as SearchResponse;
    console.log("Search results:", responseData);
    return responseData;
}

