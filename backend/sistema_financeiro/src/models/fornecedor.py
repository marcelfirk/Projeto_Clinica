from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
from src.models.paciente import db

class Fornecedor(db.Model):
    __tablename__ = 'fornecedores'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    cpf_cnpj = db.Column(db.String(18), unique=True, nullable=False)
    identificador = db.Column(db.String(50), unique=True, nullable=False)
    telefone = db.Column(db.String(20), nullable=True)
    email = db.Column(db.String(120), nullable=True)
    endereco = db.Column(db.String(255), nullable=True)
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    
    lancamentos = db.relationship('LancamentoFinanceiro', backref='fornecedor', lazy=True)
    
    def __repr__(self):
        return f'<Fornecedor {self.nome}>'
    
    @staticmethod
    def gerar_identificador():
        return f'FORN-{uuid.uuid4().hex[:8].upper()}'
