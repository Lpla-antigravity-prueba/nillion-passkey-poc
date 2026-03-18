const logElement = document.getElementById('log');
function log(msg, type = 'info') {
      const span = document.createElement('span');
      span.className = type;
      span.innerHTML = `[${type.toUpperCase()}] ${msg}<br>`;
      logElement.appendChild(span);
      logElement.scrollTop = logElement.scrollHeight;
}
function bufferToBase64URL(buffer) {
      const bytes = new Uint8Array(buffer);
      let str = "";
      for (const charCode of bytes) { str += String.fromCharCode(charCode); }
      return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
async function registerPasskey() {
      try {
                log("Iniciando registro de Passkey...");
                const challenge = new Uint8Array(32); window.crypto.getRandomValues(challenge);
                const userID = new Uint8Array(16); window.crypto.getRandomValues(userID);
                const publicKeyCredentialCreationOptions = {
                              challenge: challenge,
                              rp: { name: "Nillion PoC", id: window.location.hostname },
                              user: { id: userID, name: "dev@nillion.poc", displayName: "Antigravity-Zero" },
                              pubKeyCredParams: [{ alg: -8, type: "public-key" }, { alg: -7, type: "public-key" }],
                              authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required", residentKey: "required", requireResidentKey: true },
                              timeout: 60000, attestation: "none"
                };
                const credential = await navigator.credentials.create({ publicKey: publicKeyCredentialCreationOptions });
                log("Passkey Registrada con exito.", "info");
                localStorage.setItem('cred_id', bufferToBase64URL(credential.rawId));
      } catch (err) { log(`Error en Registro: ${err.message}`, "error"); }
}
async function authenticatePasskey() {
      try {
                const credID = localStorage.getItem('cred_id');
                if (!credID) { log("No hay credencial registrada. Por favor registrate primero.", "error"); return; }
                log("Iniciando autenticacion...");
                const challenge = new Uint8Array(32); window.crypto.getRandomValues(challenge);
                const publicKeyCredentialRequestOptions = {
                              challenge: challenge, timeout: 60000, rpId: window.location.hostname,
                              allowCredentials: [{ id: Uint8Array.from(atob(credID.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)), type: 'public-key' }],
                              userVerification: "required",
                };
                const assertion = await navigator.credentials.get({ publicKey: publicKeyCredentialRequestOptions });
                log("Autenticacion Exitosa. Desbloqueo de clave ED25519 completado.", "info");
      } catch (err) { log(`Error en Autenticacion: ${err.message}`, "error"); }
}
document.getElementById('btn-register').addEventListener('click', registerPasskey);
document.getElementById('btn-authenticate').addEventListener('click', authenticatePasskey);
