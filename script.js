document.addEventListener("DOMContentLoaded", function() {
    // --- Funcionalidade 1: Exibição e Fechamento da Caixa de Termos ---
    const modal = document.getElementById("terms-modal");
    const openLink = document.getElementById("open-terms-link");
    const closeButton = document.getElementsByClassName("close-button")[0];

    // Abre a modal quando o link é clicado
    openLink.addEventListener("click", function(event) {
        event.preventDefault();
        modal.style.display = "block";
    });

    // Fecha a modal quando o botão 'x' é clicado
    closeButton.addEventListener("click", function() {
        modal.style.display = "none";
    });

    // Fecha a modal se o usuário clicar fora dela
    window.addEventListener("click", function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });


    // --- Funcionalidade 2: Habilitação do Botão de Envio ---
    const termosCheckbox = document.getElementById("aceite-termos");
    const submitButton = document.querySelector(".submit-button");
    const contatoInput = document.getElementById("contato");

contatoInput.addEventListener("input", function(event) {
    let valor = this.value.replace(/\D/g, ""); // Remove tudo que não é dígito
    let formatado = "";

    // Aplica a máscara
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

    // Desabilita o botão por padrão
    submitButton.disabled = true;

    // Monitora a mudança no checkbox para habilitar ou desabilitar o botão
    termosCheckbox.addEventListener("change", function() {
        // Se o checkbox estiver marcado, o botão é habilitado
        submitButton.disabled = !this.checked;
    });
});