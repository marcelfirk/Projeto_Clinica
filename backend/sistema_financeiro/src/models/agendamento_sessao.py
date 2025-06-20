# Novo Modelo: AgendamentoSessao

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.paciente import db

class AgendamentoSessao(db.Model):
    __tablename__ = 'agendamentos_sessao'
    
    id = db.Column(db.Integer, primary_key=True)
    paciente_id = db.Column(db.Integer, db.ForeignKey('pacientes.id'), nullable=False)
    pacote_tratamento_id = db.Column(db.Integer, db.ForeignKey('pacotes_tratamento.id'), nullable=False)
    data_agendamento = db.Column(db.Date, nullable=False)
    horario_inicio = db.Column(db.Time, nullable=False)
    horario_fim = db.Column(db.Time, nullable=True)
    local_atendimento_id = db.Column(db.Integer, db.ForeignKey('locais_atendimento.id'), nullable=False)
    status_sessao = db.Column(db.String(50), nullable=False, default='agendada')  # agendada, realizada, cancelada, remarcada
    numero_sessao = db.Column(db.Integer, nullable=False)  # 1ª sessão, 2ª sessão, etc.
    observacoes = db.Column(db.Text, nullable=True)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    paciente = db.relationship('Paciente', backref='agendamentos_sessao', lazy=True)
    local_atendimento = db.relationship('LocalAtendimento', backref='agendamentos_sessao', lazy=True)
    # profissional = db.relationship('Profissional', backref='agendamentos_sessao', lazy=True)

    def __repr__(self):
        return f'<AgendamentoSessao {self.id} - Sessão {self.numero_sessao}>'

    def validar(self):
        """Valida as regras de negócio do agendamento de sessão"""
        if self.status_sessao not in ['agendada', 'realizada', 'cancelada', 'remarcada']:
            return False, "Status da sessão deve ser 'agendada', 'realizada', 'cancelada' ou 'remarcada'"
        
        if self.numero_sessao <= 0:
            return False, "Número da sessão deve ser maior que zero"
        
        # Verifica se o número da sessão não excede o total contratado
        if self.pacote_tratamento and self.numero_sessao > self.pacote_tratamento.numero_sessoes_contratadas:
            return False, f"Número da sessão ({self.numero_sessao}) não pode exceder o total contratado ({self.pacote_tratamento.numero_sessoes_contratadas})"
        
        return True, "Válido"

    def to_dict(self):
        return {
            'id': self.id,
            'paciente_id': self.paciente_id,
            'paciente_nome': self.paciente.nome if self.paciente else None,
            'pacote_tratamento_id': self.pacote_tratamento_id,
            'pacote_descricao': self.pacote_tratamento.descricao if self.pacote_tratamento else None,
            'tipo_tratamento_nome': self.pacote_tratamento.tipo_tratamento.nome if self.pacote_tratamento and self.pacote_tratamento.tipo_tratamento else None,
            'data_agendamento': self.data_agendamento.isoformat() if self.data_agendamento else None,
            'horario_inicio': self.horario_inicio.strftime('%H:%M') if self.horario_inicio else None,
            'horario_fim': self.horario_fim.strftime('%H:%M') if self.horario_fim else None,
            'local_atendimento_id': self.local_atendimento_id,
            'local_atendimento_nome': self.local_atendimento.nome if self.local_atendimento else None,
            'status_sessao': self.status_sessao,
            'numero_sessao': self.numero_sessao,
            'observacoes': self.observacoes,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None,
            'data_atualizacao': self.data_atualizacao.isoformat() if self.data_atualizacao else None
        }

