function getCSRFToken() {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          if (cookie.startsWith('csrftoken=')) {
              cookieValue = cookie.substring('csrftoken='.length, cookie.length);
              break;
          }
      }
  }
  return cookieValue;
}
document.addEventListener("DOMContentLoaded", function () {
    const loginContainer = document.getElementById("loginContainer");
    const signupContainer = document.getElementById("signupContainer");
    const showSignup = document.getElementById("showSignup");
    const showLogin = document.getElementById("showLogin");
  
    showSignup.addEventListener("click", function () {
      loginContainer.style.display = "none";
      signupContainer.style.display = "block";
    });
  
    showLogin.addEventListener("click", function () {
      signupContainer.style.display = "none";
      loginContainer.style.display = "block";
    });

   
  
    document.getElementById("loginForm").addEventListener("submit", function (event) {
      event.preventDefault();
      
      let phonenumber = document.getElementById("loginPhone").value;
      let password = document.getElementById("loginPassword").value;
  
      fetch("/auth/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken()
        },
        body: JSON.stringify({ action: "login", phonenumber, password }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          if(data.user.is_admin){
            alert("Connexion réussie !");
            window.location.href = "/dashboard/";
          }
          else{
            alert("Connexion réussie !");
          window.location.href = "/home/";
          }
          
        } else {
          document.getElementById("loginError").innerText = data.error;
        }
      })
      .catch(error => {
        document.getElementById("loginError").innerText = "Erreur de connexion.";
      });
    });
  
    document.getElementById("signupForm").addEventListener("submit", function (event) {
      event.preventDefault();
      
      let nom = document.getElementById("nom").value;
      let prenom = document.getElementById("prenom").value;
      let phonenumber = document.getElementById("signupPhone").value;
      let direction = document.getElementById("direction").value;
      let password = document.getElementById("signupPassword").value;
  
      fetch("/auth/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken()
        },
        body: JSON.stringify({ action: "signup", nom, prenom, phonenumber, direction, password }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert("Inscription réussie !");
          showLogin.click();  // Afficher le formulaire de connexion
        } else {
          document.getElementById("signupError").innerText = data.error;
        }
      })
      .catch(error => {
        document.getElementById("signupError").innerText = "Erreur lors de l'inscription.";
      });
    });
  });
  