from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
from src.models.paciente import db

class Contrato(db.Model):
    __tablename__ = 'contratos'
    
    id = db.Column(db.Integer, primary_key=True)
    identificador_contrato = db.Column(db.String(50), unique=True, nullable=False)
    paciente_id = db.Column(db.Integer, db.ForeignKey('pacientes.id'), nullable=False)
    agendamento_cirurgico_id = db.Column(db.Integer, db.ForeignKey('agendamentos_cirurgicos.id'), nullable=True)
    agendamento_sessao_id = db.Column(db.Integer, db.ForeignKey('agendamentos_sessao.id'), nullable=True)
    status = db.Column(db.String(20), nullable=False, default='ativo')
    valor_sinal = db.Column(db.Float, nullable=True)
    valor_restante = db.Column(db.Float, nullable=True)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    lancamentos = db.relationship('LancamentoFinanceiro', back_populates='contrato')
    agendamento_cirurgico = db.relationship('AgendamentoCirurgico', backref='contratos')
    agendamento_sessao = db.relationship('AgendamentoSessao', backref='contratos')
    paciente = db.relationship('Paciente', back_populates='contratos')
    
    def __repr__(self):
        return f'<Contrato {self.identificador_contrato}>'
    
    @staticmethod
    def gerar_identificador():
        return f'CONT-{uuid.uuid4().hex[:8].upper()}'