from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
from src.models.paciente import db
from src.models.itens import Item
from sqlalchemy.orm import relationship

class ItemEntradaEstoque(db.Model):
    __tablename__ = 'item_entrada_estoque'

    id = db.Column(db.Integer, primary_key=True)
    entrada_estoque_id = db.Column(db.Integer, db.ForeignKey('entrada_estoque.id'))
    item_id = db.Column(db.Integer, db.ForeignKey('itens.id'))
    quantidade = db.Column(db.Float)
    preco_unitario = db.Column(db.Float)

    item = relationship("Item", backref="itens_entrada")

    def __repr__(self):
        return f'<ItemEntradaEstoque {self.nome}>'