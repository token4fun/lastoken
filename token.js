const coingeckoId = "moon"; // Substitua pelo ID correto na CoinGecko

async function fetchTokenData() {
    try {
        const url = `https://api.coingecko.com/api/v3/coins/${coingeckoId}`;
        const response = await fetch(url);
        const data = await response.json();

        // 🔹 Nome e Imagem do Token
        document.getElementById("tokenName").innerText = data.name + " (" + data.symbol.toUpperCase() + ")";
        document.getElementById("tokenImage").src = data.image.large;

        // 🔹 Links Oficiais
        document.getElementById("tokenWebsite").href = data.links.homepage[0] || "#";
        document.getElementById("tokenTwitter").href = "https://twitter.com/" + data.links.twitter_screen_name || "#";
        document.getElementById("tokenTelegram").href = data.links.telegram_channel_identifier ? `https://t.me/${data.links.telegram_channel_identifier}` : "#";

        // 🔹 Preço e Market Cap
        document.getElementById("tokenPrice").innerText = `$${data.market_data.current_price.usd.toFixed(6)}`;
        document.getElementById("marketCap").innerText = `$${data.market_data.market_cap.usd.toLocaleString()}`;
        document.getElementById("volume24h").innerText = `$${data.market_data.total_volume.usd.toLocaleString()}`;

        // 🔹 Variação de Preço e Máximos/Mínimos
        document.getElementById("high24h").innerText = `$${data.market_data.high_24h.usd.toFixed(6)}`;
        document.getElementById("low24h").innerText = `$${data.market_data.low_24h.usd.toFixed(6)}`;
        document.getElementById("change24h").innerText = `${data.market_data.price_change_percentage_24h.toFixed(2)}%`;

        // 🔹 Supply Total e Circulante
        document.getElementById("totalSupply").innerText = data.market_data.total_supply.toLocaleString();
        document.getElementById("circulatingSupply").innerText = data.market_data.circulating_supply.toLocaleString();

        // 🔹 Exchanges Listadas
        fetchExchangeListings(data.tickers);
    } catch (error) {
        console.error("Erro ao buscar dados do token:", error);
    }
}

// ✅ Buscar exchanges onde o token está listado
function fetchExchangeListings(tickers) {
    let exchangeList = document.getElementById("exchangeList");
    exchangeList.innerHTML = ""; 

    tickers.slice(0, 10).forEach(ticker => {
        let listItem = document.createElement("li");
        listItem.innerHTML = `<a href="https://www.coingecko.com/en/exchanges/${ticker.market.identifier}" target="_blank">${ticker.market.name}</a>`;
        exchangeList.appendChild(listItem);
    });
}

// ✅ Atualizar dados ao carregar a página
window.onload = fetchTokenData;
