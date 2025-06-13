from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
from src.models.paciente import db
from src.models.lancamento_financeiro import LancamentoFinanceiro
from src.models.fornecedor import Fornecedor
from sqlalchemy.orm import relationship

class EntradaEstoque(db.Model):
    __tablename__ = 'entrada_estoque'

    id = db.Column(db.Integer, primary_key=True)
    data_entrada = db.Column(db.Date, nullable=False)
    fornecedor_id = db.Column(db.Integer, db.ForeignKey('fornecedores.id'))
    forma_pagamento = db.Column(db.String(50))
    valor_total = db.Column(db.Float)
    financeiro_id = db.Column(db.Integer, db.ForeignKey('lancamentos_financeiros.id'))  
    observacoes = db.Column(db.Text)

    itens = relationship("ItemEntradaEstoque", backref="entrada_estoque", cascade="all, delete-orphan")
    fornecedor = db.relationship('Fornecedor', backref='entrada_estoque_fornecedor', lazy=True)

    def __repr__(self):
        return f'<EntradaEstoque {self.nome}>'