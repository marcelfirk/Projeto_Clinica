from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.paciente import db

class Procedimento(db.Model):
    __tablename__ = 'procedimentos'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False, unique=True)
    descricao = db.Column(db.String(255), nullable=True)
    valor_sugerido = db.Column(db.Float, nullable=True)
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Procedimento {self.nome}>'