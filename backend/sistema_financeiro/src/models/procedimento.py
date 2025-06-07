from src.models.paciente import db

class Procedimento(db.Model):
    __tablename__ = 'procedimentos'

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.Text, nullable=True)