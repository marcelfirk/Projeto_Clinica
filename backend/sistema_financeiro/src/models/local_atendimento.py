from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.paciente import db

class LocalAtendimento(db.Model):
    __tablename__ = 'locais_atendimento'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False, unique=True)
    endereco = db.Column(db.String(255), nullable=True)
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<LocalAtendimento {self.nome}>'