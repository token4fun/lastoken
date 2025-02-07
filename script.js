document.addEventListener("DOMContentLoaded", () => {
  /* SPLASH MODAL: Typewriter Effect */
  const splashModal = document.getElementById("splashModal");
  const splashTextElem = document.getElementById("splash-text");
  const splashMessage = "Welcome to The Last Token\nThe final creation on Solana\nBonded to Raydium, defying Sherk";
  let charIndex = 0;
  const typeDelay = 50;
  const fadeDelay = 3000;

  function typeWriter() {
    if (charIndex < splashMessage.length) {
      if (splashMessage[charIndex] === "\n") {
        splashTextElem.innerHTML += "<br>";
      } else {
        splashTextElem.innerHTML += splashMessage.charAt(charIndex);
      }
      charIndex++;
      setTimeout(typeWriter, typeDelay);
    }
  }
  typeWriter();

  // Fade out and remove splash modal after text is finished
  setTimeout(() => {
    splashModal.style.transition = "opacity 1s ease";
    splashModal.style.opacity = "0";
    setTimeout(() => {
      splashModal.style.display = "none";
    }, 1000);
  }, splashMessage.length * typeDelay + fadeDelay);

  /* Crypto Ticker: Fetch data from Coingecko (example using Bitcoin/ETH prices as placeholder for APY info) */
  async function fetchTickerData() {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd"
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      const prices = Object.entries(data)
        .map(([key, value]) => `${key.toUpperCase()}: $${value.usd}`)
        .join(" | ");
      document.getElementById("ticker-text").innerHTML = prices;
    } catch (error) {
      document.getElementById("ticker-text").textContent = "Unable to load APY data.";
      console.error("Error fetching ticker data:", error);
    }
  }
  fetchTickerData();
  setInterval(fetchTickerData, 60000);

  /* FAQ Accordion: Only one open at a time */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      faqItems.forEach(i => i.classList.remove('active'));
      item.classList.toggle('active');
    });
  });

  /* Modal Handling (Example for Enigma Modal) */
  const enigmaElement = document.getElementById("ticker-text");
  const enigmaModal = document.getElementById("enigmaModal");
  const enigmaModalClose = document.getElementById("enigmaModalClose");
  function updateEnigmaModalText() {
    const phrases = [
      "Every block reveals a new secret...",
      "Unlock the neon mystery with $THELASTTOKEN.",
      "Defy the ordinary—embrace the final token."
    ];
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    document.getElementById("enigmaModalText").textContent = randomPhrase;
  }
  if(enigmaElement){
    enigmaElement.addEventListener("click", () => {
      enigmaModal.style.display = "block";
      updateEnigmaModalText();
    });
  }
  if(enigmaModalClose){
    enigmaModalClose.addEventListener("click", () => {
      enigmaModal.style.display = "none";
    });
  }
});
