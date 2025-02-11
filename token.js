const contractAddress = "0x893535ed1b5c6969e62a10babfed4f5ff8373278"; // CakeMoon
const burnAddress = "0x000000000000000000000000000000000000dEaD"; // Endereço de queima
const apiKey = "SUA_API_KEY_DA_BSCSCAN";  // Insira sua API Key da BSCScan
const coingeckoId = "cake-moon"; // ID do token na CoinGecko (precisa ser o correto)

// ✅ Buscar dados do token automaticamente
async function fetchTokenData() {
    try {
        // 🔹 Buscar total supply (9 decimais)
        const supplyUrl = `https://api.bscscan.com/api?module=stats&action=tokensupply&contractaddress=${contractAddress}&apikey=${apiKey}`;
        const supplyResponse = await fetch(supplyUrl);
        const supplyData = await supplyResponse.json();

        let totalSupply = 0;
        if (supplyData.status === "1") {
            totalSupply = parseFloat(supplyData.result / 1e9).toFixed(2);
            document.getElementById("totalSupply").innerText = totalSupply;
        } else {
            document.getElementById("totalSupply").innerText = "Erro ao buscar.";
        }

        // 🔹 Buscar saldo do endereço de queima
        const burnBalanceUrl = `https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=${contractAddress}&address=${burnAddress}&apikey=${apiKey}`;
        const burnBalanceResponse = await fetch(burnBalanceUrl);
        const burnBalanceData = await burnBalanceResponse.json();

        let burnedTokens = 0;
        if (burnBalanceData.status === "1") {
            burnedTokens = parseFloat(burnBalanceData.result / 1e9).toFixed(2);
            document.getElementById("burnedTokens").innerText = burnedTokens;
        } else {
            document.getElementById("burnedTokens").innerText = "Erro ao buscar.";
        }

        // 🔹 Calcular supply circulante
        const circulatingSupply = (totalSupply - burnedTokens).toFixed(2);
        document.getElementById("circulatingSupply").innerText = circulatingSupply;

        // 🔹 Buscar preço do token via CoinGecko
        fetchTokenPrice(circulatingSupply);
        
        // 🔹 Buscar holders (sem endereço de queima)
        fetchHolders();
    } catch (error) {
        console.error("Erro ao buscar dados do token:", error);
    }
}

// ✅ Buscar preço do token via CoinGecko
async function fetchTokenPrice(circulatingSupply) {
    const priceUrl = `https://api.coingecko.com/api/v3/simple/token_price/binance-smart-chain?contract_addresses=${contractAddress}&vs_currencies=usd`;

    try {
        const priceResponse = await fetch(priceUrl);
        const priceData = await priceResponse.json();

        let tokenPrice = 0;
        if (priceData[contractAddress.toLowerCase()]) {
            tokenPrice = parseFloat(priceData[contractAddress.toLowerCase()].usd);
            document.getElementById("tokenPrice").innerText = `$${tokenPrice.toFixed(6)}`;

            // 🔹 Calcular Market Cap
            const marketCap = (tokenPrice * circulatingSupply).toFixed(2);
            document.getElementById("marketCap").innerText = `$${marketCap}`;
        } else {
            document.getElementById("tokenPrice").innerText = "Preço Indisponível";
            document.getElementById("marketCap").innerText = "Market Cap Indisponível";
        }
    } catch (error) {
        console.error("Erro ao buscar preço:", error);
    }
}

// ✅ Buscar os **Top 10 Holders** (removendo a carteira de queima)
async function fetchHolders() {
    const holdersUrl = `https://api.bscscan.com/api?module=account&action=tokentx&contractaddress=${contractAddress}&sort=desc&apikey=${apiKey}`;

    try {
        const response = await fetch(holdersUrl);
        const data = await response.json();

        if (data.status === "1") {
            let transactions = data.result.filter(tx => tx.to !== burnAddress).slice(0, 10);
            let holderList = "";
            transactions.forEach(tx => {
                holderList += `<li>${tx.to.slice(0, 6)}...${tx.to.slice(-4)}: ${parseFloat(tx.value / 1e9).toFixed(2)} MOON</li>`;
            });
            document.getElementById("holderList").innerHTML = holderList;
        } else {
            document.getElementById("holderList").innerText = "Erro ao buscar holders.";
        }
    } catch (error) {
        console.error("Erro ao buscar holders:", error);
    }
}

// ✅ Atualizar dados ao carregar a página
window.onload = fetchTokenData;
