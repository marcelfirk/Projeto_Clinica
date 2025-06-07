from src.models.paciente import db

class LocalAtendimento(db.Model):
    __tablename__ = 'locais_atendimento'

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    endereco = db.Column(db.String(255), nullable=True)
    telefone = db.Column(db.String(20), nullable=True)