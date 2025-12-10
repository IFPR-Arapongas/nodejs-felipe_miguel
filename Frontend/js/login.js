const form1 = document.querySelector("#form1");
const divMensagem = document.querySelector("#mensagem");

form1.addEventListener("submit", async (event) => {
  event.preventDefault();

  const login = form1.elements.email.value.trim();
  const password = form1.elements.password.value.trim();

  // Validação simples
  if (!login || !password) {
    divMensagem.textContent = "Preencha todos os campos.";
    divMensagem.style.display = "block";
    return;
  }

  try {
    const resposta = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // IMPORTANTE para cookies
      body: JSON.stringify({ email: login, password }),
    });

    const resultado = await resposta.json();

    if (resultado.auth) {
      window.location.href = "../index.html";
    } else {
      divMensagem.textContent = resultado.mensagem || "Erro ao tentar fazer login.";
      divMensagem.style.display = "block";
    }
  } catch (error) {
    console.error("Erro na requisição:", error);

    divMensagem.textContent = "Erro ao conectar com o servidor.";
    divMensagem.style.display = "block";
  }
});

