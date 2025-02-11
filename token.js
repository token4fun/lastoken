const contractAddress = "0x893535ed1b5c6969e62a10babfed4f5ff8373278"; // CakeMoon
const apiKey = "NABPG1J8DPTD6NMNU4WZIT4GCB258666UQ";  // Insira sua API Key da BSCScan
const geckoTerminalUrl = "https://api.geckoterminal.com/api/v2/networks/bsc/pools/0x117c1dabb35ce89c7cb98a49e2355ab445366c23"; // GeckoTerminal

async function fetchTokenData() {
    try {
        // 🔹 Buscar dados do GeckoTerminal
        const geckoResponse = await fetch(geckoTerminalUrl);
        const geckoData = await geckoResponse.json();

        if (geckoData.data) {
            const pool = geckoData.data.attributes;
            document.getElementById("volume24h").innerText = `$${parseFloat(pool.volume_usd.h24).toLocaleString()}`;
        }

        // 🔹 Buscar Supply, Market Cap e Holders
        fetchBscData();
    } catch (error) {
        console.error("Erro ao buscar dados do token:", error);
    }
}

// ✅ Buscar Market Cap, Supply e Holders da BSCScan
async function fetchBscData() {
    try {
        const supplyUrl = `https://api.bscscan.com/api?module=stats&action=tokensupply&contractaddress=${contractAddress}&apikey=${apiKey}`;
        const holdersUrl = `https://api.bscscan.com/api?module=token&action=tokenholdercount&contractaddress=${contractAddress}&apikey=${apiKey}`;
        
        const [supplyResponse, holdersResponse] = await Promise.all([
            fetch(supplyUrl),
            fetch(holdersUrl)
        ]);

        const supplyData = await supplyResponse.json();
        const holdersData = await holdersResponse.json();

        if (supplyData.status === "1") {
            const totalSupply = parseFloat(supplyData.result / 1e9);
            const circulatingSupply = totalSupply * 0.9; // Exemplo de cálculo do circulating supply

            document.getElementById("totalSupply").innerText = totalSupply.toLocaleString();
            document.getElementById("circulatingSupply").innerText = circulatingSupply.toLocaleString();
            document.getElementById("maxSupply").innerText = totalSupply.toLocaleString(); // Se não há max supply, usa o total

            // 🔹 Buscar Preço para calcular Market Cap e FDV
            fetchMarketCap(totalSupply, circulatingSupply);
        }

        if (holdersData.status === "1") {
            document.getElementById("holders").innerText = parseInt(holdersData.result).toLocaleString();
        }
    } catch (error) {
        console.error("Erro ao buscar Supply e Holders:", error);
    }
}

// ✅ Buscar Market Cap e FDV (Fully Diluted Valuation)
async function fetchMarketCap(totalSupply, circulatingSupply) {
    try {
        const priceUrl = `https://api.geckoterminal.com/api/v2/networks/bsc/pools/0x117c1dabb35ce89c7cb98a49e2355ab445366c23`;
        const priceResponse = await fetch(priceUrl);
        const priceData = await priceResponse.json();

        if (priceData.data) {
            const tokenPrice = parseFloat(priceData.data.attributes.base_token_price_usd);
            const marketCap = (circulatingSupply * tokenPrice).toFixed(2);
            const fdv = (totalSupply * tokenPrice).toFixed(2);

            document.getElementById("marketCap").innerText = `$${marketCap}`;
            document.getElementById("fdv").innerText = `$${fdv}`;
        }
    } catch (error) {
        console.error("Erro ao buscar Market Cap e FDV:", error);
    }
}

// Atualizar dados a cada 30 segundos
fetchTokenData();
setInterval(fetchTokenData, 30000);
