document.addEventListener("DOMContentLoaded", function() {
    // -----------------------------------------------------
    // VARIÁVEIS DE ESTADO E TEMPO DE FECHAMENTO
    // -----------------------------------------------------
    const FECHAMENTO_HORA = 23;
    const FECHAMENTO_MINUTO = 59;
    const FECHAMENTO_SEGUNDO = 59;
    
    // Elementos do Cronômetro
    const countdownTimer = document.getElementById('countdown-timer');
    const countdownTitle = document.getElementById('countdown-title');
    
    // Elementos de Estado
    // Certifique-se de que o FORMULÁRIO PRINCIPAL e o LOGIN de CONTINUAÇÃO
    // estejam dentro da seção com id="open-state" no index.html
    const openState = document.getElementById('open-state'); 
    const closedState = document.getElementById('closed-state'); 
    
    // Elementos do Formulário (garantindo que existam antes de usar)
    const contatoInput = document.getElementById("contato");
    const termosCheckbox = document.getElementById("aceite-termos");
    const submitButton = document.querySelector(".submit-button"); // Seletor para o botão de inscrição principal

    // -----------------------------------------------------
    // 1. LÓGICA DO CRONÔMETRO E MUDANÇA DE ESTADO
    // -----------------------------------------------------

    function updateDisplayState(isClosed) {
        if (openState && closedState) {
            if (isClosed) {
                openState.style.display = 'none';
                closedState.style.display = 'block';
                
                if (countdownTitle) countdownTitle.textContent = 'INSCRIÇÕES ENCERRADAS';
                if (countdownTimer) countdownTimer.style.display = 'none';
            } else {
                openState.style.display = 'block';
                closedState.style.display = 'none';
            }
        }
    }

    function startCountdown() {
        const agora = new Date();
        const fimDoDia = new Date(agora);
        
        // Define o tempo de fechamento
        fimDoDia.setHours(FECHAMENTO_HORA, FECHAMENTO_MINUTO, FECHAMENTO_SEGUNDO, 0);

        // Se o tempo de fechamento já passou, define o estado como fechado
        if (agora > fimDoDia) {
            updateDisplayState(true);
            return;
        }

        const intervalo = setInterval(() => {
            const agora = new Date().getTime();
            const distancia = fimDoDia.getTime() - agora;

            if (distancia < 0) {
                clearInterval(intervalo);
                updateDisplayState(true);
                return;
            }

            const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
            const segundos = Math.floor((distancia % (1000 * 60)) / 1000);

            if (document.getElementById('hours')) document.getElementById('hours').textContent = String(horas).padStart(2, '0');
            if (document.getElementById('minutes')) document.getElementById('minutes').textContent = String(minutos).padStart(2, '0');
            if (document.getElementById('seconds')) document.getElementById('seconds').textContent = String(segundos).padStart(2, '0');
            
            updateDisplayState(false); // Mantém o estado como "aberto"
        }, 1000);
    }

    // Inicia o cronômetro (só se os elementos existirem)
    if (countdownTimer) {
        startCountdown();
    }


    // -----------------------------------------------------
    // 2. FUNCIONALIDADES DO FORMULÁRIO (Mascaras e Botões)
    // -----------------------------------------------------

    // Máscara de Telefone (mantida)
    if (contatoInput) {
        contatoInput.addEventListener("input", function(event) {
            let valor = this.value.replace(/\D/g, "");
            let formatado = "";
            if (valor.length > 0) {
                formatado = "(" + valor.substring(0, 2);
            }
            if (valor.length > 2) {
                formatado += ") " + valor.substring(2, 7);
            }
            if (valor.length > 7) {
                formatado += "-" + valor.substring(7, 11);
            }
            this.value = formatado;
        });
    }

    // Habilitação do Botão de Envio (mantida)
    if (termosCheckbox && submitButton) {
        submitButton.disabled = true;

        termosCheckbox.addEventListener("change", function() {
            submitButton.disabled = !this.checked;
        });
    }

    // A lógica do modal de Termos e Condições também deve ser mantida aqui
    // ...
});