const DADOS_BUSCA = [
  { nome: 'Cadastrar ONG', tipo: 'Página', url: 'missaoOng.html' },
  { nome: 'Cadastrar Usuário', tipo: 'Página', url: 'cadastroUsuario.html' },
  { nome: 'Fazer Login', tipo: 'Página', url: 'login.html' },
  { nome: 'Doações', tipo: 'Página', url: 'detalheDoacao.html' },
  { nome: 'Saúde', tipo: 'Categoria', url: 'categorias.html?cat=saude' },
  { nome: 'Crianças', tipo: 'Categoria', url: 'categorias.html?cat=crianca' },
  { nome: 'Idosos', tipo: 'Categoria', url: 'categorias.html?cat=idoso' },
  { nome: 'Animais', tipo: 'Categoria', url: 'categorias.html?cat=animal' },
  { nome: 'Região Norte', tipo: 'Região', url: 'regioes.html?regiao=Norte' },
  { nome: 'Região Nordeste', tipo: 'Região', url: 'regioes.html?regiao=Nordeste' },
  { nome: 'Região Centro-Oeste', tipo: 'Região', url: 'regioes.html?regiao=Centro-Oeste' },
  { nome: 'Região Sudeste', tipo: 'Região', url: 'regioes.html?regiao=Sudeste' },
  { nome: 'Região Sul', tipo: 'Região', url: 'regioes.html?regiao=Sul' },
  { nome: 'Projetos Urgentes', tipo: 'Urgente', url: 'projetosUrgentes.html' },
  { nome: 'Urgentes - Perigo Imediato (🔴)', tipo: 'Urgente', url: 'projetosUrgentes.html?nivel=perigo-imediato' },
  { nome: 'Urgentes - Perigo (🟠)', tipo: 'Urgente', url: 'projetosUrgentes.html?nivel=perigo' },
  { nome: 'Urgentes - Atenção (🟡)', tipo: 'Urgente', url: 'projetosUrgentes.html?nivel=atencao' }
];

document.addEventListener('DOMContentLoaded', () => {
  const inputBusca = document.getElementById('input-busca');
  const listaSugestoes = document.getElementById('lista-sugestoes');
  if (!inputBusca || !listaSugestoes) return;
  inputBusca.addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase().trim();
    listaSugestoes.innerHTML = '';
    if (termo === '') {
      listaSugestoes.style.display = 'none';
      return;
    }
    const resultados = DADOS_BUSCA.filter(item => 
      item.nome.toLowerCase().includes(termo) ||
      item.tipo.toLowerCase().includes(termo)
    );
    if (resultados.length > 0) {
      resultados.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<span>🕒 ${item.nome}</span> <small style="color: #666; float: right;">(${item.tipo})</small>`;
        li.style.cursor = 'pointer';
        li.onclick = () => {
          window.location.href = item.url;
        };
        listaSugestoes.appendChild(li);
      });
      listaSugestoes.style.display = 'block';
    } else {
      listaSugestoes.innerHTML = '<li style="padding: 10px; color: #888;">Nenhum resultado encontrado</li>';
      listaSugestoes.style.display = 'block';
    }
  });
  inputBusca.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const termo = inputBusca.value.toLowerCase().trim();
      if (termo.includes('urgente')) {
        window.location.href = 'projetosUrgentes.html';
      } else if (termo.includes('saude') || termo.includes('crianca') || termo.includes('idoso') || termo.includes('animal')) {
        window.location.href = `categorias.html?cat=${termo}`;
      } else {
        window.location.href = `paginaEntrada.html?busca=${encodeURIComponent(termo)}`;
      }
    }
  });
  document.addEventListener('click', (e) => {
    if (!inputBusca.contains(e.target) && !listaSugestoes.contains(e.target)) {
      listaSugestoes.style.display = 'none';
    }
  });
});
