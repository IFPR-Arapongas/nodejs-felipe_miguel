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

const chuteira = document.querySelector("#chuteira");

chuteira.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nome = chuteira.elements.nome.value;
  const marca = chuteira.elements.marca.value;

  const header = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ nome: nome, marca_chuteira: marca })
  }

  const resposta = await fetch('/adicionar', header);
  const resultado = await resposta.json();

  if (resultado.auth) {
    window.location.href = '../index.html';
  } else {
    const divMensagem = document.querySelector('#mensagem');
    divMensagem.textContent = resultado.mensagem; 
    divMensagem.style.display = 'block';
  }
})