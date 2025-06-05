from django.shortcuts import redirect, render
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
import json
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import ensure_csrf_cookie
from .models import *
Client = get_user_model()

def index(request):
    return render(request, "index.html")
@ensure_csrf_cookie
def auth_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            action = data.get("action")  

            if action == "login":
                phonenumber = data.get("phonenumber")
                password = data.get("password")

                user = authenticate(request, phonenumber=phonenumber, password=password)

                if user is not None:
                    login(request, user)
                    return JsonResponse({"success": True, "user": {"nom": user.nom, "prenom": user.prenom, "phonenumber": user.phonenumber, "direction": user.direction, "is_admin": user.is_admin}})
                else:
                    return JsonResponse({"success": False, "error": "Identifiants incorrects."})

            elif action == "signup":
                nom = data.get("nom")
                prenom = data.get("prenom")
                phonenumber = data.get("phonenumber")
                direction = data.get("direction")
                password = data.get("password")

                if Client.objects.filter(phonenumber=phonenumber).exists():
                    return JsonResponse({"success": False, "error": "Ce numéro de téléphone est déjà utilisé."})

                user = Client.objects.create_user(
                    phonenumber=phonenumber,
                    nom=nom,
                    prenom=prenom,
                    direction=direction,
                    password=password
                )

                return JsonResponse({"success": True})

            else:
                return JsonResponse({"success": False, "error": "Action non valide."})

        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)})

    return render(request, "auth.html")  


@login_required
def logout_view(request):
    logout(request)
    return redirect("/auth/")

@login_required
def admin_dashboard(request):
    if not request.user.is_admin: 
        return JsonResponse({"success": False, "error": "Accès refusé."}, status=403)

    return render(request, "admin/dashboard.html")
    

@login_required
def client_home(request):
    if request.user.is_admin:
        return JsonResponse({"error": "Accès refusé"}, status=403)

    return render(request, "client/home.html")

@login_required
def user_info(request):
    if request.user.is_admin:
        return JsonResponse({"error": "Accès refusé"}, status=403)

    interventions = Intervention.objects.filter(client=request.user).select_related('intervenant').values(
        "id", "type", "motif", "etat", 
        "intervenant__nom", "intervenant__prenom"
    )
    return JsonResponse({
        "success": True,
        "user": {
            "nom": request.user.nom,
            "prenom": request.user.prenom,
            "phonenumber": request.user.phonenumber,
            "direction": request.user.direction,
        },
        "interventions": list(interventions)
    })


@login_required
@csrf_exempt
@require_http_methods(["GET", "POST", "PUT", "DELETE", "PATCH"])
def clients_view(request, phonenumber=None):
    if not request.user.is_admin:
        return JsonResponse({"error": "Accès refusé"}, status=403)

    if request.method == "GET":
        clients = Client.objects.filter(is_admin=False).values("nom", "prenom", "phonenumber", "direction")
        return JsonResponse({"success": True, "clients": list(clients)})

    elif request.method == "POST":
        data = json.loads(request.body)
        client = Client.objects.create_user(
            phonenumber=data["phonenumber"],
            nom=data["nom"],
            prenom=data["prenom"],
            direction=data["direction"],
            password=data["password"],
        )
        return JsonResponse({"success": True, "message": "Client ajouté avec succès"})

    elif request.method == "PUT":
        data = json.loads(request.body)
        try:
            client = Client.objects.get(phonenumber=data["phonenumber"])
            client.nom = data.get("nom", client.nom)
            client.prenom = data.get("prenom", client.prenom)
            client.direction = data.get("direction", client.direction)
            client.set_password(data.get("password", client.password))
            client.save()
            return JsonResponse({"success": True, "message": "Client mis à jour"})
        except Client.DoesNotExist:
            return JsonResponse({"error": "Client introuvable"}, status=404)

    elif request.method == "DELETE":
        if phonenumber:
            try:
                client = Client.objects.get(phonenumber=phonenumber)
                client.delete()
                return JsonResponse({"success": True, "message": "Client supprimé"})
            except Client.DoesNotExist:
                return JsonResponse({"error": "Client introuvable"}, status=404)
        return JsonResponse({"error": "Numéro de téléphone requis"}, status=400)

    elif request.method == "PATCH":
        if phonenumber:
            data = json.loads(request.body)
            try:
                client = Client.objects.get(phonenumber=phonenumber)
                client.nom = data.get("nom", client.nom)
                client.prenom = data.get("prenom", client.prenom)
                client.direction = data.get("direction", client.direction)
                client.set_password(data.get("password", client.password))
                client.save()
                return JsonResponse({"success": True, "message": "Client mis à jour partiellement"})
            except Client.DoesNotExist:
                return JsonResponse({"error": "Client introuvable"}, status=404)
        return JsonResponse({"error": "Numéro de téléphone requis pour la mise à jour partielle"}, status=400)



@login_required
@csrf_exempt
@require_http_methods(["GET", "POST", "PUT", "PATCH", "DELETE"])
def intervenants_view(request, pk=None):
    if request.method == "GET":
        intervenants = Intervenant.objects.all().values("id", "nom", "prenom", "poste")
        return JsonResponse({"success": True, "intervenants": list(intervenants)})

    elif request.method == "POST":
        data = json.loads(request.body)
        intervenant = Intervenant.objects.create(
            nom=data["nom"],
            prenom=data["prenom"],
            poste=data["poste"],
        )
        return JsonResponse({"success": True, "message": "Intervenant ajouté avec succès"})

    elif request.method == "PUT":
        data = json.loads(request.body)
        try:
            intervenant = Intervenant.objects.get(id=data["id"])
            intervenant.nom = data.get("nom", intervenant.nom)
            intervenant.prenom = data.get("prenom", intervenant.prenom)
            intervenant.poste = data.get("poste", intervenant.poste)
            intervenant.save()
            return JsonResponse({"success": True, "message": "Intervenant mis à jour"})
        except Intervenant.DoesNotExist:
            return JsonResponse({"error": "Intervenant introuvable"}, status=404)

    elif request.method == "DELETE":
        if pk:
            try:
                intervenant = Intervenant.objects.get(id=pk)
                intervenant.delete()
                return JsonResponse({"success": True, "message": "Intervenant supprimé"})
            except Intervenant.DoesNotExist:
                return JsonResponse({"error": "Intervenant introuvable"}, status=404)
        return JsonResponse({"error": "Identifiant de l'intervenant requis"}, status=400)
    elif request.method == "PATCH":
        if pk:
            data = json.loads(request.body)
            try:
                intervenant = Intervenant.objects.get(id=pk)
                intervenant.nom = data.get("nom", intervenant.nom)
                intervenant.prenom = data.get("prenom", intervenant.prenom)
                intervenant.poste = data.get("poste", intervenant.poste)
                intervenant.save()
                return JsonResponse({"success": True, "message": "Intervenant mis à jour partiellement"})
            except Intervenant.DoesNotExist:
                return JsonResponse({"error": "Intervenant introuvable"}, status=404)

@login_required
@csrf_exempt
@require_http_methods(["GET", "POST", "PUT", "PATCH", "DELETE"])
def interventions_view(request, pk=None):
    if request.method == "GET":
        interventions = Intervention.objects.select_related("intervenant").all()
        interventions_list = [
            {
                "id": i.id,
                "date": i.date,
                "type": i.type,
                "motif": i.motif,
                "etat": i.etat,
                "intervenant": {
                    "id": i.intervenant.id if i.intervenant else None,
                    "nom": i.intervenant.nom if i.intervenant else "Non assigné",
                    "prenom": i.intervenant.prenom if i.intervenant else "",
                } if i.intervenant else None,
                "client_id": i.client_id,
            }
            for i in interventions
        ]
        return JsonResponse({"success": True, "interventions": interventions_list})

    elif request.method == "POST":
        data = json.loads(request.body)
        print(data)
        try:
            intervenant = Intervenant.objects.get(id=data["intervenant"])
            client = Client.objects.get(phonenumber=data["client"])
            intervention = Intervention.objects.create(
                type=data["type"],
                motif=data["motif"],
                etat=data.get("etat", "En attente"),
                intervenant=intervenant,
                client=client,
            )
            return JsonResponse({"success": True, "message": "Intervention ajoutée avec succès"})
        except (Intervenant.DoesNotExist, Client.DoesNotExist):
            return JsonResponse({"error": "Intervenant ou client introuvable"}, status=404)

    elif request.method == "PUT":
        data = json.loads(request.body)
        try:
            intervention = Intervention.objects.get(id=data["id"])
            intervention.type = data.get("type", intervention.type)
            intervention.motif = data.get("motif", intervention.motif)
            intervention.etat = data.get("etat", intervention.etat)
            intervention.save()
            return JsonResponse({"success": True, "message": "Intervention mise à jour"})
        except Intervention.DoesNotExist:
            return JsonResponse({"error": "Intervention introuvable"}, status=404)
    elif request.method == "PATCH":
        if pk:
            data = json.loads(request.body)
            try:
                intervention = Intervention.objects.get(id=pk)
                intervention.type = data.get("type", intervention.type)
                intervention.motif = data.get("motif", intervention.motif)
                intervention.etat = data.get("etat", intervention.etat)
                intervention.save()
                return JsonResponse({"success": True, "message": "Intervention mise à jour partiellement"})
            except Intervention.DoesNotExist:
                return JsonResponse({"error": "Intervention introuvable"}, status=404)
            
    elif request.method == "DELETE":
        if pk:
            try:
                intervention = Intervention.objects.get(id=pk)
                intervention.delete()
                return JsonResponse({"success": True, "message": "Intervention supprimée"})
            except Intervention.DoesNotExist:
                return JsonResponse({"error": "Intervention introuvable"}, status=404)
        return JsonResponse({"error": "Identifiant de l'intervention requis"}, status=400)
    

    return render(request, "stats.html")