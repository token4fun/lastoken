const contractAddress = "0x893535ed1b5c6969e62a10babfed4f5ff8373278"; // CakeMoon
const burnAddress = "0x000000000000000000000000000000000000dEaD"; // Endereço de queima
const apiKey = "NABPG1J8DPTD6NMNU4WZIT4GCB258666UQ";  // Insira sua API Key da BSCScan
const geckoTerminalUrl = "https://api.geckoterminal.com/api/v2/networks/bsc/pools/0x117c1dabb35ce89c7cb98a49e2355ab445366c23"; // GeckoTerminal

let countdown = 30; // Tempo de atualização

async function fetchTokenData() {
    try {
        // 🔹 Buscar dados do GeckoTerminal (Preço, Volume)
        const geckoResponse = await fetch(geckoTerminalUrl);
        const geckoData = await geckoResponse.json();

        if (geckoData.data) {
            const pool = geckoData.data.attributes;
            const tokenPriceUSD = parseFloat(pool.base_token_price_usd);
            
            document.getElementById("tokenPrice").innerText = `$${tokenPriceUSD.toFixed(6)}`;
            document.getElementById("volume24h").innerText = `$${parseFloat(pool.volume_usd.h24).toLocaleString()}`;

            // 🔹 Converter para BNB e ETH
            fetchPriceConversions(tokenPriceUSD);
        }

        // 🔹 Buscar Supply, Market Cap, Holders e Burned Tokens
        fetchBscData();
    } catch (error) {
        console.error("Erro ao buscar dados do token:", error);
    }
}

// ✅ Buscar Market Cap, Supply, Holders e Burned Tokens da BSCScan
async function fetchBscData() {
    try {
        const supplyUrl = `https://api.bscscan.com/api?module=stats&action=tokensupply&contractaddress=${contractAddress}&apikey=${apiKey}`;
        const holdersUrl = `https://api.bscscan.com/api?module=token&action=tokenholdercount&contractaddress=${contractAddress}&apikey=${apiKey}`;
        const burnBalanceUrl = `https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=${contractAddress}&address=${burnAddress}&apikey=${apiKey}`;
        
        const [supplyResponse, holdersResponse, burnResponse] = await Promise.all([
            fetch(supplyUrl),
            fetch(holdersUrl),
            fetch(burnBalanceUrl)
        ]);

        const supplyData = await supplyResponse.json();
        const holdersData = await holdersResponse.json();
        const burnData = await burnResponse.json();

        if (supplyData.status === "1") {
            const totalSupply = parseFloat(supplyData.result / 1e9);
            const burnedTokens = parseFloat(burnData.result / 1e9);
            const circulatingSupply = totalSupply - burnedTokens;

            document.getElementById("totalSupply").innerText = totalSupply.toLocaleString();
            document.getElementById("circulatingSupply").innerText = circulatingSupply.toLocaleString();
            document.getElementById("maxSupply").innerText = totalSupply.toLocaleString();
            document.getElementById("burnedTokens").innerText = burnedTokens.toLocaleString();

            const burnedPercentage = ((burnedTokens / totalSupply) * 100).toFixed(2);
            document.getElementById("burnedPercentage").innerText = `${burnedPercentage}%`;

            // 🔹 Buscar Preço para calcular Market Cap e FDV
            fetchMarketCap(totalSupply, circulatingSupply);
        }

        if (holdersData.status === "1") {
            document.getElementById("holders").innerText = parseInt(holdersData.result).toLocaleString();
        }
    } catch (error) {
        console.error("Erro ao buscar Supply, Holders e Burned Tokens:", error);
    }
}

// ✅ Contador regressivo para atualização dos dados
function startCountdown() {
    const countdownElement = document.getElementById("countdown");

    function updateCountdown() {
        countdownElement.innerText = countdown;
        countdown--;

        if (countdown < 0) {
            countdown = 30;
            fetchTokenData();
        }
    }

    setInterval(updateCountdown, 1000);
}

// Iniciar contador e buscar os dados
fetchTokenData();
startCountdown();
