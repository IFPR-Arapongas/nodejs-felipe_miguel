const form1 = document.querySelector("#form1");

form1.addEventListener("submit", async (event) => {
  event.preventDefault();

  const login = form1.elements.email.value;
  const password = form1.elements.password.value;

  const header = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: login, password: password })
  }

  const resposta = await fetch('/login', header);
  const resultado = await resposta.json();

  if (resultado.auth) {
    window.location.href = '../index.html';
  } else {
    const divMensagem = document.querySelector('#mensagem');
    divMensagem.textContent = resultado.mensagem; 
    divMensagem.style.display = 'block';
  }
})

form1.addEventListener("submit", async (event) => {
  event.preventDefault();

  const login = form1.elements.email.value;
  const password = form1.elements.password.value;

  const header = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: login, senha: password })
  }

  const resposta = await fetch('/login', header);
  const resultado = await resposta.json();

  if (resultado.auth) {
    window.location.href = '../index.html';
  }
})