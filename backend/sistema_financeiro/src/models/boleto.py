from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
from src.models.paciente import db
from src.models.lancamento_financeiro import LancamentoFinanceiro

class Boleto(db.Model):
    __tablename__ = 'boletos'
    
    id = db.Column(db.Integer, primary_key=True)
    lancamento_id = db.Column(db.Integer, db.ForeignKey('lancamentos_financeiros.id'), nullable=False)
    servico = db.Column(db.String(50), nullable=False)
    descricao_servico = db.Column(db.String(100), nullable=False)
    codigo_barras = db.Column(db.String(100), nullable=True)
    linha_digitavel = db.Column(db.String(100), nullable=True)
    invoice_id = db.Column(db.String(100), nullable=True)  
    link_pdf = db.Column(db.String(500), nullable=True)


    # Relacionamentos
    lancamento_financeiro = db.relationship('LancamentoFinanceiro', backref='boleto_lancamento_financeiro', lazy=True)
    
    def __repr__(self):
        return f'<Boleto {self.id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'lancamento_id': self.lancamento_id,
            'servico': self.servico,
            'descricao_servico': self.descricao_servico,
            'codigo_barras': self.codigo_barras,
            'linha_digitavel': self.linha_digitavel,
            'invoice_id': self.invoice_id,
            'link_pdf': self.link_pdf
        }

