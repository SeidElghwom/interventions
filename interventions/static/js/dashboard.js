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
    checkAdmin();
    loadClients();
    loadIntervenants();
    loadInterventions();
});

// Afficher la section sélectionnée
function showSection(sectionId) {
    document.querySelectorAll(".section").forEach(section => {
        section.style.display = "none";
    });
    document.getElementById(sectionId).style.display = "block";
}

// Vérifier si l'utilisateur est admin
function checkAdmin() {
    fetch("/dashboard/", {
        headers: { "Content-Type": "application/json", "X-CSRFToken": getCSRFToken() }
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            alert("Accès refusé.");
            window.location.href = "/auth/";
        } else {
            document.querySelector(".content h1").textContent = `Bienvenue, ${data.user.nom}`;
        }
    })
    .catch(error => console.error("Erreur lors de la vérification de l'admin:", error));
}

// Charger la liste des clients
function loadClients() {
    fetch("/clients/", {
        headers: { "Content-Type": "application/json", "X-CSRFToken": getCSRFToken() }
    })
    .then(response => response.json())
    .then(data => {
        const tableBody = document.querySelector("#clientsTable tbody");
        tableBody.innerHTML = "";
        data.clients.forEach(client => {
            let row = `
                <tr>
                    <td>${client.nom}</td>
                    <td>${client.prenom}</td>
                    <td>${client.phonenumber}</td>
                    <td>${client.direction}</td>
                    <td>
                        <button onclick="editClient('${client.phonenumber}')">Modifier</button>
                        <button onclick="deleteClient('${client.phonenumber}')">Supprimer</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    })
    .catch(error => console.error("Erreur lors du chargement des clients:", error));
}

document.getElementById('clientForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevents the form from reloading the page

    // Capture form field values
    const nom = document.getElementById('clientNom').value;
    const prenom = document.getElementById('clientPrenom').value;
    const phonenumber = document.getElementById('clientNumero').value;
    const direction = document.getElementById('clientDirection').value;

    // Call the addClient function
    addClient(nom, prenom, phonenumber, direction);
});

function addClient(nom, prenom, phonenumber, direction) {
    fetch("/clients/", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRFToken": getCSRFToken() },
        body: JSON.stringify({ nom, prenom, phonenumber, direction })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        loadClients(); // Function to reload the client list
    })
    .catch(error => console.error("Erreur lors de l'ajout du client:", error));
}


// Modifier un client
function editClient(phonenumber) {
    let newName = prompt("Entrez le nouveau nom:");
    let newPrenom = prompt("Entrez le nouveau prénom:");
    let newDirection = prompt("Entrez la nouvelle direction:");

    // Création de l'objet avec seulement les champs remplis
    let updatedData = {};

    if (newName) updatedData.nom = newName;
    if (newPrenom) updatedData.prenom = newPrenom;
    if (newDirection) updatedData.direction = newDirection;

    // Vérifier s'il y a des champs à mettre à jour
    if (Object.keys(updatedData).length === 0) {
        alert("Aucune modification apportée.");
        return;
    }

    fetch(`/clients/${phonenumber}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-CSRFToken": getCSRFToken() },
        body: JSON.stringify(updatedData)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        loadClients();
    })
    .catch(error => console.error("Erreur lors de la modification du client:", error));
}

// Supprimer un client
function deleteClient(phonenumber) {
    if (confirm("Voulez-vous vraiment supprimer ce client ?")) {
        fetch(`/clients/${phonenumber}/`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json", "X-CSRFToken": getCSRFToken() }
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadClients();
        })
        .catch(error => console.error("Erreur lors de la suppression du client:", error));
    }
}

// Charger la liste des intervenants
function loadIntervenants() {
    fetch("/intervenants/", {
        headers: { "Content-Type": "application/json", "X-CSRFToken": getCSRFToken() }
    })
    .then(response => response.json())
    .then(data => {
        const tableBody = document.querySelector("#intervenantsTable tbody");
        tableBody.innerHTML = "";
        data.intervenants.forEach(intervenant => {
            let row = `
                <tr>
                    <td>${intervenant.nom}</td>
                    <td>${intervenant.prenom}</td>
                    <td>${intervenant.poste}</td>
                    <td>
                        <button onclick="editIntervenant(${intervenant.id})">Modifier</button>
                        <button onclick="deleteIntervenant(${intervenant.id})">Supprimer</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    })
    .catch(error => console.error("Erreur lors du chargement des intervenants:", error));
}

document.getElementById('intervenantForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from reloading the page

    // Capture the form field values
    const nom = document.getElementById('intervenantNom').value;
    const prenom = document.getElementById('intervenantPrenom').value;
    const poste = document.getElementById('intervenantPoste').value;

    // Call the function to add the intervenant
    addIntervenant(nom, prenom, poste);
});

function addIntervenant(nom, prenom, poste) {
    fetch("/intervenants/", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRFToken": getCSRFToken() },
        body: JSON.stringify({ nom, prenom, poste })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        loadIntervenants(); // Function to reload the intervenants list
    })
    .catch(error => console.error("Erreur lors de l'ajout de l'intervenant:", error));
}

// Modifier un intervenant
function editIntervention(id) {
    let newType = prompt("Entrez le nouveau type (Soft/Hard):");
    let newMotif = prompt("Entrez le nouveau motif:");
    let newEtat = prompt("Entrez le nouvel état (En attente/Réalisée):");

    let updatedData = {};
    if (newType) updatedData.type = newType;
    if (newMotif) updatedData.motif = newMotif;
    if (newEtat) updatedData.etat = newEtat;

    if (Object.keys(updatedData).length === 0) {
        alert("Aucune modification apportée.");
        return;
    }

    fetch(`/interventions/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-CSRFToken": getCSRFToken() },
        body: JSON.stringify(updatedData)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        location.reload();
    })
    .catch(error => console.error("Erreur lors de la modification de l'intervention:", error));
}



// Supprimer un intervenant
function deleteIntervenant(id) {
    fetch("/intervenants/" + id, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "X-CSRFToken": getCSRFToken() }
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        loadIntervenants();
    })
    .catch(error => console.error("Erreur lors de la suppression de l'intervenant:", error));
}

// Charger la liste des interventions
function loadInterventions() {
    fetch("/interventions/", {
        headers: { "Content-Type": "application/json", "X-CSRFToken": getCSRFToken() }
    })
    .then(response => response.json())
    .then(data => {
        const tableBody = document.querySelector("#interventionsTable tbody");
        tableBody.innerHTML = "";
        data.interventions.forEach(intervention => {
            let row = `
                <tr>
                    <td>${intervention.id}</td>
                    <td>${intervention.type}</td>
                    <td>${intervention.motif}</td>
                    <td>${intervention.etat}</td>
                    <td>
                        <button onclick="editIntervention(${intervention.id})">Modifier</button>
                        <button onclick="deleteIntervention(${intervention.id})">Supprimer</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    })
    .catch(error => console.error("Erreur lors du chargement des interventions:", error));
}
document.getElementById('interventionForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from reloading the page

    // Capture the form field values
    const type = document.getElementById('interventionType').value;
    const motif = document.getElementById('interventionMotif').value;
    const etat = document.getElementById('interventionEtat').value;

    // Call the function to add the intervention
    addIntervention(type, motif, etat);
});

function addIntervention(type, motif, etat) {
    fetch("/interventions/", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRFToken": getCSRFToken() },
        body: JSON.stringify({ type, motif, etat })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        loadInterventions(); // Function to reload the interventions list
    })
    .catch(error => console.error("Erreur lors de l'ajout de l'intervention:", error));
}

// Modifier une intervention
function editIntervention(id) {
    let newType = prompt("Entrez le nouveau type (Soft/Hard):");
    let newMotif = prompt("Entrez le nouveau motif:");
    let newEtat = prompt("Entrez le nouvel état (En attente/Réalisée):");

    // Création de l'objet avec uniquement les champs remplis
    let updatedData = {};

    if (newType) updatedData.type = newType;
    if (newMotif) updatedData.motif = newMotif;
    if (newEtat) updatedData.etat = newEtat;

    // Vérifier s'il y a des champs à mettre à jour
    if (Object.keys(updatedData).length === 0) {
        alert("Aucune modification apportée.");
        return;
    }

    fetch(`/interventions/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-CSRFToken": getCSRFToken() },
        body: JSON.stringify(updatedData)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        loadInterventions();
    })
    .catch(error => console.error("Erreur lors de la modification de l'intervention:", error));
}


// Supprimer une intervention
function deleteIntervention(id) {
    if (confirm("Voulez-vous vraiment supprimer cette intervention ?")) {
        fetch(`/interventions/${id}/`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json", "X-CSRFToken": getCSRFToken() }
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadInterventions();
        })
        .catch(error => console.error("Erreur lors de la suppression de l'intervention:", error));
    }
}
