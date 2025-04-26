  // ------------------------------------------------------------------------------------------------------------------------------------
  //       Código temporário, apenas para teste. A implementação do chatbot e a integração com a API Open Trivia DB ainda será realizada. 
  // ------------------------------------------------------------------------------------------------------------------------------------
  
  const quizData = [
    {
      pergunta: "Qual é o nome verdadeiro do Batman?",
      opcoes: ["Clark Kent", "Tony Stark", "Bruce Wayne", "Peter Parker"],
      resposta: "Bruce Wayne"
    },
    {
      pergunta: "Em qual série encontramos o personagem Eleven?",
      opcoes: ["Dark", "Stranger Things", "The 100", "The Boys"],
      resposta: "Stranger Things"
    },
    {
      pergunta: "Qual desses filmes ganhou o Oscar de Melhor Filme em 2020?",
      opcoes: ["1917", "Parasita", "Joker", "Era Uma Vez em... Hollywood"],
      resposta: "Parasita"
    }
  ];
  
  let perguntaAtual = 0;
  let pontuacao = 0;
  
  const perguntaEl = document.getElementById("pergunta");
  const opcoesEl = document.getElementById("opcoes");
  const feedbackEl = document.getElementById("feedback");
  const proximaBtn = document.getElementById("proxima");
  const resultadoEl = document.getElementById("resultado");
  
  function carregarPergunta() {
    const atual = quizData[perguntaAtual];
    perguntaEl.textContent = atual.pergunta;
    opcoesEl.innerHTML = "";
    feedbackEl.textContent = "";
    proximaBtn.style.display = "none";
  
    atual.opcoes.forEach(opcao => {
      const li = document.createElement("li");
      li.textContent = opcao;
      li.onclick = () => verificarResposta(opcao);
      opcoesEl.appendChild(li);
    });
  }
  
  function verificarResposta(opcaoSelecionada) {
    const correta = quizData[perguntaAtual].resposta;
    if (opcaoSelecionada === correta) {
      feedbackEl.textContent = "Resposta correta!";
      pontuacao++;
    } else {
      feedbackEl.textContent = `Resposta errada! Resposta certa: ${correta}`;
    }
    // Bloqueia cliques após resposta
    Array.from(opcoesEl.children).forEach(li => li.onclick = null);
    proximaBtn.style.display = "inline";
  }
  
  proximaBtn.onclick = () => {
    perguntaAtual++;
    if (perguntaAtual < quizData.length) {
      carregarPergunta();
    } else {
      mostrarResultado();
    }
  };
  
  function mostrarResultado() {
    perguntaEl.textContent = "Fim do Quiz!";
    opcoesEl.innerHTML = "";
    feedbackEl.textContent = "";
    proximaBtn.style.display = "none";
    resultadoEl.innerHTML = `Você acertou <strong>${pontuacao}</strong> de <strong>${quizData.length}</strong> perguntas!`;
  }
  
  // Inicializa o quiz quando a página carrega
  carregarPergunta();

