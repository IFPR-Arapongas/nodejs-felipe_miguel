document.querySelector('#adicionar').addEventListener('click', (e) => {
    e.preventDefault()
    const texto = document.querySelector('#nome').value
    const texto2 = document.querySelector('#marca').value
    const texto3 = document.querySelector('#modelo').value

    const conteudo = document.querySelector('#conteudo')
    const div = document.createElement('div')
    const p = document.createElement('p')
    p.textContent = `Nome: ${texto}. Marca: ${texto2}. Modelo: ${texto3}`
    div.append(p)
    conteudo.append(div)
})

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
    window.location.href = 'pages/clientes.html';
  } else {
    const divMensagem = document.querySelector('#mensagem');
    divMensagem.textContent = resultado.mensagem; 
    divMensagem.style.display = 'block';
  }
})

const form2 = document.querySelector("#form2");

form2.addEventListener("submit", async (event) => {
  event.preventDefault();

  const login = form2.elements.email.value;
  const password = form2.elements.password.value;

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
    window.location.href = 'pages/clientes.html';
  } else {
    const divMensagem = document.querySelector('#mensagem');
    divMensagem.textContent = resultado.mensagem; 
    divMensagem.style.display = 'block';
  }
})