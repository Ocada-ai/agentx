export const cryptoPrice = async (name: String) => {
    const vsCurrency = "USD";
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${name}&vs_currencies=${vsCurrency}`
    const response = await fetch(url)
    const data = await response.json()
    const currentPrice = data[name.toLowerCase()]?.[vsCurrency.toLowerCase()]
    console.log(`Current Holding here: ${currentPrice}`)
	return currentPrice;

}

