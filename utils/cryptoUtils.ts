export const cryptoPrice = async (name: String) => {
    const vsCurrency = "USD";
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${name}&vs_currencies=${vsCurrency}`
    const response = await fetch(url)
    const data = await response.json()
    const currentPrice = data[name.toLowerCase()]?.[vsCurrency.toLowerCase()]
    console.log(`Current Holding here: ${currentPrice}`)
	return currentPrice;

}

export const trendingCrypto = async (): Promise<{ symbol: string; price: string }[]> => {
    const url = 'https://api.coingecko.com/api/v3/search/trending';
    const response = await fetch(url);
    const data = await response.json();

    const trendingTokens = data.coins.map((coin: any) => {
        const name: string = coin.item.name;
        const rawPrice = coin.item.data.price.toString(); // Convert to string
        const price: number = parseFloat(rawPrice.replace(/[^0-9.]/g, ""));
        const roundedPrice: string = price.toFixed(6); // Adjust the number of decimal places as needed

        const priceChangePercentage: number = coin.item.data.price_change_percentage_24h.usd.toFixed(2);

        console.log(name, roundedPrice, priceChangePercentage);
        
        return { name, price: roundedPrice, priceChangePercentage };
    }).slice(0, 5); // Slice to get only the first 5 tokens

    return trendingTokens; 
};


export const cryptoHistoricalData = async (name: String) => {
    // const timestamp24hAgo = Date.now() - 24 * 60 * 60 * 1000;
    // const url = `https://coingecko.p.rapidapi.com/coins/${name}/history?date=08-03-2024`;
    // const response = await fetch(url);
    // console.log('crypto historical data')
    // console.log(response)
    // // return response.data.prices;

    // const url = 'https://api.coingecko.com/api/v3/coins/Ethereum/history?date=08-03-2024';
    // const options = {
    //     method: 'GET',
    //     headers: {
    //         'X-RapidAPI-Key': 'd2fa07070dmsh6bf9c4cc978655dp1fb325jsnc7f61370fdc2',
    //         'X-RapidAPI-Host': 'coingecko.p.rapidapi.com'
    //     }
    // };

    // try {
    //     const response = await fetch(url, options);
    //     const result = await response.text();
    //     console.log('cryptoUtils');
    //     console.log(result);
    // } catch (error) {
    //     console.error(error);
    // }
  };