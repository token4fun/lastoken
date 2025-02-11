const contractAddress = "0x893535ed1b5c6969e62a10babfed4f5ff8373278"; // CakeMoon
const apiKey = "NABPG1J8DPTD6NMNU4WZIT4GCB258666UQ";  // Sua API Key da BSCScan

// ✅ Buscar dados do token automaticamente da BSCScan
async function fetchTokenData() {
    try {
        // ✅ Buscar total supply (9 decimais)
        const supplyUrl = `https://api.bscscan.com/api?module=stats&action=tokensupply&contractaddress=${contractAddress}&apikey=${apiKey}`;
        const supplyResponse = await fetch(supplyUrl);
        const supplyData = await supplyResponse.json();

        let totalSupply = 0;
        if (supplyData.status === "1") {
            totalSupply = parseFloat(supplyData.result / 1e9).toFixed(2);  // Convertendo de 9 decimais
            document.getElementById("totalSupply").innerText = totalSupply;
        } else {
            document.getElementById("totalSupply").innerText = "Erro ao buscar supply.";
        }

        // ✅ Buscar preço do token via BSCScan
        const priceUrl = `https://api.bscscan.com/api?module=stats&action=tokenprice&contractaddress=${contractAddress}&apikey=${apiKey}`;
        const priceResponse = await fetch(priceUrl);
        const priceData = await priceResponse.json();

        let tokenPrice = 0;
        if (priceData.status === "1" && priceData.result.ethusd) {
            tokenPrice = parseFloat(priceData.result.ethusd);
            document.getElementById("tokenPrice").innerText = `$${tokenPrice.toFixed(6)}`;
        } else {
            document.getElementById("tokenPrice").innerText = "Preço indisponível";
        }

        // ✅ Calcular Market Cap (evitar erro se preço falhar)
        if (tokenPrice > 0 && totalSupply > 0) {
            document.getElementById("marketCap").innerText = `$${(tokenPrice * totalSupply).toFixed(2)}`;
        } else {
            document.getElementById("marketCap").innerText = "Market Cap Indisponível";
        }

        // ✅ Buscar holders reais
        fetchHolders();
    } catch (error) {
        console.error("Erro ao buscar dados do token:", error);
    }
}

// ✅ Buscar os **Top 10 Holders** baseado nas últimas transações
async function fetchHolders() {
    const holdersUrl = `https://api.bscscan.com/api?module=account&action=tokentx&contractaddress=${contractAddress}&sort=desc&apikey=${apiKey}`;

    try {
        const response = await fetch(holdersUrl);
        const data = await response.json();

        if (data.status === "1") {
            const transactions = data.result.slice(0, 10);
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
