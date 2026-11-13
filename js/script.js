const charactersContainer = document.getElementById("characters-container");
const loadingMessage = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");
const searchInput = document.getElementById("search-input");
const statusFilter = document.getElementById("status-filter");
const loadMoreButton = document.getElementById("load-more");

const API_URL = "https://rickandmortyapi.com/api/character";

let nextPageUrl = null;
let searchTimeout = null;

function translateStatus(status) {
  const statusTranslations = {
    Alive: "Vivo",
    Dead: "Morto",
    unknown: "Desconhecido"
  };

  return statusTranslations[status] || status;
}

function createCharacterCard(character) {

  // Cria o elemento principal do card
  const card = document.createElement("article");
  card.classList.add("character-card");

  // Cria a imagem do personagem
  const image = document.createElement("img");
  image.classList.add("character-image");
  image.src = character.image;
  image.alt = `Imagem de ${character.name}`;
  image.loading = "lazy";

  // Cria a área de informações
  const information = document.createElement("div");
  information.classList.add("character-info");

  // Cria o nome
  const name = document.createElement("h3");
  name.textContent = character.name;

  // Cria o status
  const status = document.createElement("span");
  status.classList.add("character-status");

  status.textContent = translateStatus(character.status);

  // Adiciona uma classe de acordo com o status
  if (character.status === "Dead") {
      status.classList.add("dead");
  } else if (character.status === "unknown") {
      status.classList.add("unknown");
  }

  // Cria a informação de espécie
  const species = document.createElement("p");
  species.textContent = `Espécie: ${character.species}`;

  // Cria a informação de gênero
  const gender = document.createElement("p");
  gender.textContent = `Gênero: ${character.gender}`;

  // Cria a informação de origem
  const origin = document.createElement("p");
  origin.textContent = `Origem: ${character.origin.name}`;

  // Organiza os elementos dentro do card
  information.appendChild(name);
  information.appendChild(status);
  information.appendChild(species);
  information.appendChild(gender);
  information.appendChild(origin);

  card.appendChild(image);
  card.appendChild(information);

  // Retorna o card completo
  return card;
}

function fetchCharacters(url = API_URL, append = false) {

  loadingMessage.classList.remove("hidden");
  errorMessage.classList.add("hidden");
  loadMoreButton.classList.add("hidden");

  // Evita apagar os cards quando carregar mais personagens
  if (!append) {
      charactersContainer.innerHTML = "";
  }

  fetch(url)
    .then(response => {

        // Verifica se a resposta foi bem-sucedida
        if (!response.ok) {
            throw new Error("Nenhum personagem encontrado.");
        }

        return response.json();
    })

    .then(data => {

        // Percorre os personagens recebidos da API
        data.results.forEach(character => {

            // Cria um card para cada personagem
            const card = createCharacterCard(character);

            // Adiciona o card ao HTML
            charactersContainer.appendChild(card);
        });

        // Guarda o endereço da próxima página
        nextPageUrl = data.info.next;

        // Mostra o botão se existirem mais personagens
        if (nextPageUrl) {
            loadMoreButton.classList.remove("hidden");
        }

        loadingMessage.classList.add("hidden");
    })

    .catch(error => {

      loadingMessage.classList.add("hidden");

      if (!append) {
        charactersContainer.innerHTML = "";

        errorMessage.textContent =
          error.message === "Nenhum personagem encontrado."
            ? "Nenhum personagem encontrado. Tente outra pesquisa."
            : "Não foi possível carregar os personagens. Verifique sua conexão.";

        errorMessage.classList.remove("hidden");
      }

    console.error("Erro ao consumir a API:", error);
  });
}

function searchCharacters() {

  const name = searchInput.value.trim();
  const status = statusFilter.value;

  // Monta os parâmetros da pesquisa
  const parameters = new URLSearchParams();

  if (name) {
    parameters.append("name", name);
  }

  if (status) {
    parameters.append("status", status);
  }

  const query = parameters.toString();

  // Monta o endereço final da API
  const url = query
    ? `${API_URL}/?${query}`
    : API_URL;

  // Realiza uma nova pesquisa
  nextPageUrl = null;
  fetchCharacters(url);
}

searchInput.addEventListener("input", () => {

  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {
    searchCharacters();
  }, 400);

});

statusFilter.addEventListener("change", () => {
  searchCharacters();
});

loadMoreButton.addEventListener("click", () => {

  if (nextPageUrl) {
    fetchCharacters(nextPageUrl, true);
  }

});

fetchCharacters();