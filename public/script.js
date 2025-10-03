document.addEventListener("DOMContentLoaded", function() {
    // -----------------------------------------------------
    // VARIÁVEIS DE ESTADO E TEMPO DE FECHAMENTO (HORÁRIO LOCAL DO USUÁRIO)
    // -----------------------------------------------------
    const FECHAMENTO_HORA = 23;
    const FECHAMENTO_MINUTO = 59;
    const FECHAMENTO_SEGUNDO = 59;

    // Elementos do Cronômetro
    const countdownTimer = document.getElementById("countdown-timer");
    const countdownTitle = document.getElementById("countdown-title");

    // Elementos de Estado
    const openState = document.getElementById("open-state");
    const closedState = document.getElementById("closed-state");

    // Elementos do Formulário
    const contatoInput = document.getElementById("contato");
    const termosCheckbox = document.getElementById("aceite-termos");
    const submitButton = document.querySelector(".submit-button");
    const mainSubmitButton = document.getElementById("main-submit-button");
    
    let interval; 

    // -----------------------------------------------------
    // FUNÇÕES DO CRONÔMETRO
    // -----------------------------------------------------

    function updateTimerDisplay(distancia) {
        const horas = Math.floor(
            (distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((distancia % (1000 * 60)) / 1000);

        if (document.getElementById("hours"))
            document.getElementById("hours").textContent = String(horas).padStart(2, "0");
        if (document.getElementById("minutes"))
            document.getElementById("minutes").textContent = String(minutos).padStart(2, "0");
        if (document.getElementById("seconds"))
            document.getElementById("seconds").textContent = String(segundos).padStart(2, "0");
    }

    function updateDisplayState(isClosed) {
        if (openState && closedState) {
            if (isClosed) {
                openState.style.display = "none";
                closedState.style.display = "block";

                if (countdownTitle)
                    countdownTitle.textContent = "INSCRIÇÕES ENCERRADAS";
                if (countdownTimer) countdownTimer.style.display = "none";
            } else {
                openState.style.display = "block";
                closedState.style.display = "none";
            }
        }
    }

    function startCountdown() {
        let fimDoDia = new Date();
        fimDoDia.setHours(FECHAMENTO_HORA, FECHAMENTO_MINUTO, FECHAMENTO_SEGUNDO, 0);

        const agora = new Date();

        // Se o tempo de hoje já passou, não começamos a contagem. O estado é fechado.
        if (agora.getTime() > fimDoDia.getTime()) {
            updateDisplayState(true);
            return;
        }

        function tick() {
            const distancia = fimDoDia.getTime() - new Date().getTime();

            if (distancia <= 0) {
                clearInterval(interval);
                updateTimerDisplay(0);
                updateDisplayState(true);
                return;
            }

            updateTimerDisplay(distancia);
            updateDisplayState(false);
        }

        // Roda de imediato e define o intervalo
        tick(); 
        interval = setInterval(tick, 1000);
    }

    // -----------------------------------------------------
    // INICIALIZAÇÃO
    // -----------------------------------------------------

    if (countdownTimer) {
        startCountdown();
    }


    // Máscara de Telefone (mantida)
    if (contatoInput) {
        contatoInput.addEventListener("input", function () {
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

    // Habilitação do botão (mantida)
    if (termosCheckbox && mainSubmitButton) {
    mainSubmitButton.disabled = true; // Desabilita APENAS o botão de inscrição

    termosCheckbox.addEventListener("change", function() {
        mainSubmitButton.disabled = !this.checked; // Habilita com o checkbox
    });
}
});