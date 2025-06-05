from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

class ClientManager(BaseUserManager):
    def create_user(self, phonenumber, nom, prenom, direction, password=None):
        if not phonenumber:
            raise ValueError("Le numéro de téléphone est obligatoire")
        user = self.model(phonenumber=phonenumber, nom=nom, prenom=prenom, direction=direction)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phonenumber, nom, prenom, direction, password=None):
        user = self.create_user(phonenumber, nom, prenom, direction, password)
        user.is_admin = True
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user

class Client(AbstractBaseUser, PermissionsMixin):
    phonenumber = models.CharField(max_length=15, unique=True, primary_key=True)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    direction = models.CharField(max_length=100)
    
    is_admin = models.BooleanField(default=False)  
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    objects = ClientManager()

    USERNAME_FIELD = 'phonenumber'
    REQUIRED_FIELDS = ['nom', 'prenom', 'direction']

    def __str__(self):
        return f"{self.nom} {self.prenom} - {self.phonenumber}"

class Intervenant(models.Model):
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    poste = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.nom} {self.prenom}"


class Intervention(models.Model):
    TYPE_CHOICES = [
        ('Soft', 'Soft'),
        ('Hard', 'Hard'),
    ]
    ETAT_CHOICES = [
        ('En attente', 'En attente'),
        ('Réalisée', 'Réalisée'),
    ]
    
    date = models.DateTimeField(auto_now_add=True)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    motif = models.TextField()
    etat = models.CharField(max_length=20, choices=ETAT_CHOICES, default='En attente')
    intervenant = models.ForeignKey(Intervenant, on_delete=models.CASCADE)
    client = models.ForeignKey(Client, on_delete=models.CASCADE)

    def __str__(self):
        return f"Intervention {self.id} - {self.type} ({self.etat})"
