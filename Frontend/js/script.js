document.querySelector('#adicionar').addEventListener('click', (e) => {
    e.preventDefault()
    const texto = document.querySelector('#nome').value
    const texto2 = document.querySelector('#marca').value

    const conteudo = document.querySelector('#conteudo')
    const div = document.createElement('div')
    const p = document.createElement('p')
    p.textContent = `Nome: ${texto} / Marca: ${texto2}.`
    div.append(p)
    conteudo.append(div)
})