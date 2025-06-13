from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
from src.models.paciente import db
from src.models.fornecedor import Fornecedor

class LancamentoFinanceiro(db.Model):
    __tablename__ = 'lancamentos_financeiros'
    
    id = db.Column(db.Integer, primary_key=True)
    tipo = db.Column(db.String(10), nullable=False)  # 'a_receber' ou 'a_pagar'
    contrato_id = db.Column(db.Integer, db.ForeignKey('contratos.id'), nullable=True)
    fornecedor_id = db.Column(db.Integer, db.ForeignKey('fornecedores.id'), nullable=True)
    data_vencimento = db.Column(db.Date, nullable=False)
    data_pagamento = db.Column(db.Date, nullable=True)
    valor = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='pendente')  # 'pendente', 'pago', 'cancelado'
    numero_nota_fiscal = db.Column(db.String(50), nullable=True)
    observacoes = db.Column(db.Text, nullable=True)
    forma_pagamento = db.Column(db.String(55), nullable=True)
    natureza_id = db.Column(db.Integer, db.ForeignKey('natureza_orcamentaria.id'), nullable=False)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    natureza = db.relationship('Natureza', backref='lancamentos_financeiros_natureza', lazy=True)
    
    def __repr__(self):
        return f'<LancamentoFinanceiro {self.id} - {self.tipo}>'
    
    def validar(self):
        """Valida as regras de negócio para lançamentos financeiros"""
        if self.tipo == 'a_receber' and not self.contrato_id:
            return False, "Lançamentos a receber devem estar vinculados a um contrato"
        
        if self.tipo == 'a_pagar' and not self.fornecedor_id:
            return False, "Lançamentos a pagar devem estar vinculados a um fornecedor"
            
        if self.status == 'pago' and not self.data_pagamento:
            return False, "Lançamentos pagos devem ter data de pagamento"
            
        return True, "Lançamento válido"