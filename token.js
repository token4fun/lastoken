async function fetchTokenData() {
    let contractAddress = document.getElementById("contractAddress").value.trim();
    if (!contractAddress) {
        alert("Por favor, insira um endereço de contrato válido!");
        return;
    }

    const apiKey = "NABPG1J8DPTD6NMNU4WZIT4GCB258666UQ"; // Insira sua chave da BSCScan
    const burnAddress = "0x000000000000000000000000000000000000dEaD"; // Endereço de queima

    try {
        // 🔹 Buscar Total Supply
        const supplyUrl = `https://api.bscscan.com/api?module=stats&action=tokensupply&contractaddress=${contractAddress}&apikey=${apiKey}`;
        
        // 🔹 Buscar Total Burned do Endereço Dead
        const burnBalanceUrl = `https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=${contractAddress}&address=${burnAddress}&apikey=${apiKey}`;

        const [supplyResponse, burnResponse] = await Promise.all([
            fetch(supplyUrl),
            fetch(burnBalanceUrl)
        ]);

        const supplyData = await supplyResponse.json();
        const burnData = await burnResponse.json();

        if (supplyData.status === "1" && burnData.status === "1") {
            const totalSupply = parseFloat(supplyData.result / 1e18); // Convertendo de WEI
            const burnedTokens = parseFloat(burnData.result / 1e18); // Convertendo de WEI
            const circulatingSupply = totalSupply - burnedTokens; // Cálculo do Supply Circulante

            document.getElementById("totalSupply").innerText = totalSupply.toLocaleString();
            document.getElementById("circulatingSupply").innerText = circulatingSupply.toLocaleString();
            document.getElementById("maxSupply").innerText = totalSupply.toLocaleString();
            document.getElementById("burnedTokens").innerText = burnedTokens.toLocaleString();

            const burnedPercentage = ((burnedTokens / totalSupply) * 100).toFixed(2);
            document.getElementById("burnedPercentage").innerText = `${burnedPercentage}%`;

            // 🔹 Buscar Preço, Market Cap e Volume 24h
            fetchGeckoData(contractAddress, totalSupply, circulatingSupply);
        }
    } catch (error) {
        console.error("Erro ao buscar Supply e Burned Tokens:", error);
    }
}

// ✅ Buscar Preço e Market Cap da CoinGecko
async function fetchGeckoData(contractAddress, totalSupply, circulatingSupply) {
    try {
        const geckoUrl = `https://api.coingecko.com/api/v3/simple/token_price/binance-smart-chain?contract_addresses=${contractAddress}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true`;

        const response = await fetch(geckoUrl);
        const data = await response.json();

        if (data[contractAddress.toLowerCase()]) {
            const tokenPrice = parseFloat(data[contractAddress.toLowerCase()].usd);
            const marketCap = (circulatingSupply * tokenPrice).toFixed(2);
            const volume24h = data[contractAddress.toLowerCase()].usd_24h_vol;

            document.getElementById("tokenPrice").innerText = `$${tokenPrice.toFixed(6)}`;
            document.getElementById("marketCap").innerText = `$${marketCap}`;
            document.getElementById("volume24h").innerText = `$${volume24h.toLocaleString()}`;
        }
    } catch (error) {
        console.error("Erro ao buscar Preço e Market Cap:", error);
    }
}
