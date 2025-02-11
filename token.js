async function fetchTokenData() {
    let contractAddress = document.getElementById("contractAddress").value.trim();
    if (!contractAddress) {
        alert("Por favor, insira um endereço de contrato válido!");
        return;
    }

    resetUI(); // Limpa os dados anteriores

    const apiKey = "NABPG1J8DPTD6NMNU4WZIT4GCB258666UQ"; // Insira sua chave da BSCScan
    const burnAddress = "0x000000000000000000000000000000000000dEaD"; // Endereço de queima

    try {
        const supplyUrl = `https://api.bscscan.com/api?module=stats&action=tokensupply&contractaddress=${contractAddress}&apikey=${apiKey}`;
        const burnBalanceUrl = `https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=${contractAddress}&address=${burnAddress}&apikey=${apiKey}`;
        const holdersUrl = `https://api.bscscan.com/api?module=token&action=tokenholdercount&contractaddress=${contractAddress}&apikey=${apiKey}`;

        const [supplyResponse, burnResponse, holdersResponse] = await Promise.all([
            fetch(supplyUrl),
            fetch(burnBalanceUrl),
            fetch(holdersUrl)
        ]);

        const supplyData = await supplyResponse.json();
        const burnData = await burnResponse.json();
        const holdersData = await holdersResponse.json();

        if (supplyData.status === "1" && burnData.status === "1") {
            const totalSupply = parseFloat(supplyData.result / 1e18);
            const burnedTokens = parseFloat(burnData.result / 1e18);
            const circulatingSupply = totalSupply - burnedTokens;

            document.getElementById("totalSupply").innerText = totalSupply.toLocaleString();
            document.getElementById("circulatingSupply").innerText = circulatingSupply.toLocaleString();
            document.getElementById("maxTotalSupply").innerText = totalSupply.toLocaleString();
            document.getElementById("burnedTokens").innerText = burnedTokens.toLocaleString();

            const burnedPercentage = ((burnedTokens / totalSupply) * 100).toFixed(2);
            document.getElementById("burnedPercentage").innerText = `${burnedPercentage}%`;
        }

        if (holdersData.status === "1") {
            document.getElementById("holders").innerText = parseInt(holdersData.result).toLocaleString();
        }

        // 🔹 Buscar Preço e Market Cap
        fetchPriceData(contractAddress, circulatingSupply);
    } catch (error) {
        console.error("Erro ao buscar dados da BSCScan:", error);
    }
}

// ✅ Buscar Preço e Market Cap com fallback para CoinGecko e CoinMarketCap
async function fetchPriceData(contractAddress, circulatingSupply) {
    try {
        let priceUrl = `https://api.bscscan.com/api?module=stats&action=tokenprice&contractaddress=${contractAddress}&apikey=SUA_API_KEY_DA_BSCSCAN`;
        let response = await fetch(priceUrl);
        let data = await response.json();

        let tokenPrice = null;

        if (data.status === "1" && data.result.ethusd) {
            tokenPrice = parseFloat(data.result.ethusd);
        } else {
            console.log("Preço não encontrado na BSCScan, buscando na CoinGecko...");
            priceUrl = `https://api.coingecko.com/api/v3/simple/token_price/binance-smart-chain?contract_addresses=${contractAddress}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true`;
            response = await fetch(priceUrl);
            data = await response.json();

            if (data[contractAddress.toLowerCase()]) {
                tokenPrice = parseFloat(data[contractAddress.toLowerCase()].usd);
                const volume24h = data[contractAddress.toLowerCase()].usd_24h_vol;
                document.getElementById("volume24h").innerText = `$${volume24h.toLocaleString()}`;
            }
        }

        if (!tokenPrice) {
            console.log("Preço não encontrado na CoinGecko, buscando na CoinMarketCap...");
            priceUrl = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=TOKEN_SYMBOL&CMC_PRO_API_KEY=SUA_API_KEY_CMC`;
            response = await fetch(priceUrl);
            data = await response.json();

            if (data.data && data.data.TOKEN_SYMBOL) {
                tokenPrice = parseFloat(data.data.TOKEN_SYMBOL.quote.USD.price);
                const volume24h = data.data.TOKEN_SYMBOL.quote.USD.volume_24h;
                document.getElementById("volume24h").innerText = `$${volume24h.toLocaleString()}`;
            }
        }

        if (!tokenPrice) {
            console.log("Preço não encontrado em nenhuma API.");
            document.getElementById("tokenPrice").innerText = "N/A";
            document.getElementById("marketCap").innerText = "N/A";
            return;
        }

        document.getElementById("tokenPrice").innerText = `$${tokenPrice.toFixed(6)}`;

        if (circulatingSupply > 0) {
            const marketCap = (circulatingSupply * tokenPrice).toFixed(2);
            document.getElementById("marketCap").innerText = `$${marketCap}`;
        } else {
            document.getElementById("marketCap").innerText = "N/A";
        }
    } catch (error) {
        console.error("Erro ao buscar preço e Market Cap:", error);
        document.getElementById("tokenPrice").innerText = "N/A";
        document.getElementById("marketCap").innerText = "N/A";
    }
}

// ✅ Resetar UI antes de cada busca
function resetUI() {
    const ids = ["tokenPrice", "marketCap", "volume24h", "burnedTokens", "burnedPercentage", "totalSupply", "circulatingSupply", "maxTotalSupply", "holders"];
    ids.forEach(id => document.getElementById(id).innerText = "-");
}
