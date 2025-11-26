document.querySelector('#adicionar').addEventListener('click', (e) => {
    e.preventDefault()
    const texto = document.querySelector('#nome').value
    const texto2 = document.querySelector('#marca').value

    const conteudo = document.querySelector('#conteudo')
    const p = document.createElement('p')
    p.textContent = `Nome: ${texto}. Marca: ${texto2}.`
    conteudo.append(p)
})