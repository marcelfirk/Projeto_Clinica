from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
from src.models.paciente import db
from src.models.agendamento import Agendamento

class SaidaEstoque(db.Model):
    __tablename__ = 'saida_estoque'

    id = db.Column(db.Integer, primary_key=True)
    data_saida = db.Column(db.Date, nullable=False)
    agendamento_id = db.Column(db.Integer, db.ForeignKey('agendamentos.id'))
    observacoes = db.Column(db.Text)

    agendamento = db.relationship('Agendamento', backref='saida_estoque_agendamento', lazy=True)
    itens_saida = db.relationship("ItemSaidaEstoque", backref="saida_estoque", cascade="all, delete-orphan")

    def __repr__(self):
        return f'<SaidaEstoque {self.nome}>'