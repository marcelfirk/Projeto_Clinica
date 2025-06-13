from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.paciente import db

class Item(db.Model):
    __tablename__ = 'itens'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False, unique=True)
    descricao = db.Column(db.String(255), nullable=True)
    quantidade_estoque = db.Column(db.Integer, default=0)
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Item {self.nome}>'