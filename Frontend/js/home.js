// Referências a elementos do DOM
const formFavorito = document.querySelector("#chuteira");
const divConteudo = document.querySelector("#conteudo"); 
const divMensagem = document.querySelector("#mensagem"); 
const submitButton = formFavorito ? formFavorito.querySelector('button[type="submit"]') : null;


// --- 1. FUNÇÃO PARA ADICIONAR FAVORITO (POST /adicionar) ---
if (formFavorito) {
    formFavorito.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Mapeamento:
        // titulo_item (HTML) -> nome (Backend)
        // marca_chuteira (HTML) -> marca_chuteira (Backend)
        const modelo = formFavorito.elements.titulo_item.value.trim();
        const marca = formFavorito.elements.marca_chuteira.value.trim();

        if (!modelo || !marca) {
            // ... (feedback de validação omitido para brevidade)
            return;
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Salvando...";
        }
        divMensagem.style.display = 'none';

        try {
            // ⚠️ CRÍTICO: Usar a URL completa para o backend
            const resposta = await fetch("http://localhost:3000/adicionar", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ nome: modelo, marca_chuteira: marca })
            });

            if (resposta.ok) {
                // Sucesso (Status 201)
                divMensagem.textContent = await resposta.text();
                divMensagem.style.backgroundColor = 'lightgreen';
                divMensagem.style.display = 'block';
                formFavorito.reset();
                
                // 💡 Atualiza a lista após salvar
                await listarFavoritos(); 

            } else {
                // ... (tratamento de erro 401/500 omitido para brevidade, mas deve existir)
                const erro = await resposta.text();
                divMensagem.textContent = erro || "Erro ao salvar favorito.";
                divMensagem.style.backgroundColor = 'red';
                divMensagem.style.display = 'block';
            }
        } catch (error) {
            console.error("Erro de conexão ou fetch:", error);
            divMensagem.textContent = "Erro ao conectar com o servidor.";
            divMensagem.style.backgroundColor = 'red';
            divMensagem.style.display = 'block';
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Salvar Favorito";
            }
        }
    });
}


// --- 2. FUNÇÃO PARA LISTAR FAVORITOS (GET /favoritos) ---
async function listarFavoritos() {
    if (!divConteudo) return; 

    divConteudo.innerHTML = "<p>Carregando seus favoritos...</p>";

    try {
        const resposta = await fetch("http://localhost:3000/favoritos", {
            method: "GET",
            credentials: "include" 
        });

        if (resposta.ok) {
            const favoritos = await resposta.json();
            
            if (favoritos.length === 0) {
                divConteudo.innerHTML = "<p>Você não tem favoritos salvos. Adicione um acima! ⬆️</p>";
                return;
            }

            divConteudo.innerHTML = favoritos.map(item => `
                <div class="favorito-item">
                    <h4>${item.nome}</h4>
                    <p>Marca: ${item.marca_chuteira}</p>
                    <hr>
                </div>
            `).join('');

        } else if (resposta.status === 401) {
            divConteudo.innerHTML = "<p>🔒 Por favor, faça login para ver seus favoritos.</p>";
        } else {
            divConteudo.innerHTML = "<p>❌ Erro ao carregar a lista de favoritos.</p>";
        }

    } catch (error) {
        console.error("Erro de conexão ao buscar lista:", error);
        divConteudo.innerHTML = "<p>⚠️ Erro de conexão com o servidor.</p>";
    }
}

// --- Inicialização: Carrega a lista quando a página é carregada ---
document.addEventListener('DOMContentLoaded', listarFavoritos);