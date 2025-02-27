let countdown = 300; // 5 minutos em segundos

async function fetchTopTokens() {
    try {
        const response = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=10&page=1&sparkline=false");
        const data = await response.json();

        const tableBody = document.getElementById("tokenTable");
        tableBody.innerHTML = ""; // Limpar a tabela antes de preencher com novos dados

        data.forEach((token, index) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>
                    <img src="${token.image}" alt="${token.name}" class="token-img"> 
                    ${token.name} (${token.symbol.toUpperCase()})
                </td>
                <td>$${formatNumber(token.total_volume * 0.001)}</td>
                <td>$${formatNumber(token.total_volume * 0.005)}</td>
                <td>$${formatNumber(token.total_volume * 0.02)}</td>
                <td>$${formatNumber(token.total_volume * 0.16)}</td>
                <td>$${formatNumber(token.total_volume)}</td>
            `;

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Erro ao buscar tokens:", error);
    }
}

// ✅ Formatar números grandes com separação de milhar
function formatNumber(num) {
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ✅ Contador regressivo para atualização dos dados
function startCountdown() {
    const countdownElement = document.getElementById("countdown");

    function updateCountdown() {
        countdownElement.innerText = countdown;
        countdown--;

        if (countdown < 0) {
            countdown = 300; // Reinicia o contador para 5 minutos
            fetchTopTokens();
        }
    }

    setInterval(updateCountdown, 1000);
}

// Iniciar contador e buscar os dados
fetchTopTokens();
startCountdown();
