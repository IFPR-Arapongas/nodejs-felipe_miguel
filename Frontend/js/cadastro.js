const form2 = document.querySelector("#form2");

form2.addEventListener("submit", async (event) => {
  event.preventDefault();

  const login = form2.elements.email.value;
  const password = form2.elements.password.value;

  const resposta = await fetch('http://localhost:3000/cadastro', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', //
  body: JSON.stringify({ email: login, password: password })
});
  const resultado = await resposta.json();

  if (resultado.auth) {
    window.location.href = '../index.html';
  } else {
    const divMensagem = document.querySelector('#mensagem');
    divMensagem.textContent = resultado.mensagem; 
    divMensagem.style.display = 'block';
  }
})