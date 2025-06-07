from src.models.paciente import db

class Refeicao(db.Model):
    __tablename__ = 'refeicoes'

    id = db.Column(db.Integer, primary_key=True)
    tipo = db.Column(db.String(50), nullable=False)