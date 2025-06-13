from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
from src.models.paciente import db
from src.models.itens import Item
from sqlalchemy.orm import relationship

class ItemSaidaEstoque(db.Model):
    __tablename__ = 'item_saida_estoque'

    id = db.Column(db.Integer, primary_key=True)
    saida_estoque_id = db.Column(db.Integer, db.ForeignKey('saida_estoque.id'))
    item_id = db.Column(db.Integer, db.ForeignKey('itens.id'))
    quantidade = db.Column(db.Float)

    item = relationship("Item", backref="itens_saida")

    def __repr__(self):
        return f'<ItemSaidaEstoque {self.nome}>'