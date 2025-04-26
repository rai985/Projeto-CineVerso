// Chave de autenticação pessoal da API do TMDB e URL base para todas as requisições
const API_KEY = '41b60bb6b2c8e16b78683498a80e20ea'; 
const BASE_URL = 'https://api.themoviedb.org/3';


// Aqui é criado um objeto "generos", que associa nomes de gêneros a seus respectivos IDs, conforme definidos pela API do TMDB. Isso facilita a busca de filmes por gênero no site.
const generos = {
  acao: 28,
  comedia: 35,
  ficcao: 878,
  drama: 18,
  terror: 27,
  romance: 10749,
  documentario: 99
};

// Aqui temos uma função assíncrona, "buscarDetalhesFilme", que busca informações mais completas de um filme a partir do seu ID, incluindo a duração (runtime), que não é fornecida na lista de filmes.
async function buscarDetalhesFilme(id) {
  const url = `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=pt-BR`;
  const resposta = await fetch(url);
  return await resposta.json();
}

// A função "preencherTabela" é responsável por buscar os filmes mais populares de um determinado gênero e preencher na tabela que criamos no HTML. Ela busca até 10 filmes válidos que tenham todos os dados necessários (título, data de lançamento, sinopse, avaliação e duração).
async function preencherTabela(generoNome, generoId) {
  const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${generoId}&language=pt-BR&sort_by=popularity.desc&page=1`;
  const resposta = await fetch(url);
  const dados = await resposta.json();
  const filmes = dados.results;

  const tabela = document.getElementById(`tabela-${generoNome}`);
  if (!tabela) return;
  tabela.innerHTML = '';

  let filmesValidos = 0;
  let index = 0;

  // Este laço continua até encontrar 10 filmes com todas as informações necessárias ou até esgotar a lista de filmes retornada pela API.
  while (filmesValidos < 10 && index < filmes.length) {
    const filme = filmes[index];
    const detalhes = await buscarDetalhesFilme(filme.id);

    const possuiDadosCompletos = (
      filme.title &&
      filme.release_date &&
      filme.overview &&
      typeof filme.vote_average === 'number' &&
      detalhes.runtime
    );

    // Se o filme tiver todos os dados, ele é formatado em uma nova linha da tabela com um link no título para buscar onde assistir o filme no Google.
    if (possuiDadosCompletos) {
      const linkGoogle = `https://www.google.com/search?q=onde+assistir+${encodeURIComponent(filme.title)}`;

      const linha = document.createElement('tr');
      linha.innerHTML = `
        <td><a href="${linkGoogle}" target="_blank">${filme.title}</a></td>
        <td>${detalhes.runtime} min</td>
        <td>${filme.release_date}</td>
        <td>${filme.overview}</td>
        <td>${filme.vote_average.toFixed(1)}</td>
      `;
      tabela.appendChild(linha);
      filmesValidos++;
    }

    index++;
  }

  // Caso não encontre nenhum filme válido, exibe uma mensagem na tabela.
  if (filmesValidos === 0) {
    tabela.innerHTML = `<tr><td colspan="5">Nenhum filme com informações completas encontrado.</td></tr>`;
  }
}

// Este trecho final percorre todos os gêneros definidos no objeto "generos" e chama a função "preencherTabela" para cada um, garantindo que todas as tabelas da página sejam preenchidas automaticamente.
for (const [nome, id] of Object.entries(generos)) {
  preencherTabela(nome, id);
}
