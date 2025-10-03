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
    const openState = document.getElementById('open-state'); 
    const closedState = document.getElementById('closed-state'); 
    
    // Elementos do Formulário
    const contatoInput = document.getElementById("contato");
    const termosCheckbox = document.getElementById("aceite-termos");
    const submitButton = document.querySelector(".submit-button");

    // -----------------------------------------------------
    // FUNÇÕES DE EXIBIÇÃO E CÁLCULO
    // -----------------------------------------------------

    function updateTimerDisplay(distancia) {
        const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((distancia % (1000 * 60)) / 1000);

        if (document.getElementById('hours')) document.getElementById('hours').textContent = String(horas).padStart(2, '0');
        if (document.getElementById('minutes')) document.getElementById('minutes').textContent = String(minutos).padStart(2, '0');
        if (document.getElementById('seconds')) document.getElementById('seconds').textContent = String(segundos).padStart(2, '0');
    }

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
    // 1. Define o tempo de fechamento para a PRÓXIMA ocorrência das 23:59:59
    let agora = new Date();
    let fimDoDia = new Date(agora);
    fimDoDia.setHours(FECHAMENTO_HORA, FECHAMENTO_MINUTO, FECHAMENTO_SEGUNDO, 0);

    // 2. Se o tempo de fechamento já passou, move para o estado fechado imediatamente.
    if (agora.getTime() >= fimDoDia.getTime()) {
        updateDisplayState(true);
        updateTimerDisplay(0);
        return; 
    }
    
    // 3. Inicia o cálculo e a atualização da contagem regressiva
    const interval = setInterval(() => {
        const distancia = fimDoDia.getTime() - new Date().getTime();

        if (distancia < 0) {
            clearInterval(interval);
            updateTimerDisplay(0);
            updateDisplayState(true); // FINALIZA A CONTAGEM
            return;
        }

        updateTimerDisplay(distancia);
        updateDisplayState(false); // Mantém o estado como "aberto"
        
    }, 1000);
    
    // CORREÇÃO CRÍTICA: Faz o cálculo inicial imediatamente, evitando o 00:00:00 estático
    updateTimerDisplay(fimDoDia.getTime() - agora.getTime());
    updateDisplayState(false);
}

    // -----------------------------------------------------
    // INICIALIZAÇÃO
    // -----------------------------------------------------

    // Inicia o cronômetro (só se os elementos existirem)
    if (countdownTimer) {
        startCountdown();
    }


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
});