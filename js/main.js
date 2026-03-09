const selectGenero = document.getElementById("genero");

function gerarTratamento(genero) {
    if (genero === "masculino") {
        return {
            saudacao: "Ao Sr.",
            vocativo: "Prezado Associado,",
            pronome: "notificá-lo"
        }
    } else if (genero === "feminino") {
        return {
            saudacao: "À Sra.",
            vocativo: "Prezada Associada,",
            pronome: "notificá-la"
        }
    }
}

selectGenero.addEventListener("change", function() {
    const tratamento = gerarTratamento(this.value);
    console.log(tratamento);
});

const btnGerar = document.getElementById("btnGerarDocumento");

function coletarDadosFormulario() {
    return {
        genero: document.getElementById("genero").value,
        nome: document.getElementById("nome").value,
        cep: document.getElementById("cep").value,
        rua: document.getElementById("rua").value,
        numero: document.getElementById("numero").value,
        complemento: document.getElementById("complemento").value,
        bairro: document.getElementById("bairro").value,
        cidade: document.getElementById("cidade").value,
        estado: document.getElementById("estado").value,
        dataFiliacao: document.getElementById("dataFiliacao").value,
        prazo: document.getElementById("prazo").value || 10,
        valorTotal: document.getElementById('valorTotal').value,
        competencias: competenciasEmAtraso
    }
}


let competenciasEmAtraso = [];

const btnAdicionar = document.getElementById("btnAdicionarCompetencia");
const listaCompetencias = document.getElementById("listaCompetencias");

btnAdicionar.addEventListener("click", function() {

    const ano = Number(document.getElementById("anoCompetencia").value);
    const valorBase = Number(document.getElementById("valorMensalidade").value);

    if (!ano || !valorBase) return;

    const tabelaContainer = document.getElementById("tabelaContainer");

    function calcularValorAtualizado(mes, ano) {

        const hoje = new Date();
        const vencimento = new Date(ano, mes - 1, 10);

        if (hoje <= vencimento) return valorBase;

        let mesesAtraso =
            (hoje.getFullYear() - vencimento.getFullYear()) * 12 +
            (hoje.getMonth() - vencimento.getMonth());

        /*if (hoje.getDate() < 10) mesesAtraso--;*/

        if (mesesAtraso < 0) mesesAtraso = 0;

        const multa = valorBase * 0.02;
        const juros = valorBase * 0.01 * mesesAtraso;

        return valorBase + multa + juros;
    }

    let tabela = `
            <table class="tabela-meses">
            <thead>
                <tr>
                    <th>
                        <input type="checkbox" id="checkTodosMeses">
                    </th>
                    <th>Mês</th>
                    <th>Valor Atualizado</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (let i = 1; i <= 12; i++) {

        const valorAtualizado = calcularValorAtualizado(i, ano);

        tabela += `
            <tr>
                <td>
                    <input type="checkbox"
                           class="mesCheck"
                           data-mes="${i}"
                           data-ano="${ano}"
                           data-valor="${valorAtualizado}">
                </td>
                <td>${nomeMes(i)}</td>
                <td>R$ ${valorAtualizado.toFixed(2)}</td>
            </tr>
        `;
    }

    tabela += `
            </tbody>
        </table>
    `;

    tabelaContainer.innerHTML = tabela;

    const checkTodos = document.getElementById("checkTodosMeses");

    checkTodos.addEventListener("change", function () {

    const todosMeses = document.querySelectorAll(".mesCheck");

    todosMeses.forEach(cb => {
        cb.checked = this.checked;
    });

});
});


//Btn função gravar
const btnGravar = document.getElementById("btnGravar");

btnGravar.addEventListener("click", function() {

    const checkboxes = document.querySelectorAll(".mesCheck:checked");

    checkboxes.forEach(cb => {

        const mes = Number(cb.dataset.mes);
        const ano = Number(cb.dataset.ano);
        const valor = Number(cb.dataset.valor);

        const jaExiste = competenciasEmAtraso.some(item =>
            item.mes === mes && item.ano === ano
        );

        if (!jaExiste) {
            competenciasEmAtraso.push({
                mes: mes,
                ano: ano,
                valor: valor
            });
        }
    });

    renderizarCompetencias();
    atualizarValorTotal();
});


function renderizarCompetencias() {

    listaCompetencias.innerHTML = "";

    competenciasEmAtraso.forEach((item, index) => {

        const div = document.createElement("div");
        div.classList.add("competencia-item");

        div.innerHTML = `
            ${nomeMes(item.mes)} / ${item.ano} 
            - R$ ${item.valor.toFixed(2)}
            <button type="button" onclick="removerCompetencia(${index})">
                Remover
            </button>
        `;

        listaCompetencias.appendChild(div);
    });

     // 🔹 Controle do toggle FORA do loop
    const toggleContainer = document.getElementById("toggleListaContainer");
    const toggleLista = document.getElementById("toggleLista");

    if (competenciasEmAtraso.length > 0) {

        toggleContainer.style.display = "block";

        toggleLista.checked = false;
        listaCompetencias.style.display = "none";

    } else {

        toggleContainer.style.display = "none";
        listaCompetencias.style.display = "none";

    }
}

function nomeMes(numero) {
    const meses = [
        "janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ]

    return meses[numero - 1]
}

function removerCompetencia(index) {
    competenciasEmAtraso.splice(index, 1);
    renderizarCompetencias();
    atualizarValorTotal();
}

function ordenarCompetencias(lista) {
    return lista.sort((a, b) => {
        if (a.ano !== b.ano) {
            return a.ano - b.ano
        }
        return a.mes - b.mes
    })
}

function agruparPorAno(lista) {
    const grupos = {}

    lista.forEach(item => {
        if (!grupos[item.ano]) {
            grupos[item.ano] = []
        }
        grupos[item.ano].push(Number(item.mes))
    })

    return grupos
}

function agruparSequencias(meses) {
    meses.sort((a, b) => a - b)

    const resultado = []
    let inicio = meses[0]
    let fim = meses[0]

    for (let i = 1; i < meses.length; i++) {
        if (meses[i] === fim + 1) {
            fim = meses[i]
        } else {
            resultado.push({inicio, fim})
            inicio = meses[i]
            fim = meses[i]
        }
    }

    resultado.push({inicio, fim})

    return resultado
}


function formatarLista(lista) {
    if (!lista || lista.length === 0) return "";

    if (lista.length === 1) {
        return lista[0];
    }

    if (lista.length === 2) {
        return lista[0] + " e " + lista[1];
    }

    return lista.slice(0, -1).join(", ") + " e " + lista[lista.length - 1];
}


function montarTextoCompetencias() {

    if (competenciasEmAtraso.length === 0) return ""

    const ordenado = ordenarCompetencias([...competenciasEmAtraso])
    const grupos = agruparPorAno(ordenado)

    const partes = []

    Object.keys(grupos).forEach(ano => {

        const sequencias = agruparSequencias(grupos[ano])

        const textoMeses = sequencias.map(seq => {
            if (seq.inicio === seq.fim) {
                return nomeMes(seq.inicio)
            } else {
                return `${nomeMes(seq.inicio)} a ${nomeMes(seq.fim)}`
            }
        })

        partes.push(`${formatarLista(textoMeses)} de ${ano}`)
    });
    return partes.join(", ")
}


/*botão limpar lista*/
const btnLimpar = document.getElementById("btnLimparCompetencias");

btnLimpar.addEventListener("click", function() {

    if (competenciasEmAtraso.length === 0) return;

    const confirmar = confirm("Deseja realmente limpar todas as competências adicionadas?");

    if (confirmar) {
        competenciasEmAtraso = [];
        renderizarCompetencias();
    }
});

/*Formatar data atual*/
function formatarDataExtenso(data = new Date()) {

    const meses = [
        "janeiro", "fevereiro", "março", "abril", "maio", "junho",
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ];

    const dia = data.getDate();
    const mes = meses[data.getMonth()];
    const ano = data.getFullYear();

    return `Recife, ${dia} de ${mes} de ${ano}.`;
}


/*Escreve valores reais por extenso*/
function numeroParaExtenso(valor) {

    const unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
    const especiais = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
    const dezenas = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
    const centenas = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

    function converterNumero(n) {
        if (n === 0) return "zero";
        if (n === 100) return "cem";

        let texto = "";

        if (n >= 100) {
            texto += centenas[Math.floor(n / 100)];
            n %= 100;
            if (n > 0) texto += " e ";
        }

        if (n >= 10 && n < 20) {
            texto += especiais[n - 10];
            return texto.trim();
        }

        if (n >= 20) {
            texto += dezenas[Math.floor(n / 10)];
            n %= 10;
            if (n > 0) {
                texto += " e ";
            }
        }

        if (n > 0) {
            texto += unidades[n];
        }

        return texto.trim();
    }

    const partes = valor.toFixed(2).split(".");
    const inteiro = parseInt(partes[0]);
    const centavos = parseInt(partes[1]);

    let resultado = "";

    if (inteiro >= 1000) {
        const milhares = Math.floor(inteiro / 1000);
        const resto = inteiro % 1000;
        
        resultado += (milhares === 1 ? "mil" : converterNumero(milhares) + " mil");

        if (resto > 0) {
            // Regra do "e": se o resto for uma centena exata (100, 200...) 
            // ou se o resto for menor que 100 (ex: 1005 -> mil e cinco)
            if (resto % 100 === 0 || resto < 100) {
                resultado += " e " + converterNumero(resto);
            } else {
                resultado += " " + converterNumero(resto);
            }
        }
    } else {
        resultado += converterNumero(inteiro);
    }

    resultado += inteiro === 1 ? " real" : " reais";

    if (centavos > 0) {
        resultado += " e " + converterNumero(centavos);
        resultado += centavos === 1 ? " centavo" : " centavos";
    }

    return resultado;
}


/*Função Gerar notificação*/
function gerarNotificacao(dados) {

    const tratamento = gerarTratamento(dados.genero);
    const dataAtual = formatarDataExtenso();
    const valorExtenso = numeroParaExtenso(Number(dados.valorTotal));

    return `
        <div class="notificacao">

            <div class="notificacao__cabecalho">
                <img src="assets/logo.png" alt="Logo ADUSEPS">
            </div>

            <div class="notificacao__titulo">
                <p><strong>NOTIFICAÇÃO EXTRAJUDICIAL DE COBRANÇA</strong></p>
            </div>

            <div class="notificacao__data">
                <p>${dataAtual}</p>
            </div>

            <div class="notificacao__endereco">
                <p>${tratamento.saudacao} ${formatarNome(dados.nome)}</p>
                <p>${formatarNome(dados.rua)}, nº ${dados.numero}${dados.complemento ? `, ${dados.complemento}` : ""} - ${formatarNome(dados.bairro)}.</p>
                <p>${formatarNome(dados.cidade)}/${dados.estado} - CEP ${dados.cep}</p>
            </div>

            <div class="notificacao__corpo">

                <p class="no-indent">${tratamento.vocativo}</p>

                <p>
                    <strong>A ADUSEPS – Associação de Defesa dos Usuários de Seguros, Planos e Sistemas de Saúde</strong>,
                    por meio de seus representantes legais, vem notificá-lo extrajudicialmente,
                    com fundamento no <strong>art. 14 do Estatuto Social da ADUSEPS</strong>,
                    acerca de sua <strong>inadimplência</strong> junto à entidade.
                </p>

                <p>
                    Conforme registros, V. Sa. filiou-se à ADUSEPS em ${dados.dataFiliacao.split('-').reverse().join('/')},
                    assumindo o compromisso de manter-se adimplente, nos termos do art. 14,
                    item B, do Estatuto Social.
                </p>

                <figure class="notificacao__imagem">
                    <img src="assets/artigo_1.png" alt="Artigo 14 do Estatuto">
                </figure>

                <p>
                    Ocorre que V. Sa. deixou de cumprir a referida obrigação,
                    deixando de quitar as mensalidades de ${montarTextoCompetencias()},
                    acumulando débito no valor de <strong> ${Number(dados.valorTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
</strong>
                    (${valorExtenso}), já acrescido de juros de mora e atualização monetária.
                </p>

                <p>
                    O Estatuto Social, em seu art. 16, parágrafo único,
                    prevê a possibilidade de exclusão do associado inadimplente,
                    diante da obrigação de contribuir para a manutenção da associação.
                </p>

                <figure class="notificacao__imagem notificacao__imagem--change">
                    <img src="assets/artigo_2.png" alt="Artigo 16 do Estatuto">
                </figure>

                <p>
                    Dessa forma, solicitamos que compareça à sede da ADUSEPS,
                    no prazo improrrogável de ${dados.prazo} (dez)
                    dias, a fim de regularizar o débito mencionado,
                    evitando, assim, a necessidade de propositura de ação judicial para cobrança.
                </p>

                <p>
                    A ausência de comparecimento ou de providências para quitação
                    será interpretada como recusa em solucionar o débito de forma amigável.
                </p>

                <p class="no-indent">
                    Certos de sua compreensão e aguardando sua regularização, firmamo-nos.
                </p>

                <p class="no-indent">Atenciosamente,</p>

            </div>

            <div class="notificacao__assinatura">
                <figure class="notificacao__imagem notificacao__assinatura--image">
                    <img src="assets/assinatura.png" alt="Artigo 16 do Estatuto">
                </figure>
                <p><strong>RENÊ PATRIOTA – COORDENADORA EXECUTIVA DA ADUSEPS</strong></p>
                <p><strong>OAB/PE 28.318</strong></p>
            </div>

            <div class="notificacao__rodape">
                <p>
                    Rua Henrique Dias, 145 - Boa Vista - Recife - PE<br>
                    Fone: (81) 3423-5567<br>
                    www.aduseps.org.br - juridico@aduseps.org.br
                </p>
            </div>

        </div>
    `;
}


/* Botão gerar notificação*/
btnGerar.addEventListener("click", function() {

    const dados = coletarDadosFormulario();
    const html = gerarNotificacao(dados);

    document.getElementById("visualizacaoDocumento").innerHTML = html;
    document.getElementById("btnImprimir").style.display = "inline-block";
});

const btnImprimir = document.getElementById("btnImprimir");

btnImprimir.addEventListener("click", function () {
    window.print();
});



/*Buscar cep atomaticamente*/
document.getElementById('cep').addEventListener('blur', function() {
    const cep = this.value.replace(/\D/g, '');

    if (cep.length === 8) {
        // Correção da URL usando Template Strings (Crases)
        const url = `https://viacep.com.br/ws/${cep}/json/`;

        fetch(url)
            .then(response => response.json())
            .then(dados => {
                if (!dados.erro) {
                    document.getElementById('rua').value = dados.logradouro;
                    document.getElementById('bairro').value = dados.bairro;
                    document.getElementById('cidade').value = dados.localidade;
                    document.getElementById('estado').value = dados.uf;
                    document.getElementById('numero').focus();
                } else {
                    alert("CEP não encontrado.");
                }
            })
            .catch(error => {
                console.error("Erro na consulta:", error);
                alert("Verifique sua conexão ou o formato do CEP.");
            });
    }
});

function limparCampos() {
    ['rua', 'bairro', 'cidade', 'estado'].forEach(id => {
        document.getElementById(id).value = "";
    });
}

//Formatando strings 
const formatarNome = (str) => {
    const excecoes = ['de', 'da', 'do', 'dos', 'das', 'e'];
    return str.toLowerCase().split(' ').map((p, i) => 
        excecoes.includes(p) && i !== 0 ? p : p.charAt(0).toUpperCase() + p.slice(1)
    ).join(' ');
};

function atualizarValorTotal() {

    const total = competenciasEmAtraso.reduce((soma, item) => {
        return soma + (item.valor || 0);
    }, 0);

    document.getElementById("valorTotal").value = total.toFixed(2);
}

//Botão nova notificação
const btnNovaNotificacao = document.getElementById("btnNovaNotificacao");

btnNovaNotificacao.addEventListener("click", function() {

    // Limpa formulário
    document.querySelector("form").reset();

    // Limpa array
    competenciasEmAtraso = [];

    // Limpa lista visual
    renderizarCompetencias();

    // Zera valor total
    atualizarValorTotal();

    // Limpa documento gerado
    document.getElementById("visualizacaoDocumento").innerHTML = "";

    // Esconde botão imprimir
    document.getElementById("btnImprimir").style.display = "none";

    document.getElementById("tabelaContainer").innerHTML = "";

    document.getElementById("toggleListaContainer").style.display = "none";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

//Ocultar lista
const toggleLista = document.getElementById("toggleLista");

toggleLista.addEventListener("change", function () {

    if (this.checked) {
        listaCompetencias.style.display = "block";
    } else {
        listaCompetencias.style.display = "none";
    }

});
