# Novo Modelo: PacoteTratamento

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.paciente import db

class PacoteTratamento(db.Model):
    __tablename__ = 'pacotes_tratamento'
    
    id = db.Column(db.Integer, primary_key=True)
    paciente_id = db.Column(db.Integer, db.ForeignKey('pacientes.id'), nullable=False)
    tipo_tratamento_id = db.Column(db.Integer, db.ForeignKey('tipos_tratamento.id'), nullable=False)
    descricao = db.Column(db.String(255), nullable=False)
    data_inicio_tratamento = db.Column(db.Date, nullable=False)
    numero_sessoes_contratadas = db.Column(db.Integer, nullable=False)
    numero_sessoes_realizadas = db.Column(db.Integer, default=0)
    valor_total_pacote = db.Column(db.Float, nullable=False)
    status_pacote = db.Column(db.String(50), nullable=False, default='ativo')  # ativo, concluido, cancelado
    observacoes = db.Column(db.Text, nullable=True)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    paciente = db.relationship('Paciente', backref='pacotes_tratamento', lazy=True)
    lancamentos_financeiros = db.relationship('LancamentoFinanceiro', backref='pacote_tratamento', lazy=True)
    agendamentos_sessao = db.relationship('AgendamentoSessao', backref='pacote_tratamento', lazy=True)

    def __repr__(self):
        return f'<PacoteTratamento {self.id} - {self.descricao}>'

    @property
    def sessoes_restantes(self):
        return self.numero_sessoes_contratadas - self.numero_sessoes_realizadas

    @property
    def percentual_concluido(self):
        if self.numero_sessoes_contratadas == 0:
            return 0
        return (self.numero_sessoes_realizadas / self.numero_sessoes_contratadas) * 100

    def validar(self):
        numero_realizadas = self.numero_sessoes_realizadas or 0
        numero_contratadas = self.numero_sessoes_contratadas or 0

        """Valida as regras de negócio do pacote de tratamento"""
        if numero_realizadas > numero_contratadas:
            return False, "Número de sessões realizadas não pode ser maior que as contratadas"
        
        if self.valor_total_pacote <= 0:
            return False, "Valor total do pacote deve ser maior que zero"
        
        if self.status_pacote not in ['ativo', 'concluido', 'cancelado']:
            return False, "Status do pacote deve ser 'ativo', 'concluido' ou 'cancelado'"
        
        return True, "Válido"

    def to_dict(self):
        return {
            'id': self.id,
            'paciente_id': self.paciente_id,
            'paciente_nome': self.paciente.nome if self.paciente else None,
            'tipo_tratamento_id': self.tipo_tratamento_id,
            'tipo_tratamento_nome': self.tipo_tratamento.nome if self.tipo_tratamento else None,
            'descricao': self.descricao,
            'data_inicio_tratamento': self.data_inicio_tratamento.isoformat() if self.data_inicio_tratamento else None,
            'numero_sessoes_contratadas': self.numero_sessoes_contratadas,
            'numero_sessoes_realizadas': self.numero_sessoes_realizadas,
            'sessoes_restantes': self.sessoes_restantes,
            'percentual_concluido': self.percentual_concluido,
            'valor_total_pacote': float(self.valor_total_pacote),
            'status_pacote': self.status_pacote,
            'observacoes': self.observacoes,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None,
            'data_atualizacao': self.data_atualizacao.isoformat() if self.data_atualizacao else None
        }

