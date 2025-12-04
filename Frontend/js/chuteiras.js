const chuteira = document.querySelector("#form2");

chuteira.addEventListener("submit", async (event) => {
  event.preventDefault();

  const login = chuteira.elements.email.value;
  const password = chuteira.elements.password.value;

  const header = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: login, password: password })
  }

  const resposta = await fetch('/cadastro', header);
  const resultado = await resposta.json();

  if (resultado.auth) {
    window.location.href = '../index.html';
  } else {
    const divMensagem = document.querySelector('#mensagem');
    divMensagem.textContent = resultado.mensagem; 
    divMensagem.style.display = 'block';
  }
})