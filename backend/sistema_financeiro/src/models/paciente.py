from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
db = SQLAlchemy()

class Paciente(db.Model):
    __tablename__ = 'pacientes'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    cpf = db.Column(db.String(14), unique=True, nullable=False)
    data_nascimento = db.Column(db.Date, nullable=False)
    identificador = db.Column(db.String(50), unique=True, nullable=False)
    telefone = db.Column(db.String(20), nullable=True)
    email = db.Column(db.String(120), nullable=True)
    endereco = db.Column(db.String(255), nullable=True)
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    nacionalidade = db.Column(db.String(25), nullable=True)
    
    contratos = db.relationship('Contrato', back_populates='paciente')
    
    def __repr__(self):
        return f'<Paciente {self.nome}>'
    
    @staticmethod
    def gerar_identificador():
        return f'PAC-{uuid.uuid4().hex[:8].upper()}'