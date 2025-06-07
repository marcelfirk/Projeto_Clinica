from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
from src.models.paciente import db

class Contrato(db.Model):
    __tablename__ = 'contratos'
    
    id = db.Column(db.Integer, primary_key=True)
    identificador_contrato = db.Column(db.String(50), unique=True, nullable=False)
    paciente_id = db.Column(db.Integer, db.ForeignKey('pacientes.id'), nullable=False)
    procedimento = db.Column(db.String(255), nullable=False)
    data_procedimento = db.Column(db.Date, nullable=False)
    local_realizacao = db.Column(db.String(255), nullable=False)
    valor_total = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='ativo')
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    lancamentos = db.relationship('LancamentoFinanceiro', backref='contrato', lazy=True)
    
    def __repr__(self):
        return f'<Contrato {self.identificador_contrato}>'
    
    @staticmethod
    def gerar_identificador():
        return f'CONT-{uuid.uuid4().hex[:8].upper()}'
