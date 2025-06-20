# Novo Modelo: TipoTratamento

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.paciente import db

class TipoTratamento(db.Model):
    __tablename__ = 'tipos_tratamento'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False, unique=True)
    descricao = db.Column(db.Text, nullable=True)
    duracao_sessao_minutos = db.Column(db.Integer, nullable=True)  # Duração padrão de uma sessão em minutos
    ativo = db.Column(db.Boolean, default=True)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    pacotes_tratamento = db.relationship('PacoteTratamento', backref='tipo_tratamento', lazy=True)

    def __repr__(self):
        return f'<TipoTratamento {self.nome}>'

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'descricao': self.descricao,
            'duracao_sessao_minutos': self.duracao_sessao_minutos,
            'ativo': self.ativo,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None,
            'data_atualizacao': self.data_atualizacao.isoformat() if self.data_atualizacao else None
        }

