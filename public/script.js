document.addEventListener("DOMContentLoaded", function() {
    // --- Funcionalidade para máscara de telefone ---
    const contatoInput = document.getElementById("contato");
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

    // --- Funcionalidade 2: Habilitação do Botão de Envio ---
    const termosCheckbox = document.getElementById("aceite-termos");
    const submitButton = document.querySelector(".submit-button");

    submitButton.disabled = true;

    termosCheckbox.addEventListener("change", function() {
        submitButton.disabled = !this.checked;
    });
});