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
    pacote_tratamento_id = db.Column(db.Integer, db.ForeignKey('pacotes_tratamento.id'), nullable=True) 
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

    # Relacionamentos
    natureza = db.relationship('Natureza', backref='lancamentos_financeiros_natureza', lazy=True)
    contrato = db.relationship('Contrato', back_populates='lancamentos')
    fornecedor = db.relationship('Fornecedor', back_populates='lancamentos_financeiros')
    pacote_tratamento = db.relationship('PacoteTratamento', back_populates='lancamentos_tratamentos')
    
    def __repr__(self):
        return f'<LancamentoFinanceiro {self.id} - {self.tipo}>'
    
    def validar(self):
        """Valida as regras de negócio para lançamentos financeiros"""
        if self.tipo == 'a_receber':
                if not self.contrato_id and not self.pacote_tratamento_id:
                    return False, "Lançamentos a receber devem estar vinculados a um contrato ou pacote de tratamento"
                
                if self.contrato_id and self.pacote_tratamento_id:
                    return False, "Lançamento não pode estar vinculado simultaneamente a contrato e pacote de tratamento"
                
        # Para lançamentos a pagar, deve ter fornecedor_id
        if self.tipo == 'a_pagar' and not self.fornecedor_id:
            return False, "Lançamentos a pagar devem estar vinculados a um fornecedor"
            
        if self.status == 'pago' and not self.data_pagamento:
            return False, "Lançamentos pagos devem ter data de pagamento"
            
        return True, "Lançamento válido"

    @property
    def origem_descricao(self):
        """Retorna uma descrição da origem do lançamento"""
        if self.contrato_id and self.contrato:
            return f"Contrato {self.contrato.identificador_contrato}"
        elif self.pacote_tratamento_id and self.pacote_tratamento:
            return f"Pacote: {self.pacote_tratamento.descricao}"
        elif self.fornecedor_id and self.fornecedor:
            return f"Fornecedor: {self.fornecedor.nome}"
        else:
            return "Origem não identificada"

    def to_dict(self):
        return {
            'id': self.id,
            'tipo': self.tipo,
            'contrato_id': self.contrato_id,
            'contrato_identificador': self.contrato.identificador_contrato if self.contrato else None,
            'pacote_tratamento_id': self.pacote_tratamento_id,
            'pacote_tratamento_descricao': self.pacote_tratamento.descricao if self.pacote_tratamento else None,
            'fornecedor_id': self.fornecedor_id,
            'fornecedor_nome': self.fornecedor.nome if self.fornecedor else None,
            'data_vencimento': self.data_vencimento.isoformat() if self.data_vencimento else None,
            'data_pagamento': self.data_pagamento.isoformat() if self.data_pagamento else None,
            'valor': float(self.valor),
            'status': self.status,
            'numero_nota_fiscal': self.numero_nota_fiscal,
            'observacoes': self.observacoes,
            'forma_pagamento': self.forma_pagamento,
            'natureza_id': self.natureza_id,
            'natureza_nome': self.natureza.nome if self.natureza else None,
            'origem_descricao': self.origem_descricao,
            'data_criacao': self.data_criacao.isoformat(),
            'data_atualizacao': self.data_atualizacao.isoformat()
        }

